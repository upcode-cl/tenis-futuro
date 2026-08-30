import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { UsersAdmin } from "@/components/admin/users-admin";

export const metadata: Metadata = {
  title: "Usuarios admin | Tenis Futuro",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return (
    <AdminShell title="Usuarios del sistema">
      <UsersAdmin />
    </AdminShell>
  );
}
