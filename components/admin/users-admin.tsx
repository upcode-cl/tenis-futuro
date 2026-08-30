"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { User, UserRole } from "@/lib/types/user";

export function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: "",
    name: "",
    password: "",
    role: "admin" as UserRole,
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cargar usuarios");
      setUsers(data.users ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo crear");
      setMessage(`Usuario ${data.user.username} creado`);
      setForm({ username: "", name: "", password: "", role: "admin" });
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user: User) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo actualizar");
      setMessage(
        data.user.active
          ? `${user.username} activado`
          : `${user.username} desactivado`,
      );
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function resetPassword(user: User) {
    const password = prompt(`Nueva contraseña para ${user.username} (mín. 8):`);
    if (!password) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo actualizar");
      setMessage(data.message ?? "Contraseña actualizada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function removeUser(user: User) {
    if (!confirm(`¿Eliminar a ${user.username}?`)) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo eliminar");
      setMessage("Usuario eliminado");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {(message || error) && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            error
              ? "border border-red-200 bg-red-50 text-red-800"
              : "border border-green-200 bg-green-50 text-green-800"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <section className="rounded-xl border border-brand-navy/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-extrabold uppercase text-brand-navy">
          Nuevo usuario
        </h2>
        <p className="mt-2 text-sm text-brand-muted">
          Los usuarios se guardan en MongoDB (colección{" "}
          <code className="rounded bg-brand-slate px-1">users</code>). La
          contraseña se almacena hasheada.
        </p>
        <form
          onSubmit={handleCreate}
          className="mt-6 grid gap-4 sm:grid-cols-2"
        >
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-brand-navy">
              Usuario
            </span>
            <input
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-brand-navy">
              Nombre
            </span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-brand-navy">
              Contraseña
            </span>
            <input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-brand-navy">
              Rol
            </span>
            <select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as UserRole })
              }
              className="w-full rounded-md border border-brand-navy/15 px-3 py-2 text-sm"
            >
              <option value="admin">admin</option>
              <option value="editor">editor</option>
            </select>
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-brand-lime px-5 py-2.5 text-sm font-bold uppercase text-brand-navy transition hover:bg-brand-lime-dark disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Crear usuario"}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-brand-navy/10 bg-white shadow-sm">
        <div className="border-b border-brand-navy/10 px-6 py-4">
          <h2 className="text-lg font-extrabold uppercase text-brand-navy">
            Usuarios ({users.length})
          </h2>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-sm text-brand-muted">Cargando…</p>
        ) : users.length === 0 ? (
          <p className="px-6 py-8 text-sm text-brand-muted">
            No hay usuarios. El primero se crea al iniciar sesión con
            ADMIN_USER / ADMIN_PASSWORD.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-slate text-xs uppercase tracking-wider text-brand-muted">
                <tr>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-brand-navy/5">
                    <td className="px-4 py-3 font-semibold text-brand-navy">
                      {u.username}
                    </td>
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3">
                      {u.active ? (
                        <span className="text-green-700">Activo</span>
                      ) : (
                        <span className="text-red-600">Inactivo</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleActive(u)}
                          className="font-semibold text-brand-navy hover:text-brand-lime-dark"
                        >
                          {u.active ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => resetPassword(u)}
                          className="font-semibold text-brand-navy hover:text-brand-lime-dark"
                        >
                          Password
                        </button>
                        <button
                          type="button"
                          onClick={() => removeUser(u)}
                          className="font-semibold text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
