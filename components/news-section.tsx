"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FadeIn } from "@/components/fade-in";
import type { News } from "@/lib/types/news";

export function NewsSection({ news }: { news: News[] }) {
  if (!news || news.length === 0) return null;

  return (
    <section id="noticias" className="bg-brand-slate py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-muted">
            Actualidad y Novedades
          </p>
          <h2 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-4xl">
            Noticias Tenis Futuro
          </h2>
          <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-brand-lime" />
          <p className="mt-4 text-base text-brand-navy/80 sm:text-lg text-justify text-justify-site">
            Conoce los últimos hitos, torneos, actividades formativas y convenios que impulsan el desarrollo de nuestros jóvenes tenistas.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-brand-navy/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Link href={`/noticias/${item.id}`} className="flex flex-1 flex-col">
                {/* Multimedia Header */}
                <div className="relative aspect-video w-full overflow-hidden bg-brand-navy/5">
                  {item.mediaType === "video" ? (
                    <video
                      src={item.mediaSrc}
                      preload="metadata"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={item.mediaSrc || "/LogoTenisFuturo.png"}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {item.tag && (
                      <span className="rounded-md bg-brand-navy/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-lime backdrop-blur-xs">
                        {item.tag}
                      </span>
                    )}
                    {item.mediaType === "video" && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-black/80 px-2 py-1 text-[11px] font-bold uppercase text-white">
                        <span>▶</span> Video
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted">
                    <time dateTime={item.date}>{formatDate(item.date)}</time>
                    {item.author && (
                      <>
                        <span>•</span>
                        <span>{item.author}</span>
                      </>
                    )}
                  </div>

                  <h3 className="mt-3 text-lg font-extrabold uppercase leading-snug tracking-tight text-brand-navy transition group-hover:text-brand-lime-dark">
                    {item.title}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-navy/75 text-justify text-justify-site line-clamp-3">
                    {item.summary}
                  </p>

                  <div className="mt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-navy group-hover:text-brand-lime-dark">
                    <span>Leer noticia completa</span>
                    <span className="transition duration-200 group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
