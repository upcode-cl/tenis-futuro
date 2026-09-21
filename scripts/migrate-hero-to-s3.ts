/**
 * Sube public/heroPhoto.png a S3 (site/hero.png) y actualiza CMS.
 * Uso: pnpm exec tsx --env-file=.env.local scripts/migrate-hero-to-s3.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSiteContent, updateSiteContent } from "../lib/db/cms";
import { getS3Client, getS3Config, resolvePublicObjectUrl } from "../lib/s3";

const KEY = "site/hero.png";

async function main() {
  const config = getS3Config();
  if (!config) {
    throw new Error("S3 no configurado en .env.local");
  }

  const filePath = resolve(process.cwd(), "public/heroPhoto.png");
  const body = readFileSync(filePath);
  const client = getS3Client(config);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: KEY,
      Body: body,
      ContentType: "image/png",
    }),
  );

  const publicUrl = resolvePublicObjectUrl(KEY);
  if (!publicUrl) throw new Error("No se pudo resolver URL pública");

  const current = await getSiteContent();
  await updateSiteContent({
    hero: {
      ...current.hero,
      imageKey: KEY,
      imageSrc: publicUrl,
      images: [
        {
          imageKey: KEY,
          imageSrc: publicUrl,
          imageAlt: current.hero.imageAlt,
        },
      ],
    },
  });

  console.log("Hero migrado a S3:");
  console.log("- key:", KEY);
  console.log("- url:", publicUrl);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
