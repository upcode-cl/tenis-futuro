import { NextRequest } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/auth-admin";
import {
  buildPlayerImageKey,
  createPlayerImageUploadUrl,
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
    const contentType = String(body?.contentType ?? "image/jpeg");
    const extension =
      contentType.includes("png")
        ? "png"
        : contentType.includes("webp")
          ? "webp"
          : "jpg";

    // unique=true para galería (no sobrescribir);
    // imageKey custom solo si se pide reemplazo explícito
    const customKey = body?.imageKey?.trim();
    const unique = body?.unique !== false && !customKey;
    const key =
      customKey || buildPlayerImageKey(playerName, extension, unique);

    const result = await createPlayerImageUploadUrl(key, contentType);
    return Response.json({ configured: true, ...result });
  } catch (error) {
    console.error("[POST /api/uploads/player-image]", error);
    return Response.json({ error: "No se pudo generar URL de subida" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ configured: isS3Configured() });
}
