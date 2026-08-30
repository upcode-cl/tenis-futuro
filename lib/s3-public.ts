/** Resolución de URL pública sin SDK (usable en cliente y servidor) */

export function resolvePublicObjectUrl(key?: string | null): string | undefined {
  if (!key) return undefined;
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }

  const publicBase =
    process.env.NEXT_PUBLIC_S3_PUBLIC_URL_BASE ||
    process.env.S3_PUBLIC_URL_BASE;
  if (publicBase) {
    return `${publicBase.replace(/\/$/, "")}/${key}`;
  }

  const bucket =
    process.env.NEXT_PUBLIC_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME;
  const region =
    process.env.NEXT_PUBLIC_AWS_REGION ||
    process.env.AWS_REGION ||
    "us-east-1";
  if (!bucket) return undefined;

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
