import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/auth-admin";
import { removePlayerGalleryImage } from "@/lib/db/players";

type RouteContext = { params: Promise<{ id: string }> };

/** Elimina una imagen de la galería del jugador (y de S3) */
export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthorized(request))) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const imageKey = String(body?.imageKey ?? "").trim();

    if (!imageKey) {
      return Response.json({ error: "imageKey es obligatorio" }, { status: 400 });
    }

    const player = await removePlayerGalleryImage(id, imageKey, true);
    if (!player) {
      return Response.json({ error: "Jugador no encontrado" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath(`/jugadores/${id}`);
    revalidatePath("/admin/jugadores");

    return Response.json({ player });
  } catch (error) {
    console.error("[DELETE /api/players/:id/images]", error);
    return Response.json({ error: "No se pudo eliminar la imagen" }, { status: 500 });
  }
}
