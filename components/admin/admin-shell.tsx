"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin/jugadores", label: "Jugadores" },
  { href: "/admin/usuarios", label: "Usuarios" },
];

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-brand-slate">
      <header className="border-b border-brand-navy/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Tenis Futuro
            </p>
            <h1 className="text-xl font-extrabold uppercase text-brand-navy">
              {title}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex gap-1 rounded-lg bg-brand-slate p-1">
              {LINKS.map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                      active
                        ? "bg-white text-brand-navy shadow-sm"
                        : "text-brand-muted hover:text-brand-navy"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <a
              href="/"
              className="text-sm font-semibold text-brand-navy transition hover:text-brand-lime-dark"
            >
              Sitio
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-brand-navy/20 px-3 py-1.5 text-sm font-semibold text-brand-navy transition hover:bg-brand-slate"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
