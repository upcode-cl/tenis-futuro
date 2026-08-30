import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Login admin | Tenis Futuro",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-navy via-brand-navy-deep to-brand-navy px-4 py-12">
      <Suspense
        fallback={
          <div className="rounded-2xl bg-white px-8 py-12 text-sm text-brand-muted">
            Cargando…
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
