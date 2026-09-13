import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/auth-admin";
import { seedNews } from "@/lib/db/news";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) return unauthorizedResponse();

  try {
    const body = await request.json().catch(() => ({}));
    const force = Boolean(body?.force);
    const { inserted } = await seedNews(force);

    revalidatePath("/");
    revalidatePath("/admin/noticias");

    return Response.json({
      ok: true,
      inserted,
      message:
        inserted === 0
          ? "La colección de noticias ya tiene datos. Usa force: true para reemplazar."
          : `Se insertaron ${inserted} noticias.`,
    });
  } catch (error) {
    console.error("[POST /api/news/seed]", error);
    return Response.json({ error: "No se pudo poblar noticias" }, { status: 500 });
  }
}
