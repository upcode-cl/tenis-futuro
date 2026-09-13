import { NextRequest } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/auth-admin";
import {
  PLAYER_VIDEO_MAX_BYTES,
  PLAYER_VIDEO_MAX_LABEL,
  validatePlayerVideoFile,
} from "@/lib/constants/player-video";
import {
  buildPlayerVideoKey,
  createSignedUploadUrl,
  isS3Configured,
} from "@/lib/s3";

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
    const playerName = String(body?.playerName ?? "jugador");
    const contentType = String(body?.contentType ?? "video/mp4");
    const size = Number(body?.size ?? 0);

    const validationError = validatePlayerVideoFile({
      size,
      type: contentType,
    });
    if (validationError) {
      return Response.json(
        { error: validationError, maxBytes: PLAYER_VIDEO_MAX_BYTES },
        { status: 400 },
      );
    }

    const customKey = body?.videoKey?.trim();
    const key = customKey || buildPlayerVideoKey(playerName, "mp4", true);
    const result = await createSignedUploadUrl(key, contentType);

    return Response.json({
      configured: true,
      maxBytes: PLAYER_VIDEO_MAX_BYTES,
      maxLabel: PLAYER_VIDEO_MAX_LABEL,
      ...result,
    });
  } catch (error) {
    console.error("[POST /api/uploads/player-video]", error);
    return Response.json(
      { error: "No se pudo generar URL de subida de video" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return Response.json({
    configured: isS3Configured(),
    maxBytes: PLAYER_VIDEO_MAX_BYTES,
    maxLabel: PLAYER_VIDEO_MAX_LABEL,
    allowedTypes: ["video/mp4"],
  });
}
