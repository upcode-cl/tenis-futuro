import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { NewsAdmin } from "@/components/admin/news-admin";

export const metadata: Metadata = {
  title: "Noticias | Tenis Futuro Admin",
  robots: { index: false, follow: false },
};

export default function AdminNewsPage() {
  return (
    <AdminShell title="Noticias y Novedades">
      <NewsAdmin />
    </AdminShell>
  );
}
