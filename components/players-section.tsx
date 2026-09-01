"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FadeIn } from "@/components/fade-in";
import { ImageSlot } from "@/components/image-slot";
import { PlayerRankingStats } from "@/components/player-ranking-stats";
import type { Player } from "@/lib/types/player";

export function PlayersSection({
  players,
  error,
}: {
  players: Player[];
  error?: string | null;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [canScroll, setCanScroll] = useState({ prev: false, next: false });

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanScroll({
      prev: el.scrollLeft > 8,
      next: el.scrollLeft < max - 8,
    });
    const card = el.querySelector<HTMLElement>("[data-player-card]");
    const cardWidth = card?.offsetWidth ?? 280;
    const gap = 24;
    setIndex(Math.round(el.scrollLeft / (cardWidth + gap)));
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, players.length]);

  function scrollByDir(dir: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-player-card]");
    const amount = (card?.offsetWidth ?? 280) + 24;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <section id="jugadores" className="overflow-hidden bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-muted">
              Nuestro equipo
            </p>
            <h2 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-4xl">
              Nuestros jugadores
            </h2>
            <span className="mt-3 block h-1 w-14 rounded-full bg-brand-lime" />
          </FadeIn>

          {!error && players.length > 0 && (
            <FadeIn delay={0.1} className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Anterior"
                disabled={!canScroll.prev}
                onClick={() => scrollByDir(-1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-navy/15 text-brand-navy transition hover:border-brand-lime hover:bg-brand-lime disabled:cursor-not-allowed disabled:opacity-30"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Siguiente"
                disabled={!canScroll.next}
                onClick={() => scrollByDir(1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-navy/15 text-brand-navy transition hover:border-brand-lime hover:bg-brand-lime disabled:cursor-not-allowed disabled:opacity-30"
              >
                →
              </button>
            </FadeIn>
          )}
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-8 text-center text-sm text-red-800">
            No pudimos cargar los jugadores desde la base de datos. ({error})
          </div>
        ) : players.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-navy/20 px-5 py-16 text-center text-sm text-brand-muted">
            Aún no hay jugadores publicados. Agrega datos en el mantenedor.
          </div>
        ) : (
          <>
            <div
              ref={trackRef}
              className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 scroll-smooth sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {players.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>

            <div className="mt-6 flex justify-center gap-1.5">
              {players.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`Ir a ${p.name}`}
                  onClick={() => {
                    const el = trackRef.current;
                    const card = el?.querySelectorAll<HTMLElement>(
                      "[data-player-card]",
                    )[i];
                    card?.scrollIntoView({
                      behavior: "smooth",
                      inline: "center",
                      block: "nearest",
                    });
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index
                      ? "w-6 bg-brand-lime"
                      : "w-1.5 bg-brand-navy/20 hover:bg-brand-navy/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function PlayerCard({ player }: { player: Player }) {
  const images =
    player.gallerySrcs.length > 0
      ? player.gallerySrcs
      : player.imageSrc
        ? [player.imageSrc]
        : [];
  const [imgIndex, setImgIndex] = useState(0);
  const current = images[imgIndex];

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => {
      setImgIndex((i) => (i + 1) % images.length);
    }, 4200);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <article
      data-player-card
      className="group w-[min(85vw,300px)] shrink-0 snap-center sm:w-[280px]"
    >
      <Link
        href={`/jugadores/${player.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-slate bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-brand-slate">
          <ImageSlot
            label={`Foto de ${player.name}`}
            hint="Foto jugador"
            src={current}
            alt={player.name}
            tone="light"
            className="transition duration-700 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded bg-brand-lime px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-navy">
            {player.category}
          </span>

          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === imgIndex ? "w-4 bg-white" : "w-1 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-base font-extrabold uppercase tracking-wide text-brand-navy">
            {player.name}
          </h3>
          <PlayerRankingStats player={player} variant="card" />

          {player.highlights[0] && (
            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-brand-navy/75">
              {player.highlights[0]}
            </p>
          )}

          <span className="mt-auto pt-4 text-xs font-bold uppercase tracking-wide text-brand-lime-dark transition group-hover:text-brand-navy">
            Ver perfil completo →
          </span>
        </div>
      </Link>
    </article>
  );
}
