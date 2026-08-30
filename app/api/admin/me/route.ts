import { getAdminSessionFromCookies } from "@/lib/auth-session";

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return Response.json({ authenticated: false }, { status: 401 });
  }
  return Response.json({ authenticated: true, user: session.sub });
}
