import { NextRequest, NextResponse } from "next/server";
import {
  createAdminToken,
  setAdminSessionCookie,
} from "@/lib/auth-session";
import { authenticateUser } from "@/lib/db/users";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = String(body?.user ?? "").trim();
    const password = String(body?.password ?? "");

    if (!user || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son obligatorios" },
        { status: 400 },
      );
    }

    const account = await authenticateUser(user, password);
    if (!account) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 },
      );
    }

    const token = await createAdminToken({
      id: account.id,
      username: account.username,
      role: account.role,
    });

    const response = NextResponse.json({
      ok: true,
      user: account.username,
      name: account.name,
      role: account.role,
    });
    setAdminSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("[POST /api/admin/login]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo iniciar sesión",
      },
      { status: 500 },
    );
  }
}
