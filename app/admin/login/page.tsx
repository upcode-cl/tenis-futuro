import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/login-form";
import { resolveSiteLogoUrl } from "@/lib/cms/logo";
import { getSiteSettings } from "@/lib/db/cms";

export const metadata: Metadata = {
  title: "Login admin | Tenis Futuro",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  let logoSrc = "/LogoTenisFuturo.png";
  try {
    logoSrc = resolveSiteLogoUrl(await getSiteSettings());
  } catch {
    // fallback local
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-navy via-brand-navy-deep to-brand-navy px-4 py-12">
      <Suspense
        fallback={
          <div className="rounded-2xl bg-white px-8 py-12 text-sm text-brand-muted">
            Cargando…
          </div>
        }
      >
        <AdminLoginForm logoSrc={logoSrc} />
      </Suspense>
    </div>
  );
}
