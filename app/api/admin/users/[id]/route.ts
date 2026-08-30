import { NextRequest } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/auth-admin";
import {
  deleteUser,
  setUserActive,
  updateUserPassword,
} from "@/lib/db/users";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthorized(request))) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const body = await request.json();

    if (typeof body?.password === "string" && body.password) {
      await updateUserPassword(id, body.password);
      return Response.json({ ok: true, message: "Contraseña actualizada" });
    }

    if (typeof body?.active === "boolean") {
      const user = await setUserActive(id, body.active);
      if (!user) {
        return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
      }
      return Response.json({ user });
    }

    return Response.json(
      { error: "Envía password o active para actualizar" },
      { status: 400 },
    );
  } catch (error) {
    console.error("[PATCH /api/admin/users/:id]", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "No se pudo actualizar",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthorized(request))) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const deleted = await deleteUser(id);
    if (!deleted) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/users/:id]", error);
    return Response.json({ error: "No se pudo eliminar" }, { status: 500 });
  }
}
