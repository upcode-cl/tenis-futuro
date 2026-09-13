import { NextRequest } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/auth-admin";
import {
  NEWS_IMAGE_RECOMMENDATION,
  NEWS_VIDEO_RECOMMENDATION,
  validateNewsMediaFile,
} from "@/lib/constants/news";
import {
  buildPlayerVideoKey,
  buildSiteImageKey,
  createSignedUploadUrl,
  isS3Configured,
} from "@/lib/s3";
import type { NewsMediaType } from "@/lib/types/news";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) return unauthorizedResponse();

  if (!isS3Configured()) {
    return Response.json(
      {
        error:
          "S3 no configurado. Agrega S3_BUCKET_NAME, NEXT_AWS_ACCESS_KEY_ID y NEXT_AWS_SECRET_ACCESS_KEY.",
        configured: false,
      },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const mediaType: NewsMediaType =
      body?.mediaType === "video" ? "video" : "image";
    const title = String(body?.title ?? "noticia");
    const contentType = String(body?.contentType ?? (mediaType === "video" ? "video/mp4" : "image/jpeg"));
    const size = Number(body?.size ?? 0);

    const validationError = validateNewsMediaFile(mediaType, {
      size,
      type: contentType,
    });
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    let key: string;
    if (mediaType === "video") {
      key = buildPlayerVideoKey(`news-${slug || "video"}`, "mp4", true);
    } else {
      const extension = contentType.includes("png")
        ? "png"
        : contentType.includes("webp")
          ? "webp"
          : "jpg";
      key = buildSiteImageKey(`news-${slug || "img"}`, extension, true);
    }

    const result = await createSignedUploadUrl(key, contentType);

    return Response.json({
      configured: true,
      mediaType,
      recommendation:
        mediaType === "video"
          ? NEWS_VIDEO_RECOMMENDATION
          : NEWS_IMAGE_RECOMMENDATION,
      ...result,
    });
  } catch (error) {
    console.error("[POST /api/uploads/news-media]", error);
    return Response.json(
      { error: "No se pudo generar URL de subida para la noticia" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return Response.json({ configured: isS3Configured() });
}
