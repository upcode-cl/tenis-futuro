"use client";

import { FadeIn, Stagger, StaggerItem } from "@/components/fade-in";
import type { SupportContent } from "@/lib/cms/types";

export function SupportSection({ content }: { content: SupportContent }) {
  return (
    <section id="apoyanos" className="bg-brand-slate py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-muted">
            {content.eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-4xl">
            {content.title}
          </h2>
          <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-brand-lime" />
          <p className="mt-6 text-base leading-relaxed text-brand-navy/80 sm:text-lg text-justify text-justify-site">
            {content.body}
          </p>
        </FadeIn>

        <Stagger className="mt-12 grid gap-8 md:grid-cols-3">
          {content.actions.map((action) => (
            <StaggerItem key={action.id}>
              <article className="flex h-full flex-col border-t-2 border-brand-lime pt-6">
                <h3 className="text-xl font-extrabold uppercase text-brand-navy">
                  {action.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-muted text-justify text-justify-site">
                  {action.body}
                </p>
                <a
                  href={action.href}
                  className="mt-6 inline-flex items-center justify-center rounded-md bg-brand-lime px-4 py-3 text-sm font-bold uppercase tracking-wide text-brand-navy transition hover:bg-brand-lime-dark"
                >
                  {action.cta}
                </a>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
