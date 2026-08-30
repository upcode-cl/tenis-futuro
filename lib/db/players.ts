import { ObjectId, type WithId } from "mongodb";
import { getDb, PLAYERS_COLLECTION } from "@/lib/mongodb";
import { deleteS3Object, resolvePublicObjectUrl } from "@/lib/s3";
import { SEED_PLAYERS } from "@/lib/seed/players";
import type {
  Player,
  PlayerDocument,
  PlayerHand,
  PlayerInput,
} from "@/lib/types/player";

function normalizeGalleryKeys(doc: WithId<PlayerDocument>): string[] {
  const fromGallery = (doc.galleryKeys ?? []).map((k) => k.trim()).filter(Boolean);
  if (fromGallery.length > 0) return Array.from(new Set(fromGallery));
  if (doc.imageKey?.trim()) return [doc.imageKey.trim()];
  return [];
}

function mapPlayer(doc: WithId<PlayerDocument>): Player {
  const galleryKeys = normalizeGalleryKeys(doc);
  const imageKey = galleryKeys[0];
  return {
    id: doc._id.toString(),
    name: doc.name,
    category: doc.category,
    location: doc.location,
    ranking: doc.ranking,
    highlights: doc.highlights ?? [],
    imageKey,
    imageSrc: resolvePublicObjectUrl(imageKey),
    galleryKeys,
    gallerySrcs: galleryKeys
      .map((k) => resolvePublicObjectUrl(k))
      .filter((u): u is string => Boolean(u)),
    bio: doc.bio ?? "",
    birthDate: doc.birthDate ?? "",
    hand: (doc.hand as PlayerHand) ?? "",
    heightCm: doc.heightCm,
    club: doc.club ?? "",
    coach: doc.coach ?? "",
    playingStyle: doc.playingStyle ?? "",
    instagram: doc.instagram ?? "",
    published: doc.published !== false,
  };
}

function sanitizeHighlights(highlights: string[]): string[] {
  return highlights
    .map((h) => h.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function sanitizeGalleryKeys(keys?: string[]): string[] {
  return Array.from(
    new Set((keys ?? []).map((k) => k.trim()).filter(Boolean)),
  ).slice(0, 12);
}

function buildDocFromInput(
  input: PlayerInput,
  extras: { sortOrder?: number; createdAt?: Date } = {},
): Omit<PlayerDocument, "_id"> {
  const galleryKeys = sanitizeGalleryKeys(
    input.galleryKeys?.length
      ? input.galleryKeys
      : input.imageKey
        ? [input.imageKey]
        : [],
  );
  const now = new Date();

  return {
    name: input.name.trim(),
    category: input.category.trim(),
    location: input.location.trim(),
    ranking: input.ranking,
    highlights: sanitizeHighlights(input.highlights),
    imageKey: galleryKeys[0],
    galleryKeys,
    bio: input.bio?.trim() || undefined,
    birthDate: input.birthDate?.trim() || undefined,
    hand: input.hand || undefined,
    heightCm:
      input.heightCm === null || input.heightCm === undefined
        ? undefined
        : Number(input.heightCm) || undefined,
    club: input.club?.trim() || undefined,
    coach: input.coach?.trim() || undefined,
    playingStyle: input.playingStyle?.trim() || undefined,
    instagram: input.instagram?.trim().replace(/^@/, "") || undefined,
    published: input.published !== false,
    sortOrder: extras.sortOrder,
    createdAt: extras.createdAt ?? now,
    updatedAt: now,
  };
}

export async function listPlayers(options?: {
  publishedOnly?: boolean;
}): Promise<Player[]> {
  const db = await getDb();
  const filter =
    options?.publishedOnly === false ? {} : { published: { $ne: false } };

  const docs = await db
    .collection<PlayerDocument>(PLAYERS_COLLECTION)
    .find(filter)
    .sort({ sortOrder: 1, ranking: 1, name: 1 })
    .toArray();

  return docs.map(mapPlayer);
}

export async function getPlayerById(id: string): Promise<Player | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db
    .collection<PlayerDocument>(PLAYERS_COLLECTION)
    .findOne({ _id: new ObjectId(id) });
  return doc ? mapPlayer(doc) : null;
}

export async function createPlayer(input: PlayerInput): Promise<Player> {
  const db = await getDb();
  const count = await db.collection(PLAYERS_COLLECTION).countDocuments();
  const doc = buildDocFromInput(input, { sortOrder: count });

  const result = await db
    .collection<PlayerDocument>(PLAYERS_COLLECTION)
    .insertOne(doc as PlayerDocument);

  const inserted = await db
    .collection<PlayerDocument>(PLAYERS_COLLECTION)
    .findOne({ _id: result.insertedId });

  if (!inserted) throw new Error("No se pudo crear el jugador");
  return mapPlayer(inserted);
}

export async function updatePlayer(
  id: string,
  input: Partial<PlayerInput>,
): Promise<Player | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();

  const update: Partial<PlayerDocument> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) update.name = input.name.trim();
  if (input.category !== undefined) update.category = input.category.trim();
  if (input.location !== undefined) update.location = input.location.trim();
  if (input.ranking !== undefined) update.ranking = input.ranking;
  if (input.highlights !== undefined) {
    update.highlights = sanitizeHighlights(input.highlights);
  }
  if (input.galleryKeys !== undefined || input.imageKey !== undefined) {
    const galleryKeys = sanitizeGalleryKeys(
      input.galleryKeys ?? (input.imageKey ? [input.imageKey] : []),
    );
    update.galleryKeys = galleryKeys;
    update.imageKey = galleryKeys[0];
  }
  if (input.bio !== undefined) update.bio = input.bio.trim() || undefined;
  if (input.birthDate !== undefined) {
    update.birthDate = input.birthDate.trim() || undefined;
  }
  if (input.hand !== undefined) update.hand = input.hand || undefined;
  if (input.heightCm !== undefined) {
    update.heightCm =
      input.heightCm === null ? undefined : Number(input.heightCm) || undefined;
  }
  if (input.club !== undefined) update.club = input.club.trim() || undefined;
  if (input.coach !== undefined) update.coach = input.coach.trim() || undefined;
  if (input.playingStyle !== undefined) {
    update.playingStyle = input.playingStyle.trim() || undefined;
  }
  if (input.instagram !== undefined) {
    update.instagram = input.instagram.trim().replace(/^@/, "") || undefined;
  }
  if (input.published !== undefined) update.published = input.published;

  const result = await db
    .collection<PlayerDocument>(PLAYERS_COLLECTION)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" },
    );

  return result ? mapPlayer(result) : null;
}

export async function removePlayerGalleryImage(
  id: string,
  imageKey: string,
  deleteFromS3 = true,
): Promise<Player | null> {
  const player = await getPlayerById(id);
  if (!player) return null;

  const nextKeys = player.galleryKeys.filter((k) => k !== imageKey);
  if (deleteFromS3) {
    try {
      await deleteS3Object(imageKey);
    } catch (err) {
      console.error("[removePlayerGalleryImage] S3", err);
    }
  }

  return updatePlayer(id, {
    galleryKeys: nextKeys,
    imageKey: nextKeys[0] ?? "",
  });
}

export async function deletePlayer(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const player = await getPlayerById(id);
  const db = await getDb();
  const result = await db
    .collection<PlayerDocument>(PLAYERS_COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 1 && player) {
    await Promise.all(
      player.galleryKeys.map(async (key) => {
        try {
          await deleteS3Object(key);
        } catch (err) {
          console.error("[deletePlayer] S3", key, err);
        }
      }),
    );
  }

  return result.deletedCount === 1;
}

export async function seedPlayers(force = false): Promise<{ inserted: number }> {
  const db = await getDb();
  const collection = db.collection<PlayerDocument>(PLAYERS_COLLECTION);
  const existing = await collection.countDocuments();

  if (existing > 0 && !force) {
    return { inserted: 0 };
  }

  if (force && existing > 0) {
    await collection.deleteMany({});
  }

  const now = new Date();
  const docs = SEED_PLAYERS.map((player, index) =>
    buildDocFromInput(player, { sortOrder: index, createdAt: now }),
  );

  const result = await collection.insertMany(
    docs as unknown as PlayerDocument[],
  );
  return { inserted: result.insertedCount };
}
