"use client";

import { useEffect, useState } from "react";
import type { SiteColors, SiteSettings } from "@/lib/cms/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import { resolveSiteLogoUrl } from "@/lib/cms/logo";
import { resolvePublicObjectUrl } from "@/lib/s3-public";

const COLOR_FIELDS: { key: keyof SiteColors; label: string; hint: string }[] = [
  { key: "lime", label: "Lima (acento)", hint: "Botones y highlights" },
  { key: "limeDark", label: "Lima oscuro", hint: "Hover / textos lima" },
  { key: "navy", label: "Navy", hint: "Títulos y textos principales" },
  { key: "navyDeep", label: "Navy profundo", hint: "Footer / fondos oscuros" },
  { key: "slate", label: "Slate", hint: "Fondos de sección" },
  { key: "muted", label: "Muted", hint: "Textos secundarios" },
  { key: "background", label: "Fondo", hint: "Fondo general" },
  { key: "foreground", label: "Texto base", hint: "Color de texto por defecto" },
];

export function AppearanceAdmin() {
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [s3Configured, setS3Configured] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cms/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setForm(d.settings);
      })
      .catch(() => setError("No se pudieron cargar los ajustes"))
      .finally(() => setLoading(false));

    fetch("/api/uploads/site-image")
      .then((r) => r.json())
      .then((d) => setS3Configured(Boolean(d.configured)))
      .catch(() => setS3Configured(false));
  }, []);

  function setColor(key: keyof SiteColors, value: string) {
    setForm((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  }

  async function handleLogoUpload(file: File) {
    if (!s3Configured) {
      setError("S3 no configurado.");
      return;
    }
    setUploadingLogo(true);
    setError(null);
    setMessage(null);
    try {
      const contentType = file.type || "image/png";
      const extension = contentType.includes("jpeg") || contentType.includes("jpg")
        ? "jpg"
        : contentType.includes("webp")
          ? "webp"
          : "png";
      const imageKey = `site/logo.${extension}`;

      const res = await fetch("/api/uploads/site-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "logo",
          contentType,
          imageKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al preparar subida");

      const uploadRes = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
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
        logoKey: data.imageKey,
        logoSrc: publicUrl,
      }));
      setMessage(
        "Logo subido a S3. Pulsa «Guardar apariencia» para publicarlo en el sitio.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir logo");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/cms/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      setForm(data.settings);
      setMessage("Apariencia guardada. Recarga el sitio para ver los cambios.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (
      !confirm(
        "¿Restablecer colores, logo y TODO el contenido del home a los valores por defecto?",
      )
    ) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/cms/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al resetear");
      setForm(data.settings);
      setMessage("CMS restablecido a valores por defecto.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al resetear");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-brand-muted">Cargando apariencia…</p>;
  }

  const logoPreview = resolveSiteLogoUrl(form);

  return (
    <form onSubmit={handleSave} className="space-y-8">
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

      <section className="rounded-xl border border-brand-navy/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-extrabold uppercase text-brand-navy">
          Identidad
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-semibold text-brand-navy">Nombre del sitio</span>
            <input
              value={form.siteName}
              onChange={(e) => setForm({ ...form, siteName: e.target.value })}
              className="mt-1 w-full rounded-md border border-brand-navy/15 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-brand-navy">Lema</span>
            <input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="mt-1 w-full rounded-md border border-brand-navy/15 px-3 py-2"
            />
          </label>
        </div>

        <div className="mt-6 rounded-lg border border-brand-navy/10 bg-brand-slate/40 p-4">
          <p className="text-sm font-semibold text-brand-navy">Logo</p>
          <p className="mt-1 text-xs text-brand-muted">
            PNG o WebP recomendado (fondo transparente). Se guarda en{" "}
            <code>site/logo.*</code> y se usa en el header y el login.
          </p>
          {!s3Configured && (
            <p className="mt-2 text-xs text-amber-700">
              S3 no configurado. Revisa NEXT_AWS_* y S3_BUCKET_NAME.
            </p>
          )}
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-24 w-48 items-center justify-center rounded-md bg-brand-navy/90 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoPreview}
                alt="Vista previa del logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-brand-lime px-4 py-2.5 text-sm font-bold uppercase text-brand-navy transition hover:bg-brand-lime-dark has-[:disabled]:opacity-60">
                {uploadingLogo ? "Subiendo…" : "Subir logo a S3"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={uploadingLogo || !s3Configured}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleLogoUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-brand-navy">Key S3</span>
                <input
                  value={form.logoKey ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, logoKey: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-brand-navy/15 px-3 py-2 font-mono text-xs"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-brand-navy">URL pública</span>
                <input
                  value={form.logoSrc ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, logoSrc: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-brand-navy/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-extrabold uppercase text-brand-navy">
          Colores
        </h2>
        <p className="mt-1 text-sm text-brand-muted">
          Usa formato hexadecimal (#FFFFFF). El selector y el campo de texto
          están sincronizados.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {COLOR_FIELDS.map((field) => (
            <label
              key={field.key}
              className="flex items-center gap-3 rounded-lg border border-brand-navy/10 p-3"
            >
              <input
                type="color"
                value={normalizeColorInput(form.colors[field.key])}
                onChange={(e) => setColor(field.key, e.target.value)}
                className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
                aria-label={field.label}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-brand-navy">
                  {field.label}
                </span>
                <span className="block text-xs text-brand-muted">{field.hint}</span>
                <input
                  type="text"
                  value={form.colors[field.key]}
                  onChange={(e) => setColor(field.key, e.target.value)}
                  pattern="^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$"
                  placeholder="#FFFFFF"
                  className="mt-1 w-full rounded-md border border-brand-navy/15 px-2 py-1.5 font-mono text-sm uppercase"
                />
              </span>
            </label>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg bg-brand-slate p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Vista previa
          </span>
          <span
            className="rounded-md px-3 py-2 text-sm font-bold"
            style={{
              background: form.colors.lime,
              color: form.colors.navy,
            }}
          >
            Botón lima
          </span>
          <span
            className="rounded-md px-3 py-2 text-sm font-bold text-white"
            style={{ background: form.colors.navy }}
          >
            Bloque navy
          </span>
          <span
            className="rounded-md px-3 py-2 text-sm"
            style={{
              background: form.colors.slate,
              color: form.colors.muted,
            }}
          >
            Texto muted
          </span>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-brand-lime px-5 py-2.5 text-sm font-bold uppercase text-brand-navy transition hover:bg-brand-lime-dark disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar apariencia"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleReset}
          className="rounded-md border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
        >
          Restablecer CMS
        </button>
      </div>
    </form>
  );
}

function normalizeColorInput(value: string) {
  const v = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    const [, r, g, b] = v;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#000000";
}
