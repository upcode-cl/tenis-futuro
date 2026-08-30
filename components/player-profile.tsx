"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImageSlot } from "@/components/image-slot";
import type { Player } from "@/lib/types/player";

export function PlayerProfile({ player }: { player: Player }) {
  const images =
    player.gallerySrcs.length > 0
      ? player.gallerySrcs
      : player.imageSrc
        ? [player.imageSrc]
        : [];
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
      <div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-brand-navy/5 shadow-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={images[active] ?? "empty"}
              initial={{ opacity: 0.4, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0"
            >
              <ImageSlot
                label={`Foto de ${player.name}`}
                hint="Sin imagen"
                src={images[active]}
                alt={player.name}
                tone="light"
              />
            </motion.div>
          </AnimatePresence>
          <span className="absolute left-4 top-4 rounded bg-brand-lime px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-navy">
            {player.category}
          </span>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Anterior"
                onClick={() =>
                  setActive((i) => (i - 1 + images.length) % images.length)
                }
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow transition hover:bg-brand-lime"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Siguiente"
                onClick={() => setActive((i) => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow transition hover:bg-brand-lime"
              >
                →
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(i)}
                className={`relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  i === active
                    ? "border-brand-lime"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-muted">
          Ficha del jugador
        </p>
        <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-4xl">
          {player.name}
        </h1>
        <p className="mt-2 text-brand-muted">{player.location}</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Ranking" value={`#${player.ranking}`} />
          <Stat label="Categoría" value={player.category} />
          {player.hand ? <Stat label="Mano" value={player.hand} /> : null}
          {player.heightCm ? (
            <Stat label="Altura" value={`${player.heightCm} cm`} />
          ) : null}
          {player.birthDate ? (
            <Stat label="Nacimiento" value={formatDate(player.birthDate)} />
          ) : null}
          {player.club ? <Stat label="Club" value={player.club} /> : null}
        </div>

        {player.bio && (
          <div className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-navy">
              Biografía
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-navy/80 whitespace-pre-line">
              {player.bio}
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {player.coach && (
            <Info label="Entrenador" value={player.coach} />
          )}
          {player.playingStyle && (
            <Info label="Estilo de juego" value={player.playingStyle} />
          )}
          {player.instagram && (
            <Info
              label="Instagram"
              value={
                <a
                  href={`https://instagram.com/${player.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-lime-dark hover:underline"
                >
                  @{player.instagram}
                </a>
              }
            />
          )}
        </div>

        {player.highlights.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-navy">
              Logros destacados
            </h2>
            <ul className="mt-3 space-y-2">
              {player.highlights.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm text-brand-navy/85"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-lime" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand-navy/10 bg-white px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-extrabold text-brand-navy">{value}</p>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
        {label}
      </p>
      <div className="mt-1 text-sm font-semibold text-brand-navy">{value}</div>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
