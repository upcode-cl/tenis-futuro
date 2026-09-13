import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { ContentAdmin } from "@/components/admin/content-admin";

export const metadata: Metadata = {
  title: "Contenido | Tenis Futuro Admin",
  robots: { index: false, follow: false },
};

export default function AdminContentPage() {
  return (
    <AdminShell title="Contenido del sitio">
      <p className="mb-6 text-sm text-brand-muted">
        Edita Hero, Quiénes somos, Programas y Apóyanos. Al guardar, el home
        público se actualiza desde MongoDB.
      </p>
      <ContentAdmin />
    </AdminShell>
  );
}
