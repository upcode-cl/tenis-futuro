"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  NEWS_IMAGE_RECOMMENDATION,
  NEWS_VIDEO_RECOMMENDATION,
  validateNewsMediaFile,
} from "@/lib/constants/news";
import { resolvePublicObjectUrl } from "@/lib/s3-public";
import type { News, NewsInput, NewsMediaType } from "@/lib/types/news";

const EMPTY_FORM: NewsInput & { id?: string } = {
  title: "",
  summary: "",
  content: "",
  date: new Date().toISOString().slice(0, 10),
  mediaType: "image",
  mediaKey: null,
  mediaSrc: "",
  author: "Tenis Futuro",
  tag: "Fundación",
  published: true,
};

type FormState = NewsInput & { id?: string };

export function NewsAdmin() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [s3Configured, setS3Configured] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const authHeaders = useCallback((): HeadersInit => {
    return { "Content-Type": "application/json" };
  }, []);

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/news?all=1");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cargar noticias");
      setNewsList(data.news ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar noticias");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
    fetch("/api/uploads/news-media")
      .then((r) => r.json())
      .then((d) => setS3Configured(Boolean(d.configured)))
      .catch(() => setS3Configured(false));
  }, [loadNews]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function startNew() {
    setForm(EMPTY_FORM);
    setShowForm(true);
    setMessage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editItem(item: News) {
    setForm({
      id: item.id,
      title: item.title,
      summary: item.summary,
      content: item.content,
      date: item.date,
      mediaType: item.mediaType,
      mediaKey: item.mediaKey ?? null,
      mediaSrc: item.mediaSrc,
      author: item.author ?? "",
      tag: item.tag ?? "",
      published: item.published !== false,
    });
    setShowForm(true);
    setMessage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleMediaUpload(file: File) {
    if (!s3Configured) {
      setError("S3 no configurado. Verifica credenciales AWS.");
      return;
    }

    const validationError = validateNewsMediaFile(form.mediaType, {
      size: file.size,
      type: file.type,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/uploads/news-media", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: form.title || "noticia",
          mediaType: form.mediaType,
          contentType: file.type || (form.mediaType === "video" ? "video/mp4" : "image/jpeg"),
          size: file.size,
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
        throw new Error(`S3 rechazó la subida (${uploadRes.status}).`);
      }

      const publicUrl =
        data.publicUrl ||
        resolvePublicObjectUrl(data.imageKey) ||
        data.imageKey;

      setForm((prev) => ({
        ...prev,
        mediaKey: data.imageKey,
        mediaSrc: publicUrl,
      }));

      setMessage(
        `${form.mediaType === "video" ? "Video" : "Imagen"} subido correctamente a S3.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir archivo");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const payload: NewsInput = {
      title: form.title,
      summary: form.summary,
      content: form.content,
      date: form.date,
      mediaType: form.mediaType,
      mediaKey: form.mediaKey,
      mediaSrc: form.mediaSrc || "/LogoTenisFuturo.png",
      author: form.author,
      tag: form.tag,
      published: form.published !== false,
    };

    try {
      const url = form.id ? `/api/news/${form.id}` : "/api/news";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar");

      setMessage(form.id ? "Noticia actualizada" : "Noticia creada con éxito");
      resetForm();
      await loadNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`¿Eliminar la noticia «${title}»?`)) return;

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo eliminar");

      setMessage("Noticia eliminada");
      if (form.id === id) resetForm();
      await loadNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setSaving(false);
    }
  }

  async function handleSeed(force = false) {
    const msg = force
      ? "¿Reemplazar todas las noticias por los datos de prueba iniciales?"
      : "¿Cargar noticias de prueba si la lista está vacía?";
    if (!confirm(msg)) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/news/seed", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al poblar");
      setMessage(data.message ?? "Noticias iniciales cargadas");
      await loadNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  const resolvedMediaSrc = form.mediaKey
    ? resolvePublicObjectUrl(form.mediaKey) || form.mediaSrc
    : form.mediaSrc;

  return (
    <div className="space-y-8">
      {/* Encabezado y barra de acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold uppercase text-brand-navy">
            Administrador de Noticias
          </h2>
          <p className="mt-1 text-xs text-brand-muted">
            Publica novedades, torneos, actividades y convenios con soporte de fotos y videos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!showForm && (
            <button
              type="button"
              onClick={startNew}
              className="rounded-md bg-brand-lime px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-navy shadow-xs transition hover:bg-brand-lime-dark"
            >
              + Nueva Noticia
            </button>
          )}
          {newsList.length === 0 && (
            <button
              type="button"
              onClick={() => handleSeed(false)}
              className="rounded-md border border-brand-navy/20 bg-white px-3 py-2 text-xs font-semibold text-brand-navy hover:bg-brand-slate"
            >
              Cargar ejemplos
            </button>
          )}
        </div>
      </div>

      {/* Alertas */}
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

      {/* Formulario de Creación / Edición */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-brand-navy/15 bg-white p-6 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between border-b border-brand-navy/10 pb-3">
            <h3 className="text-sm font-extrabold uppercase text-brand-navy">
              {form.id ? "Editar Noticia" : "Nueva Noticia"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-semibold text-brand-muted hover:text-brand-navy"
            >
              ✕ Cancelar
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Título de la noticia *">
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej. Gran actuación en el Torneo Nacional"
                className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Fecha">
                <input
                  type="date"
                  value={form.date ?? ""}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Categoría / Tag">
                <input
                  value={form.tag ?? ""}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  placeholder="Ej. Torneos, Fundación"
                  className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
                />
              </Field>
            </div>
          </div>

          <Field label="Autor o Fuente">
            <input
              value={form.author ?? ""}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Ej. Equipo Técnico, Prensa Tenis Futuro"
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Resumen / Bajada (Se muestra en las cards y antes del texto completo)">
            <textarea
              rows={3}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Breve resumen de la noticia..."
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </Field>

          {/* Sección Multimedia */}
          <div className="rounded-xl border border-brand-navy/15 bg-brand-slate/50 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase text-brand-navy">
                  Archivo Multimedia de la Noticia
                </p>
                <p className="text-xs text-brand-muted">
                  Elige si la cabecera será una imagen o un video.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, mediaType: "image" })}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold uppercase transition ${
                    form.mediaType === "image"
                      ? "bg-brand-navy text-white shadow-xs"
                      : "border border-brand-navy/20 bg-white text-brand-navy hover:bg-brand-slate"
                  }`}
                >
                  📷 Imagen
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, mediaType: "video" })}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold uppercase transition ${
                    form.mediaType === "video"
                      ? "bg-brand-navy text-white shadow-xs"
                      : "border border-brand-navy/20 bg-white text-brand-navy hover:bg-brand-slate"
                  }`}
                >
                  🎬 Video
                </button>
              </div>
            </div>

            {/* Banner con recomendaciones de tamaño */}
            {form.mediaType === "image" ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-blue-950">
                  <span>📐</span> Tamaño recomendado para Imagen:
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-blue-800">
                  <li>
                    <strong>Proporción recomendada:</strong> {NEWS_IMAGE_RECOMMENDATION.ratio}
                  </li>
                  <li>
                    <strong>Resolución óptima:</strong> {NEWS_IMAGE_RECOMMENDATION.resolution}
                  </li>
                  <li>
                    <strong>Formatos y peso:</strong> {NEWS_IMAGE_RECOMMENDATION.formats} (máximo {NEWS_IMAGE_RECOMMENDATION.maxSizeLabel})
                  </li>
                </ul>
              </div>
            ) : (
              <div className="rounded-lg border border-purple-200 bg-purple-50/70 p-3.5 text-xs text-purple-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-purple-950">
                  <span>🎥</span> Tamaño recomendado para Video:
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-purple-800">
                  <li>
                    <strong>Proporción recomendada:</strong> {NEWS_VIDEO_RECOMMENDATION.ratio}
                  </li>
                  <li>
                    <strong>Resolución óptima:</strong> {NEWS_VIDEO_RECOMMENDATION.resolution}
                  </li>
                  <li>
                    <strong>Formatos y peso:</strong> {NEWS_VIDEO_RECOMMENDATION.formats} (máximo {NEWS_VIDEO_RECOMMENDATION.maxSizeLabel})
                  </li>
                </ul>
              </div>
            )}

            {/* Controles de carga y preview */}
            <div className="grid gap-4 sm:grid-cols-[260px_1fr] sm:items-center">
              {/* Preview */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative flex aspect-video w-full max-w-[260px] items-center justify-center overflow-hidden rounded-xl border border-brand-navy/20 bg-black shadow-inner">
                  {resolvedMediaSrc ? (
                    form.mediaType === "video" ? (
                      <video
                        src={resolvedMediaSrc}
                        controls
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <img
                        src={resolvedMediaSrc}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    )
                  ) : (
                    <span className="p-4 text-center text-xs text-white/60">
                      Sin archivo multimedia asignado
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer rounded-md bg-brand-navy px-3 py-1.5 text-xs font-bold uppercase text-white shadow-xs transition hover:bg-brand-navy-deep">
                    {uploading ? "Subiendo…" : `Subir ${form.mediaType === "video" ? "Video" : "Foto"} a S3`}
                    <input
                      type="file"
                      accept={
                        form.mediaType === "video"
                          ? "video/mp4,video/webm"
                          : "image/jpeg,image/png,image/webp"
                      }
                      className="hidden"
                      disabled={uploading || !s3Configured}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleMediaUpload(file);
                      }}
                    />
                  </label>
                  {resolvedMediaSrc && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, mediaKey: null, mediaSrc: "" })}
                      className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>

              {/* URL alternativa */}
              <div className="space-y-3">
                <Field label="URL directa (o pega enlace externo)">
                  <input
                    value={form.mediaSrc}
                    onChange={(e) => setForm({ ...form, mediaSrc: e.target.value })}
                    placeholder="https://... o usa el botón para subir a S3"
                    className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
                  />
                </Field>
                <p className="text-xs text-brand-muted">
                  Si subes el archivo con el botón, se almacena de forma segura en AWS S3 con la clave generada automáticamente.
                </p>
              </div>
            </div>
          </div>

          {/* Contenido completo de la noticia */}
          <Field label="Cuerpo completo de la noticia (Párrafos separados por saltos de línea) *">
            <textarea
              required
              rows={8}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Escribe el desarrollo completo de la noticia..."
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm leading-relaxed"
            />
          </Field>

          {/* Previsualización del texto justificado */}
          {form.content && (
            <div className="rounded-xl border border-brand-navy/10 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                Vista previa del texto (justificado):
              </p>
              <div className="space-y-3 text-sm leading-relaxed text-brand-navy/85 whitespace-pre-line text-justify">
                {form.content}
              </div>
            </div>
          )}

          {/* Checkbox Publicado */}
          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-brand-navy">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="h-4 w-4 rounded border-brand-navy/20 text-brand-navy focus:ring-brand-lime"
            />
            Publicar inmediatamente en el sitio
          </label>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-navy/10">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-brand-navy/20 bg-white px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-slate"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-md bg-brand-lime px-5 py-2 text-sm font-bold uppercase tracking-wider text-brand-navy shadow-xs transition hover:bg-brand-lime-dark disabled:opacity-60"
            >
              {saving ? "Guardando…" : form.id ? "Guardar Cambios" : "Crear Noticia"}
            </button>
          </div>
        </form>
      )}

      {/* Listado de noticias */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
            Noticias registradas ({newsList.length})
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-brand-muted">Cargando noticias…</p>
        ) : newsList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-navy/20 p-12 text-center space-y-3">
            <p className="text-sm text-brand-muted">Aún no hay noticias creadas.</p>
            <button
              type="button"
              onClick={startNew}
              className="rounded-md bg-brand-lime px-4 py-2 text-xs font-bold uppercase text-brand-navy"
            >
              Crear primera noticia
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newsList.map((item) => {
              const src = item.mediaKey
                ? resolvePublicObjectUrl(item.mediaKey) || item.mediaSrc
                : item.mediaSrc;

              return (
                <div
                  key={item.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-brand-navy/10 bg-white shadow-xs transition hover:shadow-md"
                >
                  {/* Media header */}
                  <div className="relative aspect-video w-full overflow-hidden bg-brand-slate">
                    {item.mediaType === "video" ? (
                      <video
                        src={src}
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={src || "/LogoTenisFuturo.png"}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="rounded-md bg-brand-navy/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-lime backdrop-blur-xs">
                        {item.tag || "Noticia"}
                      </span>
                      {item.mediaType === "video" && (
                        <span className="rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                          🎬 Video
                        </span>
                      )}
                    </div>
                    <span
                      className={`absolute top-2.5 right-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        item.published
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.published ? "Publicada" : "Borrador"}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[11px] font-semibold text-brand-muted">
                      {formatDateEs(item.date)} {item.author ? `· Por ${item.author}` : ""}
                    </p>
                    <h4 className="mt-1.5 line-clamp-2 text-sm font-extrabold text-brand-navy">
                      {item.title}
                    </h4>
                    <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-brand-navy/70 text-justify">
                      {item.summary}
                    </p>

                    {/* Actions */}
                    <div className="mt-4 flex items-center justify-between border-t border-brand-navy/10 pt-3">
                      <Link
                        href={`/noticias/${item.id}`}
                        target="_blank"
                        className="text-xs font-semibold text-brand-navy hover:text-brand-lime-dark"
                      >
                        Ver vista previa ↗
                      </Link>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => editItem(item)}
                          className="rounded border border-brand-navy/15 px-2.5 py-1 text-xs font-bold text-brand-navy hover:bg-brand-slate"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.title)}
                          className="rounded border border-red-200 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
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
    <label className="block text-sm">
      <span className="font-semibold text-brand-navy">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function formatDateEs(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
