import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/auth-admin";
import { deleteNews, getNewsById, updateNews } from "@/lib/db/news";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const news = await getNewsById(id);
    if (!news) {
      return Response.json({ error: "Noticia no encontrada" }, { status: 404 });
    }
    return Response.json({ news });
  } catch (error) {
    console.error("[GET /api/news/:id]", error);
    return Response.json({ error: "Error al obtener noticia" }, { status: 500 });
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

    const news = await updateNews(id, body);
    if (!news) {
      return Response.json({ error: "Noticia no encontrada" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/noticias");
    revalidatePath(`/noticias/${news.id}`);

    return Response.json({ news });
  } catch (error) {
    console.error("[PUT /api/news/:id]", error);
    return Response.json({ error: "No se pudo actualizar la noticia" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  if (!(await isAdminAuthorized(request))) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const ok = await deleteNews(id);
    if (!ok) {
      return Response.json({ error: "No se encontró la noticia a eliminar" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/noticias");
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/news/:id]", error);
    return Response.json({ error: "No se pudo eliminar la noticia" }, { status: 500 });
  }
}
