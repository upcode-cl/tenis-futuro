"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin/jugadores";

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo iniciar sesión");

      router.replace(next.startsWith("/admin") ? next : "/admin/jugadores");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-brand-navy/10 bg-white p-8 shadow-lg shadow-brand-navy/5">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 rounded-xl bg-white p-3 shadow-sm ring-1 ring-brand-navy/5">
          <Image
            src="/LogoTenisFuturo.png"
            alt="Tenis Futuro"
            width={180}
            height={52}
            className="h-10 w-auto"
            priority
          />
        </div>
        <h1 className="text-xl font-extrabold uppercase tracking-tight text-brand-navy">
          Acceso administrador
        </h1>
        <p className="mt-2 text-sm text-brand-muted">
          Mantenedor de jugadores — Tenis Futuro
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-brand-navy">
            Usuario
          </span>
          <input
            required
            autoComplete="username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full rounded-md border border-brand-navy/15 px-3 py-2.5 text-sm outline-none transition focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/30"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-brand-navy">
            Contraseña
          </span>
          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-brand-navy/15 px-3 py-2.5 text-sm outline-none transition focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/30"
          />
        </label>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand-lime px-4 py-3 text-sm font-bold uppercase tracking-wide text-brand-navy transition hover:bg-brand-lime-dark disabled:opacity-60"
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
