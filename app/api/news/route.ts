import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/auth-admin";
import { createNews, ensureNewsSeed, listNews } from "@/lib/db/news";
import type { NewsInput } from "@/lib/types/news";

export async function GET(request: NextRequest) {
  try {
    await ensureNewsSeed();
    const all = request.nextUrl.searchParams.get("all") === "1";
    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : undefined;

    const news = await listNews({
      publishedOnly: all ? false : true,
      limit,
    });
    return Response.json({ news });
  } catch (error) {
    console.error("[GET /api/news]", error);
    return Response.json(
      { error: "No se pudieron cargar las noticias" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) return unauthorizedResponse();

  try {
    const body = (await request.json()) as Partial<NewsInput>;
    if (!body.title?.trim()) {
      return Response.json(
        { error: "El título de la noticia es obligatorio" },
        { status: 400 },
      );
    }

    const news = await createNews({
      title: body.title,
      summary: body.summary ?? "",
      content: body.content ?? "",
      date: body.date,
      mediaType: body.mediaType === "video" ? "video" : "image",
      mediaKey: body.mediaKey,
      mediaSrc: body.mediaSrc || "/LogoTenisFuturo.png",
      author: body.author,
      tag: body.tag,
      published: body.published,
    });

    revalidatePath("/");
    revalidatePath("/admin/noticias");
    revalidatePath(`/noticias/${news.id}`);

    return Response.json({ news }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/news]", error);
    return Response.json(
      { error: "No se pudo crear la noticia" },
      { status: 500 },
    );
  }
}
