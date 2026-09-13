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
import {
  DEFAULT_PLAYER_VIDEO_ORIENTATION,
  isPlayerVideoOrientation,
} from "@/lib/constants/player-video";

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
    bestNationalRanking: doc.bestNationalRanking,
    regionalRanking: doc.regionalRanking,
    wtnSingles: doc.wtnSingles ?? "",
    titlesYear: doc.titlesYear,
    singlesTitles: doc.singlesTitles,
    doublesTitles: doc.doublesTitles,
    highlights: doc.highlights ?? [],
    imageKey,
    imageSrc: resolvePublicObjectUrl(imageKey),
    galleryKeys,
    gallerySrcs: galleryKeys
      .map((k) => resolvePublicObjectUrl(k))
      .filter((u): u is string => Boolean(u)),
    videoKey: doc.videoKey,
    videoSrc: resolvePublicObjectUrl(doc.videoKey),
    videoDurationSec: doc.videoDurationSec,
    videoSizeBytes: doc.videoSizeBytes,
    videoContentType: doc.videoContentType,
    videoOrientation: isPlayerVideoOrientation(doc.videoOrientation)
      ? doc.videoOrientation
      : DEFAULT_PLAYER_VIDEO_ORIENTATION,
    bio: doc.bio ?? "",
    birthDate: doc.birthDate ?? "",
    hand: (doc.hand as PlayerHand) ?? "",
    heightCm: doc.heightCm,
    club: doc.club ?? "",
    school: doc.school ?? "",
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
    bestNationalRanking:
      input.bestNationalRanking === null || input.bestNationalRanking === undefined
        ? undefined
        : Number(input.bestNationalRanking) || undefined,
    regionalRanking:
      input.regionalRanking === null || input.regionalRanking === undefined
        ? undefined
        : Number(input.regionalRanking) || undefined,
    wtnSingles: input.wtnSingles?.trim() || undefined,
    titlesYear:
      input.titlesYear === null || input.titlesYear === undefined
        ? undefined
        : Number(input.titlesYear) || undefined,
    singlesTitles:
      input.singlesTitles === null || input.singlesTitles === undefined
        ? undefined
        : Number(input.singlesTitles) || undefined,
    doublesTitles:
      input.doublesTitles === null || input.doublesTitles === undefined
        ? undefined
        : Number(input.doublesTitles) || undefined,
    highlights: sanitizeHighlights(input.highlights),
    imageKey: galleryKeys[0],
    galleryKeys,
    videoKey: input.videoKey?.trim() || undefined,
    videoDurationSec:
      input.videoDurationSec === null || input.videoDurationSec === undefined
        ? undefined
        : Number(input.videoDurationSec) || undefined,
    videoSizeBytes:
      input.videoSizeBytes === null || input.videoSizeBytes === undefined
        ? undefined
        : Number(input.videoSizeBytes) || undefined,
    videoContentType: input.videoContentType?.trim() || undefined,
    videoOrientation: isPlayerVideoOrientation(input.videoOrientation)
      ? input.videoOrientation
      : input.videoKey
        ? DEFAULT_PLAYER_VIDEO_ORIENTATION
        : undefined,
    bio: input.bio?.trim() || undefined,
    birthDate: input.birthDate?.trim() || undefined,
    hand: input.hand || undefined,
    heightCm:
      input.heightCm === null || input.heightCm === undefined
        ? undefined
        : Number(input.heightCm) || undefined,
    club: input.club?.trim() || undefined,
    school: input.school?.trim() || undefined,
    coach: input.coach?.trim() || undefined,
    playingStyle: input.playingStyle?.trim() || undefined,
    instagram: input.instagram?.trim().replace(/^@/, "") || undefined,
    published: input.published !== false,
    sortOrder: extras.sortOrder,
    createdAt: extras.createdAt ?? now,
    updatedAt: now,
  };
}

export function shufflePlayers<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

export async function listPlayers(options?: {
  publishedOnly?: boolean;
  randomize?: boolean;
}): Promise<Player[]> {
  const db = await getDb();
  const filter =
    options?.publishedOnly === false ? {} : { published: { $ne: false } };

  const docs = await db
    .collection<PlayerDocument>(PLAYERS_COLLECTION)
    .find(filter)
    .sort({ sortOrder: 1, ranking: 1, name: 1 })
    .toArray();

  const mapped = docs.map(mapPlayer);
  return options?.randomize ? shufflePlayers(mapped) : mapped;
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
  const existing = await getPlayerById(id);
  if (!existing) return null;

  const update: Partial<PlayerDocument> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) update.name = input.name.trim();
  if (input.category !== undefined) update.category = input.category.trim();
  if (input.location !== undefined) update.location = input.location.trim();
  if (input.ranking !== undefined) update.ranking = input.ranking;
  if (input.bestNationalRanking !== undefined) {
    update.bestNationalRanking =
      input.bestNationalRanking === null
        ? undefined
        : Number(input.bestNationalRanking) || undefined;
  }
  if (input.regionalRanking !== undefined) {
    update.regionalRanking =
      input.regionalRanking === null
        ? undefined
        : Number(input.regionalRanking) || undefined;
  }
  if (input.wtnSingles !== undefined) {
    update.wtnSingles = input.wtnSingles.trim() || undefined;
  }
  if (input.titlesYear !== undefined) {
    update.titlesYear =
      input.titlesYear === null
        ? undefined
        : Number(input.titlesYear) || undefined;
  }
  if (input.singlesTitles !== undefined) {
    update.singlesTitles =
      input.singlesTitles === null
        ? undefined
        : Number(input.singlesTitles) || undefined;
  }
  if (input.doublesTitles !== undefined) {
    update.doublesTitles =
      input.doublesTitles === null
        ? undefined
        : Number(input.doublesTitles) || undefined;
  }
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
  if (input.videoKey !== undefined) {
    update.videoKey = input.videoKey?.trim() || undefined;
  }
  if (input.videoDurationSec !== undefined) {
    update.videoDurationSec =
      input.videoDurationSec === null
        ? undefined
        : Number(input.videoDurationSec) || undefined;
  }
  if (input.videoSizeBytes !== undefined) {
    update.videoSizeBytes =
      input.videoSizeBytes === null
        ? undefined
        : Number(input.videoSizeBytes) || undefined;
  }
  if (input.videoContentType !== undefined) {
    update.videoContentType = input.videoContentType?.trim() || undefined;
  }
  if (input.videoOrientation !== undefined) {
    update.videoOrientation = isPlayerVideoOrientation(input.videoOrientation)
      ? input.videoOrientation
      : DEFAULT_PLAYER_VIDEO_ORIENTATION;
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
  if (input.school !== undefined) {
    update.school = input.school.trim() || undefined;
  }
  if (input.coach !== undefined) update.coach = input.coach.trim() || undefined;
  if (input.playingStyle !== undefined) {
    update.playingStyle = input.playingStyle.trim() || undefined;
  }
  if (input.instagram !== undefined) {
    update.instagram = input.instagram.trim().replace(/^@/, "") || undefined;
  }
  if (input.published !== undefined) update.published = input.published;

  // Si cambia el video, borrar el anterior de S3
  if (
    input.videoKey !== undefined &&
    existing.videoKey &&
    input.videoKey?.trim() !== existing.videoKey
  ) {
    try {
      await deleteS3Object(existing.videoKey);
    } catch (err) {
      console.error("[updatePlayer] old video S3", err);
    }
  }

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

export async function removePlayerVideo(
  id: string,
  deleteFromS3 = true,
): Promise<Player | null> {
  const player = await getPlayerById(id);
  if (!player) return null;

  if (deleteFromS3 && player.videoKey) {
    try {
      await deleteS3Object(player.videoKey);
    } catch (err) {
      console.error("[removePlayerVideo] S3", err);
    }
  }

  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const result = await db.collection<PlayerDocument>(PLAYERS_COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: { updatedAt: new Date() },
      $unset: {
        videoKey: "",
        videoDurationSec: "",
        videoSizeBytes: "",
        videoContentType: "",
        videoOrientation: "",
      },
    },
    { returnDocument: "after" },
  );

  return result ? mapPlayer(result) : null;
}

export async function deletePlayer(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const player = await getPlayerById(id);
  const db = await getDb();
  const result = await db
    .collection<PlayerDocument>(PLAYERS_COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 1 && player) {
    const keys = [...player.galleryKeys];
    if (player.videoKey) keys.push(player.videoKey);
    await Promise.all(
      keys.map(async (key) => {
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
