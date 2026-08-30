import { NextRequest } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/auth-session";

/** Autoriza mutaciones admin: sesión cookie (login) */
export async function isAdminAuthorized(request: NextRequest): Promise<boolean> {
  const session = await getAdminSessionFromRequest(request);
  return session !== null;
}

export function unauthorizedResponse() {
  return Response.json(
    { error: "No autorizado. Inicia sesión en /admin/login." },
    { status: 401 },
  );
}
