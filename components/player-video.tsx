"use client";

import { useEffect, useRef, useState } from "react";
import type { PlayerVideoOrientation } from "@/lib/constants/player-video";

/**
 * Video corto del jugador: poster inmediato, src solo al entrar en viewport.
 * La orientación la define el admin (horizontal 16:9 o vertical 9:16).
 */
export function PlayerVideo({
  src,
  poster,
  title,
  orientation = "horizontal",
}: {
  src: string;
  poster?: string;
  title: string;
  orientation?: PlayerVideoOrientation;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const isVertical = orientation === "vertical";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px", threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`overflow-hidden rounded-2xl bg-brand-navy/5 shadow-lg ${
        isVertical ? "mx-auto w-full max-w-[320px] sm:max-w-[360px]" : "w-full"
      }`}
    >
      <video
        controls
        playsInline
        preload="none"
        poster={poster}
        className={`w-full bg-black object-contain ${
          isVertical ? "aspect-[9/16]" : "aspect-video"
        }`}
        aria-label={`Video de ${title}`}
        src={active ? src : undefined}
      >
        Tu navegador no soporta video HTML5.
      </video>
      <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-muted">
        Video destacado
        {isVertical ? " · Vertical" : " · Horizontal"}
      </p>
    </div>
  );
}
