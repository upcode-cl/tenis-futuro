/** Límite duro de video corto por jugador (cliente + API). */
export const PLAYER_VIDEO_MAX_BYTES = 25 * 1024 * 1024; // 25 MB
export const PLAYER_VIDEO_MAX_LABEL = "25 MB";
export const PLAYER_VIDEO_ALLOWED_TYPES = ["video/mp4"] as const;

export const PLAYER_VIDEO_ORIENTATIONS = ["horizontal", "vertical"] as const;
export type PlayerVideoOrientation = (typeof PLAYER_VIDEO_ORIENTATIONS)[number];
export const DEFAULT_PLAYER_VIDEO_ORIENTATION: PlayerVideoOrientation =
  "horizontal";

export function isPlayerVideoOrientation(
  value: unknown,
): value is PlayerVideoOrientation {
  return (
    typeof value === "string" &&
    PLAYER_VIDEO_ORIENTATIONS.includes(value as PlayerVideoOrientation)
  );
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validatePlayerVideoFile(file: {
  size: number;
  type: string;
}): string | null {
  if (!PLAYER_VIDEO_ALLOWED_TYPES.includes(file.type as "video/mp4")) {
    return "Solo se permite video MP4 (H.264).";
  }
  if (file.size <= 0) {
    return "El archivo de video está vacío.";
  }
  if (file.size > PLAYER_VIDEO_MAX_BYTES) {
    return `El video supera ${PLAYER_VIDEO_MAX_LABEL} (${formatBytes(file.size)}). Comprime o acorta el archivo antes de subir.`;
  }
  return null;
}
