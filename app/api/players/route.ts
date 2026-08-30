import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/auth-admin";
import { createPlayer, listPlayers } from "@/lib/db/players";
import type { PlayerInput } from "@/lib/types/player";

export async function GET(request: NextRequest) {
  try {
    const all = request.nextUrl.searchParams.get("all") === "1";
    const players = await listPlayers({
      publishedOnly: all ? false : true,
    });
    return Response.json({ players });
  } catch (error) {
    console.error("[GET /api/players]", error);
    return Response.json(
      { error: "No se pudieron cargar los jugadores" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) return unauthorizedResponse();

  try {
    const body = (await request.json()) as Partial<PlayerInput>;
    if (
      !body.name?.trim() ||
      !body.category?.trim() ||
      !body.location?.trim() ||
      typeof body.ranking !== "number"
    ) {
      return Response.json(
        { error: "name, category, location y ranking son obligatorios" },
        { status: 400 },
      );
    }

    const player = await createPlayer({
      name: body.name,
      category: body.category,
      location: body.location,
      ranking: body.ranking,
      highlights: body.highlights ?? [],
      imageKey: body.imageKey,
      galleryKeys: body.galleryKeys,
      bio: body.bio,
      birthDate: body.birthDate,
      hand: body.hand,
      heightCm: body.heightCm,
      club: body.club,
      coach: body.coach,
      playingStyle: body.playingStyle,
      instagram: body.instagram,
      published: body.published,
    });

    revalidatePath("/");
    revalidatePath("/admin/jugadores");
    revalidatePath(`/jugadores/${player.id}`);

    return Response.json({ player }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/players]", error);
    return Response.json({ error: "No se pudo crear el jugador" }, { status: 500 });
  }
}
