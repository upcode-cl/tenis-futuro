export const PLAYER_CATEGORIES = [
  "Damas Sub 10",
  "Damas Sub 12",
  "Damas Sub 14",
  "Damas Sub 16",
  "Damas Sub 18",
  "Varones Sub 10",
  "Varones Sub 12",
  "Varones Sub 14",
  "Varones Sub 16",
  "Varones Sub 18",
] as const;

export type PlayerCategory = (typeof PLAYER_CATEGORIES)[number];

export const DEFAULT_PLAYER_CATEGORY: PlayerCategory = "Damas Sub 14";
