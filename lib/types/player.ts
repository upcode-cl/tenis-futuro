export type PlayerHand = "Derecha" | "Izquierda" | "";

export type Player = {
  id: string;
  name: string;
  category: string;
  location: string;
  ranking: number;
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
