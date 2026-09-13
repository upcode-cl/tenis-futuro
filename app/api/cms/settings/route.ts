import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/auth-admin";
import {
  getSiteSettings,
  resetCmsToDefaults,
  updateSiteSettings,
} from "@/lib/db/cms";
import type { SiteSettings } from "@/lib/cms/types";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return Response.json({ settings });
  } catch (error) {
    console.error("[GET /api/cms/settings]", error);
    return Response.json(
      { error: "No se pudieron cargar los ajustes" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) return unauthorizedResponse();

  try {
    const body = (await request.json()) as Partial<SiteSettings>;
    const settings = await updateSiteSettings(body);
    revalidatePath("/");
    revalidatePath("/admin/apariencia");
    return Response.json({ settings });
  } catch (error) {
    console.error("[PUT /api/cms/settings]", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudieron guardar los ajustes",
      },
      { status: 400 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) return unauthorizedResponse();

  try {
    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
    };
    if (body.action !== "reset") {
      return Response.json({ error: "Acción no válida" }, { status: 400 });
    }
    const result = await resetCmsToDefaults();
    revalidatePath("/");
    revalidatePath("/admin/apariencia");
    revalidatePath("/admin/contenido");
    return Response.json(result);
  } catch (error) {
    console.error("[POST /api/cms/settings]", error);
    return Response.json({ error: "No se pudo resetear el CMS" }, { status: 500 });
  }
}
