import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { PlayersAdmin } from "@/components/admin/players-admin";

export const metadata: Metadata = {
  title: "Mantenedor de jugadores | Tenis Futuro",
  robots: { index: false, follow: false },
};

export default function AdminPlayersPage() {
  return (
    <AdminShell title="Mantenedor de jugadores">
      <PlayersAdmin />
    </AdminShell>
  );
}
