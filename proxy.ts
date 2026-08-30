import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/auth-session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login siempre accesible
  if (pathname === "/admin/login") {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const session = await verifyAdminToken(token);
    if (session) {
      return NextResponse.redirect(new URL("/admin/jugadores", request.url));
    }
    return NextResponse.next();
  }

  // Rutas admin de UI
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const session = await verifyAdminToken(token);
    if (!session) {
      const login = new URL("/admin/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
