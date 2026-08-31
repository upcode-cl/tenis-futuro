"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { href: "#inicio", label: "Inicio" },
  { href: "#jugadores", label: "Jugadores" },
  { href: "#fundacion", label: "La Fundación" },
  { href: "#instagram", label: "Instagram" },
  { href: "#apoyanos", label: "Apóyanos" },
  { href: "#contacto", label: "Contacto" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-white/10 bg-brand-navy/95 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="#inicio"
          className="group relative z-10 shrink-0"
          aria-label="Tenis Futuro Fundación — Inicio"
        >
          <motion.span
            className="relative inline-flex items-center"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Halo suave para legibilidad del texto navy sobre el hero */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-[-6px] -z-10 rounded-2xl bg-white/20 blur-xl transition duration-300 group-hover:bg-white/30"
            />
            <Image
              src="/LogoTenisFuturo.png"
              alt="Tenis Futuro Fundación"
              width={380}
              height={380}
              priority
              className="relative h-30 w-auto object-contain sm:h-30 md:h-30 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
            />
          </motion.span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/85 transition hover:text-brand-lime"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#apoyanos"
            className="hidden items-center gap-2 rounded-md bg-brand-lime px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-brand-navy transition hover:bg-brand-lime-dark sm:inline-flex"
          >
            <HeartIcon className="h-4 w-4" />
            Haz tu aporte
          </a>

          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menú</span>
            <div className="flex w-5 flex-col gap-1.5">
              <span
                className={`h-0.5 w-full bg-white transition ${open ? "translate-y-2 rotate-45" : ""}`}
              />
              <span
                className={`h-0.5 w-full bg-white transition ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`h-0.5 w-full bg-white transition ${open ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/10 bg-brand-navy lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/5 hover:text-brand-lime"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#apoyanos"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-brand-lime px-4 py-3 text-sm font-bold uppercase text-brand-navy"
              >
                <HeartIcon className="h-4 w-4" />
                Haz tu aporte
              </a>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 21s-7.2-4.5-9.5-8.2C.5 9.8 2.2 6 5.6 6c1.9 0 3.2 1 4 2.1C10.4 7 11.7 6 13.6 6c3.4 0 5.1 3.8 3.1 6.8C19.2 16.5 12 21 12 21z" />
    </svg>
  );
}
