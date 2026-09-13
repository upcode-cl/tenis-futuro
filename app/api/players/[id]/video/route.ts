import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/auth-admin";
import { removePlayerVideo } from "@/lib/db/players";

type RouteContext = { params: Promise<{ id: string }> };

/** Elimina el video corto del jugador (y de S3) */
export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthorized(request))) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const player = await removePlayerVideo(id, true);
    if (!player) {
      return Response.json({ error: "Jugador no encontrado" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath(`/jugadores/${id}`);
    revalidatePath("/admin/jugadores");

    return Response.json({ player });
  } catch (error) {
    console.error("[DELETE /api/players/:id/video]", error);
    return Response.json({ error: "No se pudo eliminar el video" }, { status: 500 });
  }
}
