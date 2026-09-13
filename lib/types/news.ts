export type NewsMediaType = "image" | "video";

export type News = {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  mediaType: NewsMediaType;
  mediaKey?: string;
  mediaSrc: string;
  author?: string;
  tag?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NewsInput = {
  title: string;
  summary: string;
  content: string;
  date?: string;
  mediaType: NewsMediaType;
  mediaKey?: string | null;
  mediaSrc: string;
  author?: string;
  tag?: string;
  published?: boolean;
};

export type NewsDocument = {
  _id: import("mongodb").ObjectId;
  title: string;
  summary: string;
  content: string;
  date: string;
  mediaType: NewsMediaType;
  mediaKey?: string;
  mediaSrc: string;
  author?: string;
  tag?: string;
  published?: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
};
