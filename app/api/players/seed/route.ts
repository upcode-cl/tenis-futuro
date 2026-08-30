import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/auth-admin";
import { seedPlayers } from "@/lib/db/players";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) return unauthorizedResponse();

  try {
    const body = await request.json().catch(() => ({}));
    const force = Boolean(body?.force);
    const { inserted } = await seedPlayers(force);

    revalidatePath("/");
    revalidatePath("/admin/jugadores");

    return Response.json({
      ok: true,
      inserted,
      message:
        inserted === 0
          ? "La colección ya tiene datos. Usa force: true para reemplazar."
          : `Se insertaron ${inserted} jugadores.`,
    });
  } catch (error) {
    console.error("[POST /api/players/seed]", error);
    return Response.json({ error: "No se pudo poblar la base" }, { status: 500 });
  }
}
