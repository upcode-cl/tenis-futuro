"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SITE_CONTENT } from "@/lib/cms/defaults";
import {
  assertHeroBannerImageFile,
  HERO_IMAGE_MIN_RATIO,
  HERO_IMAGE_MIN_WIDTH,
  HERO_IMAGE_SPECS_LABEL,
  isHeroBannerImage,
  loadImageDimensions,
} from "@/lib/cms/hero-image";
import { applyHeroSlides, heroSlidePreview } from "@/lib/cms/hero-slides";
import type { SiteContent } from "@/lib/cms/types";
import { resolvePublicObjectUrl } from "@/lib/s3-public";

type Tab = "hero" | "about" | "programs" | "support" | "sponsors";
type AdminRole = "admin" | "editor";

const TABS: { id: Tab; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "Quiénes somos" },
  { id: "programs", label: "Programas" },
  { id: "support", label: "Apóyanos" },
  { id: "sponsors", label: "Sponsors" },
];

function withSupportDefaults(content: SiteContent): SiteContent {
  return {
    ...content,
    support: {
      ...DEFAULT_SITE_CONTENT.support,
      ...content.support,
      bankDetails: {
        ...DEFAULT_SITE_CONTENT.support.bankDetails,
        ...(content.support?.bankDetails ?? {}),
      },
      donationModalEnabled:
        typeof content.support?.donationModalEnabled === "boolean"
          ? content.support.donationModalEnabled
          : DEFAULT_SITE_CONTENT.support.donationModalEnabled,
      actions:
        content.support?.actions?.length > 0
          ? content.support.actions
          : DEFAULT_SITE_CONTENT.support.actions,
    },
  };
}

export function ContentAdmin() {
  const [tab, setTab] = useState<Tab>("hero");
  const [form, setForm] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [s3Configured, setS3Configured] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [portraitSlideKeys, setPortraitSlideKeys] = useState<string[]>([]);

  const isAdmin = role === "admin";

  useEffect(() => {
    fetch("/api/cms/content")
      .then((r) => r.json())
      .then((d) => {
        if (d.content) setForm(withSupportDefaults(d.content));
      })
      .catch(() => setError("No se pudo cargar el contenido"))
      .finally(() => setLoading(false));

    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.role === "admin" || d.role === "editor") setRole(d.role);
      })
      .catch(() => setRole(null));

    fetch("/api/uploads/site-image")
      .then((r) => r.json())
      .then((d) => setS3Configured(Boolean(d.configured)))
      .catch(() => setS3Configured(false));
  }, []);

  const heroSlides =
    form.hero.images?.length > 0
      ? form.hero.images
      : form.hero.imageSrc || form.hero.imageKey
        ? [
            {
              imageKey: form.hero.imageKey,
              imageSrc: form.hero.imageSrc,
              imageAlt: form.hero.imageAlt,
            },
          ]
        : [];

  useEffect(() => {
    let cancelled = false;
    const slides = heroSlides;

    void (async () => {
      const rejected: string[] = [];
      await Promise.all(
        slides.map(async (slide, index) => {
          const src = heroSlidePreview(slide);
          const key = `${slide.imageKey ?? slide.imageSrc}-${index}`;
          try {
            const { width, height } = await loadImageDimensions(src);
            if (!isHeroBannerImage(width, height)) rejected.push(key);
          } catch {
            rejected.push(key);
          }
        }),
      );
      if (!cancelled) setPortraitSlideKeys(rejected);
    })();

    return () => {
      cancelled = true;
    };
    // Re-scan when the slide list identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroSlides.map((s) => `${s.imageKey ?? ""}|${s.imageSrc}`).join("\n")]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/cms/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      setForm(withSupportDefaults(data.content));
      setMessage("Contenido guardado. El sitio público se actualizó.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleHeroUpload(file: File) {
    if (!s3Configured) {
      setError("S3 no configurado.");
      return;
    }
    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      await assertHeroBannerImageFile(file);

      const res = await fetch("/api/uploads/site-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "hero",
          contentType: file.type || "image/jpeg",
          unique: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al preparar subida");

      const uploadRes = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/png" },
        body: file,
      });
      if (!uploadRes.ok) {
        throw new Error(
          `S3 rechazó la subida (${uploadRes.status}). Revisa CORS del bucket.`,
        );
      }

      const publicUrl =
        data.publicUrl ||
        resolvePublicObjectUrl(data.imageKey) ||
        data.imageKey;

      setForm((prev) => ({
        ...prev,
        hero: applyHeroSlides(prev.hero, [
          ...(prev.hero.images ?? []),
          {
            imageKey: data.imageKey,
            imageSrc: publicUrl,
            imageAlt: prev.hero.imageAlt,
          },
        ]),
      }));
      setMessage(
        "Imagen panorámica agregada. Pulsa «Guardar contenido» para publicarla.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  function removePortraitHeroSlides() {
    const next = heroSlides.filter((slide, index) => {
      const key = `${slide.imageKey ?? slide.imageSrc}-${index}`;
      return !portraitSlideKeys.includes(key);
    });
    setForm((prev) => ({
      ...prev,
      hero: applyHeroSlides(prev.hero, next),
    }));
    setPortraitSlideKeys([]);
    setMessage(
      "Se quitaron las fotos que no cumplen el formato panorámico. Pulsa «Guardar contenido» para confirmar.",
    );
  }

  async function handleSponsorLogoUpload(index: number, file: File) {
    if (!s3Configured) {
      setError("S3 no configurado.");
      return;
    }
    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const sponsor = form.sponsors.items[index];
      const sponsorName = sponsor?.name || "sponsor";
      const slug = sponsorName
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const res = await fetch("/api/uploads/site-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `sponsor-${slug || "logo"}`,
          contentType: file.type || "image/png",
          unique: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al preparar subida");

      const uploadRes = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/png" },
        body: file,
      });
      if (!uploadRes.ok) {
        throw new Error(`S3 rechazó la subida (${uploadRes.status}).`);
      }

      const publicUrl =
        data.publicUrl ||
        resolvePublicObjectUrl(data.imageKey) ||
        data.imageKey;

      setForm((prev) => {
        const nextItems = [...prev.sponsors.items];
        nextItems[index] = {
          ...nextItems[index],
          logoKey: data.imageKey,
          logoSrc: publicUrl,
        };
        return {
          ...prev,
          sponsors: { ...prev.sponsors, items: nextItems },
        };
      });
      setMessage(
        "Logo de sponsor subido a S3. Pulsa «Guardar contenido» para confirmar.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir logo");
    } finally {
      setUploading(false);
    }
  }

  function addSponsor() {
    setForm((prev) => ({
      ...prev,
      sponsors: {
        ...prev.sponsors,
        items: [
          ...prev.sponsors.items,
          {
            id: `sponsor-${Date.now()}`,
            name: "",
            logoSrc: "",
            url: "",
          },
        ],
      },
    }));
  }

  function removeSponsor(index: number) {
    setForm((prev) => ({
      ...prev,
      sponsors: {
        ...prev.sponsors,
        items: prev.sponsors.items.filter((_, i) => i !== index),
      },
    }));
  }

  function moveSponsor(index: number, direction: -1 | 1) {
    setForm((prev) => {
      const items = [...prev.sponsors.items];
      const target = index + direction;
      if (target < 0 || target >= items.length) return prev;
      const temp = items[index];
      items[index] = items[target];
      items[target] = temp;
      return {
        ...prev,
        sponsors: { ...prev.sponsors, items },
      };
    });
  }

  if (loading) {
    return <p className="text-sm text-brand-muted">Cargando contenido…</p>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {(message || error) && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            error
              ? "border border-red-200 bg-red-50 text-red-800"
              : "border border-green-200 bg-green-50 text-green-800"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <div className="flex flex-wrap gap-1 rounded-lg bg-white p-1 shadow-sm">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              tab === item.id
                ? "bg-brand-navy text-white"
                : "text-brand-muted hover:text-brand-navy"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-brand-navy/10 bg-white p-6 shadow-sm">
        {tab === "hero" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Eyebrow"
              value={form.hero.eyebrow}
              onChange={(v) =>
                setForm({ ...form, hero: { ...form.hero, eyebrow: v } })
              }
            />
            <Field
              label="Título (parte 1)"
              value={form.hero.title}
              onChange={(v) =>
                setForm({ ...form, hero: { ...form.hero, title: v } })
              }
            />
            <Field
              label="Título acento (lima)"
              value={form.hero.titleAccent}
              onChange={(v) =>
                setForm({ ...form, hero: { ...form.hero, titleAccent: v } })
              }
            />
            <Area
              label="Subtítulo"
              value={form.hero.subtitle}
              onChange={(v) =>
                setForm({ ...form, hero: { ...form.hero, subtitle: v } })
              }
              className="sm:col-span-2"
            />

            <div className="sm:col-span-2 rounded-lg border border-brand-navy/10 bg-brand-slate/40 p-4">
              <p className="text-sm font-semibold text-brand-navy">
                Imágenes del slider
              </p>
              <p className="mt-1 text-xs text-brand-muted">
                Solo se aceptan fotos panorámicas horizontales, como la de
                ejemplo del hero: sujeto a la derecha y espacio libre a la
                izquierda para el texto.
              </p>
              <div className="mt-3 rounded-md border border-brand-navy/15 bg-white px-3 py-2.5 text-xs text-brand-navy">
                <p className="font-semibold">Medidas obligatorias</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-brand-muted">
                  <li>
                    Recomendado:{" "}
                    <span className="font-semibold text-brand-navy">
                      {HERO_IMAGE_SPECS_LABEL}
                    </span>{" "}
                    (proporción ~2.3:1)
                  </li>
                  <li>
                    Mínimo: {HERO_IMAGE_MIN_WIDTH}px de ancho y al menos{" "}
                    {HERO_IMAGE_MIN_RATIO}:1 (el doble de ancha que de alta)
                  </li>
                  <li>Formato: JPG, PNG o WebP</li>
                  <li>
                    Si la foto es vertical, cuadrada o poco ancha, se rechaza al
                    subir
                  </li>
                </ul>
              </div>
              {!s3Configured && (
                <p className="mt-2 text-xs text-amber-700">
                  S3 no configurado. Revisa las variables NEXT_AWS_* y
                  S3_BUCKET_NAME.
                </p>
              )}
              {portraitSlideKeys.length > 0 && (
                <div className="mt-3 flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Hay {portraitSlideKeys.length} foto
                    {portraitSlideKeys.length === 1 ? "" : "s"} que no cumplen
                    el formato panorámico y están ocultas.
                  </p>
                  <button
                    type="button"
                    onClick={removePortraitHeroSlides}
                    className="shrink-0 font-semibold underline"
                  >
                    Quitar del contenido
                  </button>
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {heroSlides.map((slide, slideIndex) => {
                  const key = `${slide.imageKey ?? slide.imageSrc}-${slideIndex}`;
                  if (portraitSlideKeys.includes(key)) return null;
                  return (
                    <div
                      key={key}
                      className="overflow-hidden rounded-md border border-brand-navy/10 bg-white"
                    >
                      <div className="relative aspect-[21/9] bg-brand-navy/90">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={heroSlidePreview(slide)}
                          alt={slide.imageAlt || form.hero.imageAlt}
                          className="h-full w-full object-cover object-[70%_center]"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                        <p className="truncate text-[10px] text-brand-muted">
                          {slide.imageKey || "Sin key"}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              hero: applyHeroSlides(
                                prev.hero,
                                (prev.hero.images ?? heroSlides).filter(
                                  (_, i) => i !== slideIndex,
                                ),
                              ),
                            }))
                          }
                          className="shrink-0 text-[10px] font-semibold text-red-700 hover:underline"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  );
                })}
                <label className="flex aspect-[21/9] cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-brand-navy/25 bg-white px-2 text-center text-xs font-semibold text-brand-navy transition hover:border-brand-lime has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                  {uploading ? "Subiendo…" : "Agregar panorámica"}
                  <span className="text-[10px] font-medium text-brand-muted">
                    {HERO_IMAGE_SPECS_LABEL}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={uploading || !s3Configured}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleHeroUpload(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>

            <Field
              label="CTA primario — texto"
              value={form.hero.primaryCta.label}
              onChange={(v) =>
                setForm({
                  ...form,
                  hero: {
                    ...form.hero,
                    primaryCta: { ...form.hero.primaryCta, label: v },
                  },
                })
              }
            />
            <Field
              label="CTA primario — enlace"
              value={form.hero.primaryCta.href}
              onChange={(v) =>
                setForm({
                  ...form,
                  hero: {
                    ...form.hero,
                    primaryCta: { ...form.hero.primaryCta, href: v },
                  },
                })
              }
            />
            <Field
              label="CTA secundario — texto"
              value={form.hero.secondaryCta.label}
              onChange={(v) =>
                setForm({
                  ...form,
                  hero: {
                    ...form.hero,
                    secondaryCta: { ...form.hero.secondaryCta, label: v },
                  },
                })
              }
            />
            <Field
              label="CTA secundario — enlace"
              value={form.hero.secondaryCta.href}
              onChange={(v) =>
                setForm({
                  ...form,
                  hero: {
                    ...form.hero,
                    secondaryCta: { ...form.hero.secondaryCta, href: v },
                  },
                })
              }
            />
            <Area
              label="Alt de imagen"
              value={form.hero.imageAlt}
              onChange={(v) =>
                setForm({ ...form, hero: { ...form.hero, imageAlt: v } })
              }
              className="sm:col-span-2"
            />
          </div>
        )}

        {tab === "about" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Eyebrow"
                value={form.about.eyebrow}
                onChange={(v) =>
                  setForm({ ...form, about: { ...form.about, eyebrow: v } })
                }
              />
              <Field
                label="Título"
                value={form.about.title}
                onChange={(v) =>
                  setForm({ ...form, about: { ...form.about, title: v } })
                }
              />
              <Field
                label="Lema"
                value={form.about.tagline}
                onChange={(v) =>
                  setForm({ ...form, about: { ...form.about, tagline: v } })
                }
                className="sm:col-span-2"
              />
            </div>
            <Area
              label="Párrafos (separados por línea en blanco)"
              value={form.about.paragraphs.join("\n\n")}
              onChange={(v) =>
                setForm({
                  ...form,
                  about: {
                    ...form.about,
                    paragraphs: splitBlocks(v),
                  },
                })
              }
              rows={8}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Visión — título"
                value={form.about.visionTitle}
                onChange={(v) =>
                  setForm({
                    ...form,
                    about: { ...form.about, visionTitle: v },
                  })
                }
              />
              <Field
                label="Visión — titular"
                value={form.about.visionHeadline}
                onChange={(v) =>
                  setForm({
                    ...form,
                    about: { ...form.about, visionHeadline: v },
                  })
                }
              />
            </div>
            <Area
              label="Visión — cuerpo"
              value={form.about.visionBody}
              onChange={(v) =>
                setForm({ ...form, about: { ...form.about, visionBody: v } })
              }
            />
            <ListEditor
              label="Pilares (título | subtítulo | cuerpo)"
              hint="Una línea por pilar, separados por |"
              items={form.about.pillars.map(
                (p) => `${p.title} | ${p.subtitle ?? ""} | ${p.body}`,
              )}
              onChange={(lines) =>
                setForm({
                  ...form,
                  about: {
                    ...form.about,
                    pillars: lines.map((line, i) => {
                      const [title, subtitle, ...rest] = line
                        .split("|")
                        .map((s) => s.trim());
                      return {
                        title: title || `Pilar ${i + 1}`,
                        subtitle: subtitle || "",
                        body: rest.join(" | ") || "",
                      };
                    }),
                  },
                })
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Impacto — eyebrow"
                value={form.about.impactEyebrow}
                onChange={(v) =>
                  setForm({
                    ...form,
                    about: { ...form.about, impactEyebrow: v },
                  })
                }
              />
              <Field
                label="Impacto — título"
                value={form.about.impactTitle}
                onChange={(v) =>
                  setForm({
                    ...form,
                    about: { ...form.about, impactTitle: v },
                  })
                }
              />
            </div>
            <Area
              label="Impacto — intro"
              value={form.about.impactIntro}
              onChange={(v) =>
                setForm({ ...form, about: { ...form.about, impactIntro: v } })
              }
            />
            <Area
              label="Impacto — ítems (uno por línea)"
              value={form.about.impactItems.join("\n")}
              onChange={(v) =>
                setForm({
                  ...form,
                  about: {
                    ...form.about,
                    impactItems: v
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                })
              }
              rows={8}
            />
            <Field
              label="Propósito — eyebrow"
              value={form.about.purposeEyebrow}
              onChange={(v) =>
                setForm({
                  ...form,
                  about: { ...form.about, purposeEyebrow: v },
                })
              }
            />
            <Area
              label="Propósito — cuerpo"
              value={form.about.purposeBody}
              onChange={(v) =>
                setForm({ ...form, about: { ...form.about, purposeBody: v } })
              }
            />
            <Field
              label="Propósito — pie"
              value={form.about.purposeFooter}
              onChange={(v) =>
                setForm({
                  ...form,
                  about: { ...form.about, purposeFooter: v },
                })
              }
            />
          </div>
        )}

        {tab === "programs" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Eyebrow"
                value={form.programs.eyebrow}
                onChange={(v) =>
                  setForm({
                    ...form,
                    programs: { ...form.programs, eyebrow: v },
                  })
                }
              />
              <Field
                label="Título"
                value={form.programs.title}
                onChange={(v) =>
                  setForm({
                    ...form,
                    programs: { ...form.programs, title: v },
                  })
                }
              />
            </div>
            <Area
              label="Intro"
              value={form.programs.intro}
              onChange={(v) =>
                setForm({
                  ...form,
                  programs: { ...form.programs, intro: v },
                })
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Etapa 1 — etiqueta"
                value={form.programs.stageOneLabel}
                onChange={(v) =>
                  setForm({
                    ...form,
                    programs: { ...form.programs, stageOneLabel: v },
                  })
                }
              />
              <Field
                label="Etapa 1 — título"
                value={form.programs.stageOneTitle}
                onChange={(v) =>
                  setForm({
                    ...form,
                    programs: { ...form.programs, stageOneTitle: v },
                  })
                }
              />
              <Field
                label="Etapa 1 — subtítulo"
                value={form.programs.stageOneSubtitle}
                onChange={(v) =>
                  setForm({
                    ...form,
                    programs: { ...form.programs, stageOneSubtitle: v },
                  })
                }
                className="sm:col-span-2"
              />
            </div>
            <Area
              label="Etapa 1 — cuerpo"
              value={form.programs.stageOneBody}
              onChange={(v) =>
                setForm({
                  ...form,
                  programs: { ...form.programs, stageOneBody: v },
                })
              }
            />
            <Area
              label="Objetivo"
              value={form.programs.stageOneObjective}
              onChange={(v) =>
                setForm({
                  ...form,
                  programs: { ...form.programs, stageOneObjective: v },
                })
              }
            />
            <Area
              label="Impacto esperado"
              value={form.programs.stageOneImpact}
              onChange={(v) =>
                setForm({
                  ...form,
                  programs: { ...form.programs, stageOneImpact: v },
                })
              }
            />
            <ListEditor
              label="Ítems etapa 1 (título | cuerpo)"
              items={form.programs.stageOneItems.map(
                (i) => `${i.title} | ${i.body}`,
              )}
              onChange={(lines) =>
                setForm({
                  ...form,
                  programs: {
                    ...form.programs,
                    stageOneItems: lines.map((line, idx) => {
                      const [title, ...rest] = line
                        .split("|")
                        .map((s) => s.trim());
                      return {
                        title: title || `Ítem ${idx + 1}`,
                        body: rest.join(" | "),
                      };
                    }),
                  },
                })
              }
            />
            <Field
              label="Próximas etapas — eyebrow"
              value={form.programs.futureEyebrow}
              onChange={(v) =>
                setForm({
                  ...form,
                  programs: { ...form.programs, futureEyebrow: v },
                })
              }
            />
            <Field
              label="Próximas etapas — título"
              value={form.programs.futureTitle}
              onChange={(v) =>
                setForm({
                  ...form,
                  programs: { ...form.programs, futureTitle: v },
                })
              }
            />
            <ListEditor
              label="Etapas futuras (código | título | cuerpo)"
              items={form.programs.futureStages.map(
                (s) => `${s.stage} | ${s.title} | ${s.body}`,
              )}
              onChange={(lines) =>
                setForm({
                  ...form,
                  programs: {
                    ...form.programs,
                    futureStages: lines.map((line, idx) => {
                      const [stage, title, ...rest] = line
                        .split("|")
                        .map((s) => s.trim());
                      return {
                        stage: stage || String(idx + 2).padStart(2, "0"),
                        title: title || `Etapa ${idx + 2}`,
                        body: rest.join(" | "),
                      };
                    }),
                  },
                })
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Etapa final — etiqueta"
                value={form.programs.finalLabel}
                onChange={(v) =>
                  setForm({
                    ...form,
                    programs: { ...form.programs, finalLabel: v },
                  })
                }
              />
              <Field
                label="Etapa final — título"
                value={form.programs.finalTitle}
                onChange={(v) =>
                  setForm({
                    ...form,
                    programs: { ...form.programs, finalTitle: v },
                  })
                }
              />
            </div>
            <Area
              label="Etapa final — cuerpo"
              value={form.programs.finalBody}
              onChange={(v) =>
                setForm({
                  ...form,
                  programs: { ...form.programs, finalBody: v },
                })
              }
            />
            <Field
              label="CTA final — texto"
              value={form.programs.finalCta.label}
              onChange={(v) =>
                setForm({
                  ...form,
                  programs: {
                    ...form.programs,
                    finalCta: { ...form.programs.finalCta, label: v },
                  },
                })
              }
            />
            <Field
              label="CTA final — enlace"
              value={form.programs.finalCta.href}
              onChange={(v) =>
                setForm({
                  ...form,
                  programs: {
                    ...form.programs,
                    finalCta: { ...form.programs.finalCta, href: v },
                  },
                })
              }
            />
          </div>
        )}

        {tab === "support" && (
          <div className="space-y-6">
            <Field
              label="Eyebrow"
              value={form.support.eyebrow}
              onChange={(v) =>
                setForm({
                  ...form,
                  support: { ...form.support, eyebrow: v },
                })
              }
            />
            <Field
              label="Título"
              value={form.support.title}
              onChange={(v) =>
                setForm({
                  ...form,
                  support: { ...form.support, title: v },
                })
              }
            />
            <Area
              label="Cuerpo"
              value={form.support.body}
              onChange={(v) =>
                setForm({
                  ...form,
                  support: { ...form.support, body: v },
                })
              }
            />
            <ListEditor
              label="Acciones (id | título | cuerpo | cta | href)"
              items={form.support.actions.map(
                (a) =>
                  `${a.id} | ${a.title} | ${a.body} | ${a.cta} | ${a.href}`,
              )}
              onChange={(lines) =>
                setForm({
                  ...form,
                  support: {
                    ...form.support,
                    actions: lines.map((line, idx) => {
                      const parts = line.split("|").map((s) => s.trim());
                      return {
                        id: parts[0] || `action-${idx + 1}`,
                        title: parts[1] || `Acción ${idx + 1}`,
                        body: parts[2] || "",
                        cta: parts[3] || "Ver más",
                        href: parts[4] || "#contacto",
                      };
                    }),
                  },
                })
              }
            />

            {isAdmin ? (
              <div className="space-y-4 rounded-xl border border-brand-navy/15 bg-brand-slate/50 p-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-brand-navy">
                    Modal «Haz tu aporte» — datos bancarios
                  </h3>
                  <p className="mt-1 text-xs text-brand-muted">
                    Solo el administrador puede habilitar el modal y editar los
                    datos de transferencia que verán los visitantes.
                  </p>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-brand-navy/10 bg-white px-3 py-3">
                  <input
                    type="checkbox"
                    checked={form.support.donationModalEnabled}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        support: {
                          ...form.support,
                          donationModalEnabled: e.target.checked,
                        },
                      })
                    }
                    className="mt-0.5 h-4 w-4 accent-brand-navy"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-brand-navy">
                      Habilitar modal de aporte
                    </span>
                    <span className="mt-0.5 block text-xs text-brand-muted">
                      Si está activo, el botón «Haz tu aporte» abre el modal con
                      estos datos. Si está desactivado, el botón vuelve a
                      navegar a la sección Apóyanos / Contacto.
                    </span>
                  </span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Banco"
                    value={form.support.bankDetails.bankName}
                    placeholder="Ej. Banco de Chile"
                    onChange={(v) =>
                      setForm({
                        ...form,
                        support: {
                          ...form.support,
                          bankDetails: {
                            ...form.support.bankDetails,
                            bankName: v,
                          },
                        },
                      })
                    }
                  />
                  <Field
                    label="Tipo de cuenta"
                    value={form.support.bankDetails.accountType}
                    placeholder="Cuenta corriente / Vista / Ahorro"
                    onChange={(v) =>
                      setForm({
                        ...form,
                        support: {
                          ...form.support,
                          bankDetails: {
                            ...form.support.bankDetails,
                            accountType: v,
                          },
                        },
                      })
                    }
                  />
                  <Field
                    label="Número de cuenta"
                    value={form.support.bankDetails.accountNumber}
                    placeholder="000000000"
                    onChange={(v) =>
                      setForm({
                        ...form,
                        support: {
                          ...form.support,
                          bankDetails: {
                            ...form.support.bankDetails,
                            accountNumber: v,
                          },
                        },
                      })
                    }
                  />
                  <Field
                    label="RUT"
                    value={form.support.bankDetails.rut}
                    placeholder="12.345.678-9"
                    onChange={(v) =>
                      setForm({
                        ...form,
                        support: {
                          ...form.support,
                          bankDetails: {
                            ...form.support.bankDetails,
                            rut: v,
                          },
                        },
                      })
                    }
                  />
                  <Field
                    label="Nombre del titular"
                    value={form.support.bankDetails.holderName}
                    placeholder="Fundación Tenis Futuro"
                    onChange={(v) =>
                      setForm({
                        ...form,
                        support: {
                          ...form.support,
                          bankDetails: {
                            ...form.support.bankDetails,
                            holderName: v,
                          },
                        },
                      })
                    }
                    className="sm:col-span-2"
                  />
                  <Field
                    label="Email (comprobantes)"
                    value={form.support.bankDetails.email}
                    placeholder="aporte@tenisfuturo.cl"
                    onChange={(v) =>
                      setForm({
                        ...form,
                        support: {
                          ...form.support,
                          bankDetails: {
                            ...form.support.bankDetails,
                            email: v,
                          },
                        },
                      })
                    }
                    className="sm:col-span-2"
                  />
                </div>
                <Area
                  label="Notas / instrucciones (opcional)"
                  value={form.support.bankDetails.notes}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      support: {
                        ...form.support,
                        bankDetails: {
                          ...form.support.bankDetails,
                          notes: v,
                        },
                      },
                    })
                  }
                  rows={3}
                />
              </div>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                Los datos bancarios y la activación del modal de aporte solo
                pueden configurarlos usuarios con rol <strong>administrador</strong>.
              </div>
            )}
          </div>
        )}

        {tab === "sponsors" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Eyebrow"
                value={form.sponsors.eyebrow}
                onChange={(v) =>
                  setForm({
                    ...form,
                    sponsors: { ...form.sponsors, eyebrow: v },
                  })
                }
              />
              <Field
                label="Título"
                value={form.sponsors.title}
                onChange={(v) =>
                  setForm({
                    ...form,
                    sponsors: { ...form.sponsors, title: v },
                  })
                }
              />
            </div>
            <Area
              label="Descripción"
              value={form.sponsors.description}
              onChange={(v) =>
                setForm({
                  ...form,
                  sponsors: { ...form.sponsors, description: v },
                })
              }
            />

            {/* Banner de estandarización automática y reglas */}
            <div className="rounded-xl border border-brand-navy/15 bg-brand-slate/60 p-4 text-xs text-brand-navy/90 space-y-2">
              <p className="font-bold text-sm text-brand-navy flex items-center gap-1.5">
                <span>✨</span> Estandarización automática y reglas visuales
              </p>
              <ul className="list-disc pl-5 space-y-1 text-brand-muted">
                <li>
                  <strong className="text-brand-navy">Estandarización automática:</strong> Cada logo se ajusta y centra de manera automática en un recuadro estándar (máx. 160×44 px) sin recortarse ni deformarse.
                </li>
                <li>
                  <strong className="text-brand-navy">3 o menos sponsors:</strong> Se alinean automáticamente al centro de la pantalla con un acabado en escala de grises para uniformar colores heterogéneos.
                </li>
                <li>
                  <strong className="text-brand-navy">Más de 3 sponsors:</strong> Se activa el carrusel animado con Motion con loop infinito y controles de desplazamiento.
                </li>
                <li>
                  <strong className="text-brand-navy">Formato recomendado:</strong> PNG con fondo transparente o SVG vectorial.
                </li>
              </ul>
            </div>

            {/* Listado de sponsors */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-brand-navy">
                    Logos de Sponsors ({form.sponsors.items.length})
                  </h3>
                  <p className="text-xs text-brand-muted">
                    {form.sponsors.items.length <= 3
                      ? "Modo actual: Centrado en gris (3 o menos)."
                      : "Modo actual: Carrusel animado con Motion (más de 3)."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSponsor}
                  className="rounded-md bg-brand-navy px-3.5 py-1.5 text-xs font-bold uppercase text-white transition hover:bg-brand-navy-deep"
                >
                  + Agregar sponsor
                </button>
              </div>

              {form.sponsors.items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-brand-navy/20 p-8 text-center">
                  <p className="text-sm text-brand-muted">
                    Aún no hay sponsors configurados.
                  </p>
                  <button
                    type="button"
                    onClick={addSponsor}
                    className="mt-3 rounded-md bg-brand-lime px-4 py-2 text-xs font-bold uppercase text-brand-navy"
                  >
                    Agregar primer sponsor
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.sponsors.items.map((sponsor, idx) => {
                    const resolvedSrc = sponsor.logoKey
                      ? resolvePublicObjectUrl(sponsor.logoKey) || sponsor.logoSrc
                      : sponsor.logoSrc;

                    return (
                      <div
                        key={sponsor.id || `sponsor-${idx}`}
                        className="rounded-xl border border-brand-navy/15 bg-white p-4 shadow-xs space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-brand-navy/10 pb-2">
                          <span className="text-xs font-extrabold uppercase text-brand-navy">
                            Sponsor #{idx + 1} {sponsor.name ? `— ${sponsor.name}` : ""}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              title="Subir posición"
                              disabled={idx === 0}
                              onClick={() => moveSponsor(idx, -1)}
                              className="rounded border border-brand-navy/15 px-2 py-0.5 text-xs font-bold text-brand-navy disabled:opacity-30 hover:bg-brand-slate"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              title="Bajar posición"
                              disabled={idx === form.sponsors.items.length - 1}
                              onClick={() => moveSponsor(idx, 1)}
                              className="rounded border border-brand-navy/15 px-2 py-0.5 text-xs font-bold text-brand-navy disabled:opacity-30 hover:bg-brand-slate"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSponsor(idx)}
                              className="rounded border border-red-200 px-2 py-0.5 text-xs font-bold text-red-600 hover:bg-red-50"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
                          {/* Vista previa estandarizada */}
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex h-20 w-44 items-center justify-center rounded-xl border border-brand-navy/15 bg-brand-slate/40 p-2 shadow-inner">
                              {resolvedSrc ? (
                                <img
                                  src={resolvedSrc}
                                  alt={sponsor.name || "Preview"}
                                  className="max-h-12 max-w-[140px] w-auto h-auto object-contain filter grayscale contrast-75 brightness-95 opacity-70 hover:opacity-100 hover:grayscale-0 transition duration-200"
                                />
                              ) : (
                                <span className="text-center text-[11px] font-semibold text-brand-muted">
                                  Sin logo asignado
                                </span>
                              )}
                            </div>
                            <label className="cursor-pointer rounded-md border border-brand-navy/20 bg-white px-3 py-1 text-center text-xs font-semibold text-brand-navy transition hover:bg-brand-slate">
                              {uploading ? "Subiendo…" : "Subir logo a S3"}
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                className="hidden"
                                disabled={uploading || !s3Configured}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleSponsorLogoUpload(idx, file);
                                }}
                              />
                            </label>
                          </div>

                          {/* Campos de texto */}
                          <div className="space-y-3">
                            <Field
                              label="Nombre del sponsor"
                              value={sponsor.name}
                              placeholder="Ej. Banco de Chile, Babolat, Wilson"
                              onChange={(val) => {
                                const next = [...form.sponsors.items];
                                next[idx] = { ...next[idx], name: val };
                                setForm({
                                  ...form,
                                  sponsors: { ...form.sponsors, items: next },
                                });
                              }}
                            />
                            <Field
                              label="Enlace web del sponsor (opcional)"
                              value={sponsor.url ?? ""}
                              placeholder="https://ejemplo.cl"
                              onChange={(val) => {
                                const next = [...form.sponsors.items];
                                next[idx] = { ...next[idx], url: val };
                                setForm({
                                  ...form,
                                  sponsors: { ...form.sponsors, items: next },
                                });
                              }}
                            />
                            <Field
                              label="URL del logo (o ruta relativa)"
                              value={sponsor.logoSrc}
                              placeholder="https://... o sube arriba a S3"
                              onChange={(val) => {
                                const next = [...form.sponsors.items];
                                next[idx] = { ...next[idx], logoSrc: val };
                                setForm({
                                  ...form,
                                  sponsors: { ...form.sponsors, items: next },
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-brand-lime px-5 py-2.5 text-sm font-bold uppercase text-brand-navy transition hover:bg-brand-lime-dark disabled:opacity-60"
      >
        {saving ? "Guardando…" : "Guardar contenido"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-semibold text-brand-navy">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-brand-navy/15 px-3 py-2"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 4,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-semibold text-brand-navy">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-brand-navy/15 px-3 py-2"
      />
    </label>
  );
}

function ListEditor({
  label,
  items,
  onChange,
  hint,
}: {
  label: string;
  items: string[];
  onChange: (lines: string[]) => void;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-brand-navy">{label}</span>
      {hint ? (
        <span className="mt-0.5 block text-xs text-brand-muted">{hint}</span>
      ) : null}
      <textarea
        value={items.join("\n")}
        rows={Math.max(4, items.length + 1)}
        onChange={(e) =>
          onChange(
            e.target.value
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
        className="mt-1 w-full rounded-md border border-brand-navy/15 px-3 py-2 font-mono text-xs"
      />
    </label>
  );
}

function splitBlocks(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}
