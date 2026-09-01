export type PlayerHand = "Derecha" | "Izquierda" | "";

export type Player = {
  id: string;
  name: string;
  category: string;
  location: string;
  /** Ranking nacional actual */
  ranking: number;
  /** Mejor ranking nacional histórico */
  bestNationalRanking?: number;
  /** Ranking regional actual */
  regionalRanking?: number;
  /** WTN Singles (número o texto; vacío = sin registro) */
  wtnSingles?: string;
  /** Año de los títulos reportados (ej. 2026) */
  titlesYear?: number;
  singlesTitles?: number;
  doublesTitles?: number;
  /** Logros que se muestran en cards / home */
  highlights: string[];
  /** Foto principal (compat + primera de gallery) */
  imageKey?: string;
  imageSrc?: string;
  /** Galería completa (keys S3); la primera es la principal */
  galleryKeys: string[];
  gallerySrcs: string[];
  /** Ficha completa */
  bio?: string;
  birthDate?: string;
  hand?: PlayerHand;
  heightCm?: number;
  club?: string;
  coach?: string;
  playingStyle?: string;
  instagram?: string;
  published: boolean;
};

export type PlayerInput = {
  name: string;
  category: string;
  location: string;
  ranking: number;
  bestNationalRanking?: number | null;
  regionalRanking?: number | null;
  wtnSingles?: string;
  titlesYear?: number | null;
  singlesTitles?: number | null;
  doublesTitles?: number | null;
  highlights: string[];
  imageKey?: string;
  galleryKeys?: string[];
  bio?: string;
  birthDate?: string;
  hand?: PlayerHand;
  heightCm?: number | null;
  club?: string;
  coach?: string;
  playingStyle?: string;
  instagram?: string;
  published?: boolean;
};

export type PlayerDocument = {
  _id: import("mongodb").ObjectId;
  name: string;
  category: string;
  location: string;
  ranking: number;
  bestNationalRanking?: number;
  regionalRanking?: number;
  wtnSingles?: string;
  titlesYear?: number;
  singlesTitles?: number;
  doublesTitles?: number;
  highlights: string[];
  /** @deprecated prefer galleryKeys[0] */
  imageKey?: string;
  galleryKeys?: string[];
  bio?: string;
  birthDate?: string;
  hand?: PlayerHand;
  heightCm?: number;
  club?: string;
  coach?: string;
  playingStyle?: string;
  instagram?: string;
  published?: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
};
