import type { Player } from "@/lib/types/player";

export function formatWtnSingles(value?: string | null): string {
  const trimmed = value?.trim();
  if (!trimmed) return "Sin registro";
  return trimmed;
}

export function formatTitlesLine(player: Player): string | null {
  const singles = player.singlesTitles;
  const doubles = player.doublesTitles;

  if (singles == null && doubles == null) return null;

  const s = singles ?? 0;
  const d = doubles ?? 0;

  return `${s} Singles | ${d} Dobles`;
}

export function formatTitlesLabel(player: Player): string {
  const year = player.titlesYear ?? new Date().getFullYear();
  return `Títulos ${year}`;
}
