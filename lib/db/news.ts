import { ObjectId, type WithId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { deleteS3Object } from "@/lib/s3";
import { resolvePublicObjectUrl } from "@/lib/s3-public";
import { SEED_NEWS } from "@/lib/seed/news";
import type { News, NewsDocument, NewsInput } from "@/lib/types/news";

export const NEWS_COLLECTION = "news";

function mapNews(doc: WithId<NewsDocument>): News {
  const mediaSrc = doc.mediaKey
    ? resolvePublicObjectUrl(doc.mediaKey) || doc.mediaSrc
    : doc.mediaSrc || "/LogoTenisFuturo.png";

  return {
    id: doc._id.toString(),
    title: doc.title,
    summary: doc.summary ?? "",
    content: doc.content ?? "",
    date: doc.date ?? doc.createdAt.toISOString().slice(0, 10),
    mediaType: doc.mediaType || "image",
    mediaKey: doc.mediaKey,
    mediaSrc,
    author: doc.author ?? "",
    tag: doc.tag ?? "",
    published: doc.published !== false,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function buildDocFromInput(
  input: NewsInput,
  extras: { sortOrder?: number; createdAt?: Date } = {},
): Omit<NewsDocument, "_id"> {
  const now = new Date();
  const date =
    input.date?.trim() ||
    (extras.createdAt ?? now).toISOString().slice(0, 10);

  return {
    title: input.title.trim(),
    summary: input.summary?.trim() || "",
    content: input.content?.trim() || "",
    date,
    mediaType: input.mediaType || "image",
    mediaKey: input.mediaKey?.trim() || undefined,
    mediaSrc: input.mediaSrc?.trim() || "",
    author: input.author?.trim() || undefined,
    tag: input.tag?.trim() || undefined,
    published: input.published !== false,
    sortOrder: extras.sortOrder,
    createdAt: extras.createdAt ?? now,
    updatedAt: now,
  };
}

export async function listNews(options?: {
  publishedOnly?: boolean;
  limit?: number;
}): Promise<News[]> {
  const db = await getDb();
  const filter =
    options?.publishedOnly === false ? {} : { published: { $ne: false } };

  let cursor = db
    .collection<NewsDocument>(NEWS_COLLECTION)
    .find(filter)
    .sort({ date: -1, createdAt: -1 });

  if (options?.limit && options.limit > 0) {
    cursor = cursor.limit(options.limit);
  }

  const docs = await cursor.toArray();
  return docs.map(mapNews);
}

export async function getNewsById(id: string): Promise<News | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db
    .collection<NewsDocument>(NEWS_COLLECTION)
    .findOne({ _id: new ObjectId(id) });
  return doc ? mapNews(doc) : null;
}

export async function createNews(input: NewsInput): Promise<News> {
  const db = await getDb();
  const count = await db.collection(NEWS_COLLECTION).countDocuments();
  const doc = buildDocFromInput(input, { sortOrder: count });

  const result = await db
    .collection<NewsDocument>(NEWS_COLLECTION)
    .insertOne(doc as NewsDocument);

  const inserted = await db
    .collection<NewsDocument>(NEWS_COLLECTION)
    .findOne({ _id: result.insertedId });

  if (!inserted) throw new Error("No se pudo recuperar la noticia creada");
  return mapNews(inserted);
}

export async function updateNews(
  id: string,
  input: Partial<NewsInput>,
): Promise<News | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const existing = await getNewsById(id);
  if (!existing) return null;

  const update: Partial<NewsDocument> = {
    updatedAt: new Date(),
  };

  if (input.title !== undefined) update.title = input.title.trim();
  if (input.summary !== undefined) update.summary = input.summary.trim();
  if (input.content !== undefined) update.content = input.content.trim();
  if (input.date !== undefined) {
    update.date = input.date.trim() || new Date().toISOString().slice(0, 10);
  }
  if (input.mediaType !== undefined) update.mediaType = input.mediaType;
  if (input.mediaKey !== undefined) {
    update.mediaKey = input.mediaKey?.trim() || undefined;
  }
  if (input.mediaSrc !== undefined) update.mediaSrc = input.mediaSrc.trim();
  if (input.author !== undefined) update.author = input.author.trim() || undefined;
  if (input.tag !== undefined) update.tag = input.tag.trim() || undefined;
  if (input.published !== undefined) update.published = input.published;

  // Si cambia el archivo multimedia en S3, borrar el anterior
  if (
    input.mediaKey !== undefined &&
    existing.mediaKey &&
    input.mediaKey?.trim() !== existing.mediaKey
  ) {
    try {
      await deleteS3Object(existing.mediaKey);
    } catch (err) {
      console.error("[updateNews] old media S3 error", err);
    }
  }

  const result = await db
    .collection<NewsDocument>(NEWS_COLLECTION)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" },
    );

  return result ? mapNews(result) : null;
}

export async function deleteNews(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const news = await getNewsById(id);
  const db = await getDb();
  const result = await db
    .collection<NewsDocument>(NEWS_COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 1 && news?.mediaKey) {
    try {
      await deleteS3Object(news.mediaKey);
    } catch (err) {
      console.error("[deleteNews] S3 error", err);
    }
  }

  return result.deletedCount === 1;
}

export async function seedNews(force = false): Promise<{ inserted: number }> {
  const db = await getDb();
  const collection = db.collection<NewsDocument>(NEWS_COLLECTION);
  const existing = await collection.countDocuments();

  if (existing > 0 && !force) {
    return { inserted: 0 };
  }

  if (force && existing > 0) {
    await collection.deleteMany({});
  }

  const now = new Date();
  const docs = SEED_NEWS.map((news, index) =>
    buildDocFromInput(news, { sortOrder: index, createdAt: now }),
  );

  const result = await collection.insertMany(
    docs as unknown as NewsDocument[],
  );
  return { inserted: result.insertedCount };
}

export async function ensureNewsSeed(): Promise<void> {
  try {
    const db = await getDb();
    const count = await db.collection(NEWS_COLLECTION).countDocuments();
    if (count === 0) {
      await seedNews(false);
    }
  } catch (err) {
    console.error("[ensureNewsSeed]", err);
  }
}
