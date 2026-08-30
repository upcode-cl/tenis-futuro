import { NextRequest } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/auth-admin";
import { createUser, listUsers } from "@/lib/db/users";
import type { UserRole } from "@/lib/types/user";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) return unauthorizedResponse();

  try {
    const users = await listUsers();
    return Response.json({ users });
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return Response.json({ error: "No se pudieron cargar usuarios" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) return unauthorizedResponse();

  try {
    const body = await request.json();
    const username = String(body?.username ?? "").trim();
    const password = String(body?.password ?? "");
    const name = String(body?.name ?? "").trim();
    const role = (body?.role as UserRole | undefined) ?? "admin";

    if (!username || !password || !name) {
      return Response.json(
        { error: "username, password y name son obligatorios" },
        { status: 400 },
      );
    }

    const user = await createUser({ username, password, name, role });
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/users]", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "No se pudo crear el usuario",
      },
      { status: 400 },
    );
  }
}
