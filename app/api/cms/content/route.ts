import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getAuthorizedAdminSession,
  isFullAdmin,
  unauthorizedResponse,
} from "@/lib/auth-admin";
import { getSiteContent, updateSiteContent } from "@/lib/db/cms";
import type { SiteContent } from "@/lib/cms/types";

export async function GET() {
  try {
    const content = await getSiteContent();
    return Response.json({ content });
  } catch (error) {
    console.error("[GET /api/cms/content]", error);
    return Response.json(
      { error: "No se pudo cargar el contenido" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await getAuthorizedAdminSession(request);
  if (!session) return unauthorizedResponse();

  try {
    const body = (await request.json()) as Partial<SiteContent>;

    // Datos bancarios y flag del modal: solo rol admin
    if (body.support && !isFullAdmin(session)) {
      const current = await getSiteContent();
      body.support = {
        ...body.support,
        bankDetails: current.support.bankDetails,
        donationModalEnabled: current.support.donationModalEnabled,
      };
    }

    const content = await updateSiteContent(body);
    revalidatePath("/");
    revalidatePath("/admin/contenido");
    return Response.json({ content });
  } catch (error) {
    console.error("[PUT /api/cms/content]", error);
    return Response.json(
      { error: "No se pudo guardar el contenido" },
      { status: 500 },
    );
  }
}
