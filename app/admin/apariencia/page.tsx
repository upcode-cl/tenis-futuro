import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { AppearanceAdmin } from "@/components/admin/appearance-admin";

export const metadata: Metadata = {
  title: "Apariencia | Tenis Futuro Admin",
  robots: { index: false, follow: false },
};

export default function AdminAppearancePage() {
  return (
    <AdminShell title="Apariencia">
      <p className="mb-6 text-sm text-brand-muted">
        Personaliza el logo, el lema y los colores del sitio. Los valores se
        guardan en MongoDB (logo en S3) y se aplican en el sitio público.
      </p>
      <AppearanceAdmin />
    </AdminShell>
  );
}
