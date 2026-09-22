import { NextRequest } from "next/server";
import {
  getAdminSessionFromRequest,
  type AdminSession,
} from "@/lib/auth-session";

/** Autoriza mutaciones admin: sesión cookie (login) */
export async function isAdminAuthorized(request: NextRequest): Promise<boolean> {
  const session = await getAdminSessionFromRequest(request);
  return session !== null;
}

/** Sesión válida o null */
export async function getAuthorizedAdminSession(
  request: NextRequest,
): Promise<AdminSession | null> {
  return getAdminSessionFromRequest(request);
}

/** Solo rol `admin` (no editores) */
export function isFullAdmin(session: AdminSession | null): boolean {
  return session?.role === "admin";
}

export function unauthorizedResponse() {
  return Response.json(
    { error: "No autorizado. Inicia sesión en /admin/login." },
    { status: 401 },
  );
}

export function forbiddenResponse(
  message = "Solo el administrador puede realizar esta acción.",
) {
  return Response.json({ error: message }, { status: 403 });
}
