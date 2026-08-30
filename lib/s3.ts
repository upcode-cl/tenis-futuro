import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { resolvePublicObjectUrl } from "@/lib/s3-public";

export { resolvePublicObjectUrl } from "@/lib/s3-public";
export const S3_PLAYERS_PREFIX = "players/";

export type S3Config = {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrlBase?: string;
};

export function getS3Config(): S3Config | null {
  const bucket = process.env.S3_BUCKET_NAME;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION ?? "us-east-1";

  if (!bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return {
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    publicUrlBase: process.env.S3_PUBLIC_URL_BASE,
  };
}

export function isS3Configured(): boolean {
  return getS3Config() !== null;
}

export function getS3Client(config: S3Config): S3Client {
  return new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

/** URL pública para mostrar una imagen almacenada en S3 — ver s3-public.ts */

export function buildPlayerImageKey(
  playerSlug: string,
  extension = "jpg",
  unique = false,
): string {
  const safe = playerSlug
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = unique ? `-${Date.now()}` : "";
  return `${S3_PLAYERS_PREFIX}${safe || "jugador"}${suffix}.${extension}`;
}

export async function createPlayerImageUploadUrl(
  key: string,
  contentType: string,
): Promise<{ uploadUrl: string; imageKey: string; publicUrl: string }> {
  const config = getS3Config();
  if (!config) {
    throw new Error(
      "S3 no configurado. Completa S3_BUCKET_NAME, AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY.",
    );
  }

  const client = getS3Client(config);
  const commandInput: PutObjectCommandInput = {
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(commandInput);
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 });

  return {
    uploadUrl,
    imageKey: key,
    publicUrl: resolvePublicObjectUrl(key) ?? key,
  };
}

export async function deleteS3Object(key: string): Promise<void> {
  const config = getS3Config();
  if (!config || !key) return;

  const client = getS3Client(config);
  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
}
