"use client";

import { FadeIn, Stagger, StaggerItem } from "@/components/fade-in";
import type { AboutContent } from "@/lib/cms/types";

export function AboutSection({ content }: { content: AboutContent }) {
  return (
    <section id="fundacion" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-muted">
            {content.eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-4xl">
            {content.title}
          </h2>
          <p className="mt-3 text-lg font-bold uppercase tracking-wide text-brand-lime-dark sm:text-xl">
            {content.tagline}
          </p>
          <span className="mt-4 block h-1 w-14 rounded-full bg-brand-lime" />
          <div className="mt-8 space-y-5 text-base leading-relaxed text-brand-navy/80 sm:text-[17px]">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="text-justify text-justify-site">
                {paragraph}
              </p>
            ))}
          </div>
        </FadeIn>

        <FadeIn
          delay={0.08}
          className="mt-16 max-w-3xl border-l-4 border-brand-lime pl-6 sm:pl-8"
        >
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-brand-muted">
            {content.visionTitle}
          </h3>
          <p className="mt-3 text-xl font-extrabold leading-snug text-brand-navy sm:text-2xl">
            {content.visionHeadline}
          </p>
          <p className="mt-4 text-base leading-relaxed text-brand-navy/80 text-justify text-justify-site">
            {content.visionBody}
          </p>
        </FadeIn>

        <Stagger className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {content.pillars.map((pillar) => (
            <StaggerItem key={pillar.title}>
              <article>
                <span className="mb-4 block h-1 w-10 rounded-full bg-brand-lime" />
                <h3 className="text-lg font-extrabold uppercase tracking-tight text-brand-navy">
                  {pillar.title}
                </h3>
                {pillar.subtitle ? (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                    {pillar.subtitle}
                  </p>
                ) : null}
                <p className="mt-3 text-sm leading-relaxed text-brand-navy/75 text-justify text-justify-site">
                  {pillar.body}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-20 grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-start">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-muted">
              {content.impactEyebrow}
            </p>
            <h3 className="mt-2 text-2xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-3xl">
              {content.impactTitle}
            </h3>
            <span className="mt-3 block h-1 w-14 rounded-full bg-brand-lime" />
            <p className="mt-5 text-base leading-relaxed text-brand-navy/80 text-justify text-justify-site">
              {content.impactIntro}
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <ul className="space-y-3">
              {content.impactItems.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-brand-navy/85 sm:text-base text-justify text-justify-site"
                >
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-lime"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>

        <FadeIn
          delay={0.05}
          className="mt-16 bg-brand-navy px-6 py-10 text-center sm:px-10 sm:py-12"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-lime">
            {content.purposeEyebrow}
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-lg font-medium leading-relaxed text-white sm:text-xl text-justify text-justify-site">
            {content.purposeBody}
          </p>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
            {content.purposeFooter}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
