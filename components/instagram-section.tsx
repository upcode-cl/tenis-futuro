"use client";

import { FadeIn, Stagger, StaggerItem } from "@/components/fade-in";
import type { InstagramPost } from "@/lib/instagram";

export function InstagramSection({
  posts,
  error,
}: {
  posts: InstagramPost[];
  error: string | null;
}) {
  return (
    <section id="instagram" className="bg-brand-navy py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-lime">
              Síguenos en Instagram
            </p>
            <h2 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
              Lo último en{" "}
              <span className="text-brand-lime">@tenisfuturo</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-white/25 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:border-brand-lime hover:text-brand-lime"
            >
              <CameraIcon className="h-4 w-4" />
              Ir a Instagram
            </a>
          </FadeIn>
        </div>

        {error ? (
          <FadeIn>
            <div className="rounded-xl border border-white/15 bg-white/5 px-5 py-8 text-center text-sm text-white/80">
              No pudimos cargar el feed ahora.{" "}
              <span className="text-white/50">({error})</span>
            </div>
          </FadeIn>
        ) : posts.length === 0 ? (
          <FadeIn>
            <div className="rounded-xl border border-dashed border-white/25 px-5 py-16 text-center text-sm text-white/70">
              Aún no hay publicaciones para mostrar.
            </div>
          </FadeIn>
        ) : (
          <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {posts.map((post) => {
              const image = post.thumbnailUrl ?? post.mediaUrl;
              const caption =
                post.caption?.replace(/\s+/g, " ").trim().slice(0, 80) ??
                "Ver publicación";

              return (
                <StaggerItem key={post.id}>
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-brand-navy-deep">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-white/50">
                          Sin imagen
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-4 bg-brand-navy/0 opacity-0 transition group-hover:bg-brand-navy/55 group-hover:opacity-100">
                        <span className="text-xs font-semibold text-white">
                          Ver post
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/70">
                      {caption}
                      {post.caption && post.caption.length > 80 ? "…" : ""}
                    </p>
                  </a>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}

        <FadeIn delay={0.15} className="mt-10 flex justify-center">
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-white/30 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:border-brand-lime hover:text-brand-lime"
          >
            Cargar más publicaciones
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M9 3 7.2 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3H9zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" />
    </svg>
  );
}
