import type { NewsMediaType } from "@/lib/types/news";

export const NEWS_IMAGE_RECOMMENDATION = {
  ratio: "16:9 (panorámica horizontal)",
  resolution: "1200 × 675 px (óptimo) hasta 1920 × 1080 px",
  formats: "JPG, PNG, WebP",
  maxSizeBytes: 5 * 1024 * 1024,
  maxSizeLabel: "5 MB",
  description:
    "Proporción 16:9 recomendada (1200 × 675 px). Se adapta perfectamente a la card y al visor de la noticia.",
};

export const NEWS_VIDEO_RECOMMENDATION = {
  ratio: "16:9 (horizontal panorámico)",
  resolution: "1080p (1920 × 1080) o 720p (1280 × 720)",
  formats: "MP4 (códec H.264)",
  maxSizeBytes: 25 * 1024 * 1024,
  maxSizeLabel: "25 MB",
  description:
    "Video MP4 H.264 panorámico 16:9, máximo 25 MB. Optimizado para reproducción fluida en móviles y escritorio.",
};

export function validateNewsMediaFile(
  mediaType: NewsMediaType,
  file: { size: number; type: string },
): string | null {
  if (mediaType === "image") {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (file.type && !allowed.includes(file.type.toLowerCase())) {
      return "Formato de imagen no soportado. Usa JPG, PNG o WebP.";
    }
    if (file.size > NEWS_IMAGE_RECOMMENDATION.maxSizeBytes) {
      return `La imagen supera el límite máximo de ${NEWS_IMAGE_RECOMMENDATION.maxSizeLabel}.`;
    }
  } else {
    const allowed = ["video/mp4", "video/webm", "video/quicktime"];
    if (file.type && !allowed.includes(file.type.toLowerCase())) {
      return "Formato de video no soportado. Usa MP4 (H.264).";
    }
    if (file.size > NEWS_VIDEO_RECOMMENDATION.maxSizeBytes) {
      return `El video supera el límite máximo de ${NEWS_VIDEO_RECOMMENDATION.maxSizeLabel}.`;
    }
  }
  return null;
}

export function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
