"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import type { SponsorItem, SponsorsContent } from "@/lib/cms/types";
import { resolvePublicObjectUrl } from "@/lib/s3-public";

export function SponsorsSection({ content }: { content?: SponsorsContent | null }) {
  const items = useMemo(() => {
    return (content?.items ?? []).filter((it) => it.name?.trim() || it.logoSrc?.trim());
  }, [content?.items]);

  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  if (!content || items.length === 0) {
    return null;
  }

  const isFew = items.length <= 3;

  // Duplicamos los elementos lo suficiente para cubrir pantallas anchas en carrusel
  const carouselItems = Array.from(
    { length: Math.max(4, Math.ceil(12 / items.length)) },
    () => items,
  ).flat();

  function scrollByDir(dir: -1 | 1) {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * 260, behavior: "smooth" });
  }

  return (
    <section
      id="sponsors"
      aria-label="Auspiciadores y Alianzas"
      className="relative overflow-hidden border-t border-brand-navy/10 bg-brand-slate py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado con animación Motion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          {content.eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">
              {content.eyebrow}
            </p>
          )}
          <h2 className="mt-2 text-2xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-3xl">
            {content.title || "Nuestros Sponsors"}
          </h2>
          <span className="mx-auto mt-3 block h-1 w-12 rounded-full bg-brand-lime" />
          {content.description && (
            <p className="mt-3 text-sm leading-relaxed text-brand-navy/70 sm:text-base text-justify text-justify-site">
              {content.description}
            </p>
          )}
        </motion.div>

        {/* CASO 1: 3 o menos de 3 sponsors -> Centrados y en tono gris */}
        {isFew ? (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {items.map((sponsor, index) => (
              <motion.div
                key={`${sponsor.id}-${index}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <SponsorCard item={sponsor} isFew />
              </motion.div>
            ))}
          </div>
        ) : (
          /* CASO 2: Más de 3 sponsors -> Carrusel de imágenes con Motion */
          <div className="relative mt-12">
            {/* Controles manuales discretos */}
            <div className="mb-4 flex items-center justify-end gap-2">
              <button
                type="button"
                aria-label="Sponsor anterior"
                onClick={() => scrollByDir(-1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-navy/15 bg-white text-xs font-bold text-brand-navy shadow-xs transition hover:border-brand-lime hover:bg-brand-lime"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Siguiente sponsor"
                onClick={() => scrollByDir(1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-navy/15 bg-white text-xs font-bold text-brand-navy shadow-xs transition hover:border-brand-lime hover:bg-brand-lime"
              >
                →
              </button>
            </div>

            {/* Máscaras de degradado a los extremos para suavizar entrada/salida */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-24 bg-gradient-to-r from-brand-slate to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-24 bg-gradient-to-l from-brand-slate to-transparent" />

            <div
              ref={trackRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <motion.div
                className="flex w-max items-center gap-6 sm:gap-8"
                animate={isPaused ? undefined : { x: ["0%", "-50%"] }}
                transition={{
                  ease: "linear",
                  duration: Math.max(22, items.length * 4),
                  repeat: Infinity,
                }}
              >
                {carouselItems.map((sponsor, idx) => (
                  <motion.div
                    key={`${sponsor.id}-${idx}`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SponsorCard item={sponsor} isFew={false} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Card con tamaño estandarizado automático y filtro gris homogéneo.
 * - Dimensiones estándar: h-16 w-44 (sm: h-20 w-56).
 * - Tamaño de imagen acotado: max-h-11 max-w-[160px] con object-contain.
 * - Filtro gris uniforme para que no choquen logos con diferentes colores.
 */
function SponsorCard({ item, isFew }: { item: SponsorItem; isFew: boolean }) {
  const isLink = Boolean(item.url?.trim() && item.url !== "#");
  const Wrapper = isLink ? "a" : "div";
  const wrapperProps = isLink
    ? {
        href: item.url,
        target: "_blank",
        rel: "noopener noreferrer",
        title: `Visitar sitio de ${item.name}`,
      }
    : {};

  const resolvedSrc = item.logoKey
    ? resolvePublicObjectUrl(item.logoKey) || item.logoSrc
    : item.logoSrc;

  return (
    <Wrapper
      {...wrapperProps}
      className={`group relative flex h-16 w-44 sm:h-20 sm:w-56 shrink-0 items-center justify-center rounded-xl border border-brand-navy/10 bg-white px-5 py-3 shadow-xs transition-all duration-300 hover:border-brand-navy/25 hover:shadow-md ${
        isLink ? "cursor-pointer" : ""
      }`}
    >
      {resolvedSrc ? (
        <img
          src={resolvedSrc}
          alt={item.name || "Sponsor"}
          loading="lazy"
          className={`max-h-10 sm:max-h-11 max-w-[130px] sm:max-w-[160px] w-auto h-auto object-contain select-none pointer-events-none transition-all duration-300 ${
            isFew
              ? "filter grayscale contrast-75 brightness-95 opacity-65 group-hover:opacity-100 group-hover:grayscale-0"
              : "filter grayscale contrast-75 brightness-95 opacity-70 group-hover:opacity-100 group-hover:grayscale-0"
          }`}
        />
      ) : (
        <span className="text-center text-xs font-bold uppercase tracking-wider text-brand-muted line-clamp-2">
          {item.name || "Sponsor"}
        </span>
      )}
    </Wrapper>
  );
}
