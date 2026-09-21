"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  resolveHeroSlides,
  type ResolvedHeroSlide,
} from "@/lib/cms/hero-slides";
import { isHeroBannerImage, loadImageDimensions } from "@/lib/cms/hero-image";
import type { HeroContent } from "@/lib/cms/types";

const SLIDE_MS = 6800;

function shuffleSlides(slides: ResolvedHeroSlide[]): ResolvedHeroSlide[] {
  const next = [...slides];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = next[i];
    next[i] = next[j];
    next[j] = current;
  }
  return next;
}

async function filterHeroBannerSlides(
  slides: ResolvedHeroSlide[],
): Promise<ResolvedHeroSlide[]> {
  const checks = await Promise.all(
    slides.map(async (slide) => {
      try {
        const { width, height } = await loadImageDimensions(slide.src);
        return isHeroBannerImage(width, height) ? slide : null;
      } catch {
        return null;
      }
    }),
  );
  return checks.filter((slide): slide is ResolvedHeroSlide => slide !== null);
}

export function Hero({ content }: { content: HeroContent }) {
  const source = resolveHeroSlides(content);
  const sourceKey = source.map((slide) => slide.src).join("\n");
  const sourceRef = useRef(source);
  sourceRef.current = source;
  const [slides, setSlides] = useState(source);
  const [index, setIndex] = useState(0);
  const [booted, setBooted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setBooted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const current = sourceRef.current;

    void (async () => {
      const valid = await filterHeroBannerSlides(current);
      if (cancelled) return;
      const usable =
        valid.length > 0
          ? valid
          : [
              {
                src: "/heroPhoto.png",
                alt: content.imageAlt,
                remote: false,
              },
            ];
      setSlides(usable.length > 1 ? shuffleSlides(usable) : usable);
      setIndex(0);
    })();

    return () => {
      cancelled = true;
    };
  }, [sourceKey, content.imageAlt]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      setIndex((current) => (current + 1) % slides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [slides, index]);

  const active = slides[index] ?? slides[0];
  const multiple = slides.length > 1;

  function goTo(next: number) {
    if (!multiple) return;
    setIndex((next + slides.length) % slides.length);
  }

  return (
    <section id="inicio" className="relative min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0 bg-brand-navy">
        <AnimatePresence initial={false}>
          {active && (
            <motion.div
              key={`${active.src}-${index}`}
              className="absolute inset-0"
              initial={
                !booted
                  ? { opacity: 1, scale: 1.04 }
                  : reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 1.08 }
              }
              animate={
                reduceMotion
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      scale: 1,
                      transition: {
                        opacity: { duration: 1.05, ease: [0.22, 1, 0.36, 1] },
                        scale: {
                          duration: multiple ? SLIDE_MS / 1000 : 1.35,
                          ease: multiple ? "linear" : [0.22, 1, 0.36, 1],
                        },
                      },
                    }
              }
              exit={
                reduceMotion
                  ? { opacity: 0, transition: { duration: 0.01 } }
                  : {
                      opacity: 0,
                      scale: 1.03,
                      transition: {
                        duration: 0.9,
                        ease: [0.22, 1, 0.36, 1],
                      },
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0.01 }
                  : { duration: 1.05, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <Image
                src={active.src}
                alt={active.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                unoptimized={active.remote}
                className="object-cover object-[68%_center] brightness-[1.04] contrast-[1.02] sm:object-[72%_center]"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[68%] bg-gradient-to-r from-brand-navy/80 via-brand-navy/30 to-transparent sm:w-[55%] lg:w-[46%]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-28 bg-gradient-to-t from-brand-navy/45 to-transparent sm:h-20"
          aria-hidden
        />
      </div>

      <div className="relative z-[2] mx-auto flex min-h-[100svh] w-full min-w-0 max-w-7xl flex-col justify-end px-4 pb-28 pt-28 sm:px-6 lg:justify-center lg:px-8 lg:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-4 max-w-full text-sm font-semibold uppercase tracking-[0.2em] text-brand-lime"
        >
          {content.eyebrow}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-full text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white sm:max-w-3xl sm:text-5xl lg:text-6xl break-words"
        >
          {content.title}{" "}
          <span className="text-brand-lime">{content.titleAccent}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.55 }}
          className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg text-justify text-justify-site"
        >
          {content.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.55 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <a
            href={content.primaryCta.href}
            className="inline-flex items-center justify-center rounded-md bg-brand-lime px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-navy transition hover:bg-brand-lime-dark"
          >
            {content.primaryCta.label}
          </a>
          <a
            href={content.secondaryCta.href}
            className="inline-flex items-center justify-center rounded-md border-2 border-white/80 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:border-brand-lime hover:text-brand-lime"
          >
            {content.secondaryCta.label}
          </a>
        </motion.div>

        {multiple && (
          <div
            className="mt-8 flex max-w-xl items-center gap-3"
            role="group"
            aria-label="Fotos del inicio"
          >
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() => goTo(index - 1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-brand-navy/35 text-white backdrop-blur-sm transition hover:border-brand-lime hover:text-brand-lime"
            >
              <Chevron direction="left" />
            </button>
            <div
              className="h-0.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/25"
              aria-hidden
            >
              <motion.div
                key={index}
                className="h-full w-full origin-left bg-brand-lime"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: reduceMotion ? 0.01 : SLIDE_MS / 1000,
                  ease: "linear",
                }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              {slides.map((slide, slideIndex) => (
                <button
                  key={`${slide.src}-${slideIndex}`}
                  type="button"
                  aria-label={`Foto ${slideIndex + 1} de ${slides.length}`}
                  aria-current={slideIndex === index ? "true" : undefined}
                  onClick={() => goTo(slideIndex)}
                  className={`h-1.5 rounded-full transition-all ${
                    slideIndex === index
                      ? "w-6 bg-brand-lime"
                      : "w-1.5 bg-white/55 hover:bg-white"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Foto siguiente"
              onClick={() => goTo(index + 1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-brand-navy/35 text-white backdrop-blur-sm transition hover:border-brand-lime hover:text-brand-lime"
            >
              <Chevron direction="right" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      {direction === "left" ? (
        <path d="M12.5 4.5 7 10l5.5 5.5" />
      ) : (
        <path d="M7.5 4.5 13 10l-5.5 5.5" />
      )}
    </svg>
  );
}
