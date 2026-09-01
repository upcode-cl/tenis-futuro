"use client";

import { useCallback, useEffect, useState } from "react";
import type { Player, PlayerHand, PlayerInput } from "@/lib/types/player";
import {
  DEFAULT_PLAYER_CATEGORY,
  PLAYER_CATEGORIES,
} from "@/lib/constants/player-categories";
import { resolvePublicObjectUrl } from "@/lib/s3-public";

const CURRENT_YEAR = new Date().getFullYear();

const EMPTY_FORM: PlayerInput & { id?: string } = {
  name: "",
  category: DEFAULT_PLAYER_CATEGORY,
  location: "",
  ranking: 1,
  bestNationalRanking: null,
  regionalRanking: null,
  wtnSingles: "",
  titlesYear: CURRENT_YEAR,
  singlesTitles: null,
  doublesTitles: null,
  highlights: ["", "", ""],
  galleryKeys: [],
  bio: "",
  birthDate: "",
  hand: "",
  heightCm: null,
  club: "",
  coach: "",
  playingStyle: "",
  instagram: "",
  published: true,
};

type FormState = PlayerInput & { id?: string };

export function PlayersAdmin() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [s3Configured, setS3Configured] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);

  const authHeaders = useCallback((): HeadersInit => {
    return { "Content-Type": "application/json" };
  }, []);

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/players?all=1");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cargar");
      setPlayers(data.players ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar jugadores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlayers();
    fetch("/api/uploads/player-image")
      .then((r) => r.json())
      .then((d) => setS3Configured(Boolean(d.configured)))
      .catch(() => setS3Configured(false));
  }, [loadPlayers]);

  async function handleSeed(force = false) {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/players/seed", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al poblar datos");
      setMessage(data.message);
      await loadPlayers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al poblar");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  function editPlayer(player: Player) {
    setForm({
      id: player.id,
      name: player.name,
      category: player.category,
      location: player.location,
      ranking: player.ranking,
      bestNationalRanking: player.bestNationalRanking ?? null,
      regionalRanking: player.regionalRanking ?? null,
      wtnSingles: player.wtnSingles ?? "",
      titlesYear: player.titlesYear ?? CURRENT_YEAR,
      singlesTitles: player.singlesTitles ?? null,
      doublesTitles: player.doublesTitles ?? null,
      highlights:
        player.highlights.length >= 3
          ? player.highlights
          : [...player.highlights, "", "", ""].slice(0, 3),
      galleryKeys: player.galleryKeys ?? [],
      imageKey: player.imageKey ?? "",
      bio: player.bio ?? "",
      birthDate: player.birthDate ?? "",
      hand: (player.hand as PlayerHand) ?? "",
      heightCm: player.heightCm ?? null,
      club: player.club ?? "",
      coach: player.coach ?? "",
      playingStyle: player.playingStyle ?? "",
      instagram: player.instagram ?? "",
      published: player.published !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const galleryKeys = form.galleryKeys ?? [];
    const payload: PlayerInput = {
      name: form.name,
      category: form.category,
      location: form.location,
      ranking: Number(form.ranking),
      bestNationalRanking: form.bestNationalRanking,
      regionalRanking: form.regionalRanking,
      wtnSingles: form.wtnSingles,
      titlesYear: form.titlesYear,
      singlesTitles: form.singlesTitles,
      doublesTitles: form.doublesTitles,
      highlights: form.highlights,
      galleryKeys,
      imageKey: galleryKeys[0] ?? "",
      bio: form.bio,
      birthDate: form.birthDate,
      hand: form.hand,
      heightCm: form.heightCm,
      club: form.club,
      coach: form.coach,
      playingStyle: form.playingStyle,
      instagram: form.instagram,
      published: form.published !== false,
    };

    try {
      const url = form.id ? `/api/players/${form.id}` : "/api/players";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar");

      setMessage(form.id ? "Ficha actualizada" : "Jugador creado");
      resetForm();
      await loadPlayers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar a ${name}?`)) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/players/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo eliminar");
      setMessage("Jugador eliminado");
      if (form.id === id) resetForm();
      await loadPlayers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(file: File) {
    if (!s3Configured) {
      setError("S3 no configurado.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const res = await fetch("/api/uploads/player-image", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          playerName: form.name || "jugador",
          contentType: file.type,
          unique: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al preparar subida");

      const uploadRes = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(
          `S3 rechazó la subida (${uploadRes.status}). Revisa CORS del bucket.`,
        );
      }

      setForm((prev) => {
        const galleryKeys = [...(prev.galleryKeys ?? []), data.imageKey];
        return {
          ...prev,
          galleryKeys,
          imageKey: galleryKeys[0],
        };
      });
      setMessage("Imagen agregada. Guarda la ficha para confirmar.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveImage(imageKey: string) {
    if (!confirm("¿Eliminar esta imagen de la ficha?")) return;

    // Si el jugador aún no está guardado, solo quita del formulario
    if (!form.id) {
      setForm((prev) => {
        const galleryKeys = (prev.galleryKeys ?? []).filter((k) => k !== imageKey);
        return { ...prev, galleryKeys, imageKey: galleryKeys[0] ?? "" };
      });
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/players/${form.id}/images`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ imageKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo eliminar");

      setForm((prev) => ({
        ...prev,
        galleryKeys: data.player.galleryKeys ?? [],
        imageKey: data.player.imageKey ?? "",
      }));
      setMessage("Imagen eliminada");
      await loadPlayers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar imagen");
    } finally {
      setSaving(false);
    }
  }

  function setAsPrimary(imageKey: string) {
    setForm((prev) => {
      const rest = (prev.galleryKeys ?? []).filter((k) => k !== imageKey);
      return {
        ...prev,
        galleryKeys: [imageKey, ...rest],
        imageKey,
      };
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-brand-navy/10 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-muted">
          Datos iniciales
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSeed(false)}
            disabled={saving}
            className="rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-navy-deep disabled:opacity-50"
          >
            Cargar datos iniciales
          </button>
          <button
            type="button"
            onClick={() => handleSeed(true)}
            disabled={saving}
            className="rounded-md border border-brand-navy/20 px-4 py-2 text-sm font-semibold text-brand-navy transition hover:bg-brand-slate disabled:opacity-50"
          >
            Reemplazar con datos iniciales
          </button>
        </div>
      </section>

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
          {form.id ? "Editar ficha" : "Nueva ficha de jugador"}
        </h2>
        <p className="mt-1 text-sm text-brand-muted">
          Esta ficha alimenta el home y el perfil público. A futuro podrá
          completarse desde la app.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Nombre">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Categoría">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            >
              {PLAYER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              {form.category &&
                !PLAYER_CATEGORIES.includes(
                  form.category as (typeof PLAYER_CATEGORIES)[number],
                ) && (
                  <option value={form.category}>{form.category}</option>
                )}
            </select>
          </Field>
          <Field label="Ubicación">
            <input
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Ranking nacional actual">
            <input
              required
              type="number"
              min={1}
              value={form.ranking}
              onChange={(e) =>
                setForm({ ...form, ranking: Number(e.target.value) })
              }
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Mejor ranking nacional">
            <input
              type="number"
              min={1}
              value={form.bestNationalRanking ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  bestNationalRanking: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Ranking regional">
            <input
              type="number"
              min={1}
              value={form.regionalRanking ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  regionalRanking: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="WTN Singles">
            <input
              value={form.wtnSingles ?? ""}
              onChange={(e) =>
                setForm({ ...form, wtnSingles: e.target.value })
              }
              placeholder="Ej. 30.31 o Sin registro"
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Año de títulos">
            <input
              type="number"
              min={2000}
              max={2100}
              value={form.titlesYear ?? CURRENT_YEAR}
              onChange={(e) =>
                setForm({
                  ...form,
                  titlesYear: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Títulos singles">
            <input
              type="number"
              min={0}
              value={form.singlesTitles ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  singlesTitles: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Títulos dobles">
            <input
              type="number"
              min={0}
              value={form.doublesTitles ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  doublesTitles: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Fecha de nacimiento">
            <input
              type="date"
              value={form.birthDate ?? ""}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Mano hábil">
            <select
              value={form.hand ?? ""}
              onChange={(e) =>
                setForm({ ...form, hand: e.target.value as PlayerHand })
              }
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            >
              <option value="">—</option>
              <option value="Derecha">Derecha</option>
              <option value="Izquierda">Izquierda</option>
            </select>
          </Field>
          <Field label="Altura (cm)">
            <input
              type="number"
              min={100}
              max={250}
              value={form.heightCm ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  heightCm: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Club / Academia">
            <input
              value={form.club ?? ""}
              onChange={(e) => setForm({ ...form, club: e.target.value })}
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Entrenador">
            <input
              value={form.coach ?? ""}
              onChange={(e) => setForm({ ...form, coach: e.target.value })}
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Estilo de juego">
            <input
              value={form.playingStyle ?? ""}
              onChange={(e) =>
                setForm({ ...form, playingStyle: e.target.value })
              }
              placeholder="Ej. Agresivo desde fondo"
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Instagram (sin @)">
            <input
              value={form.instagram ?? ""}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Biografía">
              <textarea
                rows={4}
                value={form.bio ?? ""}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
                placeholder="Historia, trayectoria, valores…"
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-semibold text-brand-navy">
              Logros destacados (home + perfil)
            </p>
            <div className="space-y-2">
              {(form.highlights ?? ["", "", ""]).map((h, i) => (
                <input
                  key={i}
                  value={h}
                  onChange={(e) => {
                    const highlights = [...(form.highlights ?? [])];
                    highlights[i] = e.target.value;
                    setForm({ ...form, highlights });
                  }}
                  placeholder={`Logro ${i + 1}`}
                  className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
                />
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-semibold text-brand-navy">
              Galería de imágenes
            </p>
            <p className="mb-3 text-xs text-brand-muted">
              La primera es la foto principal del home. Puedes eliminar y volver
              a subir.
            </p>

            <div className="mb-4 flex flex-wrap gap-3">
              {(form.galleryKeys ?? []).map((key, i) => {
                const src = resolvePublicObjectUrl(key);
                return (
                  <div
                    key={key}
                    className="relative w-24 overflow-hidden rounded-lg border border-brand-navy/10 bg-brand-slate"
                  >
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt=""
                        className="aspect-[4/5] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[4/5] items-center justify-center text-[10px] text-brand-muted">
                        sin url
                      </div>
                    )}
                    {i === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-brand-lime px-1.5 py-0.5 text-[9px] font-bold uppercase text-brand-navy">
                        Principal
                      </span>
                    )}
                    <div className="flex flex-col gap-0.5 p-1">
                      {i !== 0 && (
                        <button
                          type="button"
                          onClick={() => setAsPrimary(key)}
                          className="text-[10px] font-semibold text-brand-navy hover:underline"
                        >
                          Principal
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(key)}
                        className="text-[10px] font-semibold text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <label className="inline-flex cursor-pointer items-center rounded-md border border-brand-navy/20 px-4 py-2 text-sm font-semibold text-brand-navy transition hover:bg-brand-slate">
              {uploading ? "Subiendo…" : "Agregar imagen a S3"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploading || !s3Configured}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = "";
                }}
              />
            </label>
            {!s3Configured && (
              <p className="mt-2 text-xs text-amber-700">S3 no configurado.</p>
            )}
          </div>

          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.published !== false}
              onChange={(e) =>
                setForm({ ...form, published: e.target.checked })
              }
            />
            <span className="text-sm font-semibold text-brand-navy">
              Publicado en el sitio
            </span>
          </label>

          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-brand-lime px-5 py-2.5 text-sm font-bold uppercase text-brand-navy transition hover:bg-brand-lime-dark disabled:opacity-50"
            >
              {saving ? "Guardando…" : form.id ? "Actualizar ficha" : "Crear ficha"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-brand-navy/20 px-5 py-2.5 text-sm font-semibold text-brand-navy"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-brand-navy/10 bg-white shadow-sm">
        <div className="border-b border-brand-navy/10 px-6 py-4">
          <h2 className="text-lg font-extrabold uppercase text-brand-navy">
            Jugadores en base ({players.length})
          </h2>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-sm text-brand-muted">Cargando…</p>
        ) : players.length === 0 ? (
          <p className="px-6 py-8 text-sm text-brand-muted">
            No hay jugadores. Usa &quot;Cargar datos iniciales&quot;.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-slate text-xs uppercase tracking-wider text-brand-muted">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Cat.</th>
                  <th className="px-4 py-3">Ranking</th>
                  <th className="px-4 py-3">Fotos</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id} className="border-t border-brand-navy/5">
                    <td className="px-4 py-3 font-semibold text-brand-navy">
                      <a
                        href={`/jugadores/${p.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {p.name}
                      </a>
                    </td>
                    <td className="px-4 py-3">{p.category}</td>
                    <td className="px-4 py-3">#{p.ranking}</td>
                    <td className="px-4 py-3 text-xs text-brand-muted">
                      {p.galleryKeys?.length ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      {p.published !== false ? (
                        <span className="text-green-700">Publicado</span>
                      ) : (
                        <span className="text-amber-700">Borrador</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => editPlayer(p)}
                          className="font-semibold text-brand-navy hover:text-brand-lime-dark"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.name)}
                          className="font-semibold text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-brand-navy">
        {label}
      </span>
      {children}
    </label>
  );
}
