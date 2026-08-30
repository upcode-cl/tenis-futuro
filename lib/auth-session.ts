import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/lib/types/user";

export const ADMIN_COOKIE = "tf_admin_session";
const SESSION_DAYS = 7;

export type AdminSession = {
  sub: string;
  userId: string;
  role: UserRole;
};

function getSessionSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 16) {
    throw new Error(
      "Configura ADMIN_SESSION_SECRET (mín. 16 caracteres) en .env.local",
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createAdminToken(user: {
  id: string;
  username: string;
  role: UserRole;
}): Promise<string> {
  return new SignJWT({ role: user.role, userId: user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.username)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSessionSecret());
}

export async function verifyAdminToken(
  token: string | undefined | null,
): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    const role = payload.role;
    if (
      (role !== "admin" && role !== "editor") ||
      typeof payload.sub !== "string" ||
      typeof payload.userId !== "string"
    ) {
      return null;
    }
    return {
      sub: payload.sub,
      userId: payload.userId,
      role,
    };
  } catch {
    return null;
  }
}

export function setAdminSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAdminSessionFromCookies(): Promise<AdminSession | null> {
  const jar = await cookies();
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function getAdminSessionFromRequest(
  request: NextRequest,
): Promise<AdminSession | null> {
  return verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}
