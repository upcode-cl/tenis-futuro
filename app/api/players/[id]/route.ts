import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/auth-admin";
import { getPlayerById } from "@/lib/db/players";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const player = await getPlayerById(id);
    if (!player) {
      return Response.json({ error: "Jugador no encontrado" }, { status: 404 });
    }
    return Response.json({ player });
  } catch (error) {
    console.error("[GET /api/players/:id]", error);
    return Response.json({ error: "Error al obtener jugador" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  if (!(await isAdminAuthorized(request))) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { updatePlayer } = await import("@/lib/db/players");

    const player = await updatePlayer(id, body);
    if (!player) {
      return Response.json({ error: "Jugador no encontrado" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/jugadores");
    if (player) revalidatePath(`/jugadores/${player.id}`);

    return Response.json({ player });
  } catch (error) {
    console.error("[PUT /api/players/:id]", error);
    return Response.json({ error: "No se pudo actualizar" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  if (!(await isAdminAuthorized(request))) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const { deletePlayer } = await import("@/lib/db/players");
    const deleted = await deletePlayer(id);

    if (!deleted) {
      return Response.json({ error: "Jugador no encontrado" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath(`/jugadores/${id}`);
    revalidatePath("/admin/jugadores");

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/players/:id]", error);
    return Response.json({ error: "No se pudo eliminar" }, { status: 500 });
  }
}
