"use client";

import { FadeIn, Stagger, StaggerItem } from "@/components/fade-in";
import type { ProgramsContent } from "@/lib/cms/types";

export function ProgramsSection({ content }: { content: ProgramsContent }) {
  return (
    <section id="programas" className="bg-brand-slate py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-muted">
            {content.eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-4xl">
            {content.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-brand-navy/75 sm:text-lg text-justify text-justify-site">
            {content.intro}
          </p>
          <span className="mt-4 block h-1 w-14 rounded-full bg-brand-lime" />
        </FadeIn>

        <FadeIn delay={0.08} className="mt-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime-dark">
                {content.stageOneLabel}
              </p>
              <h3 className="mt-2 text-2xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-3xl">
                {content.stageOneTitle}
              </h3>
              <p className="mt-2 text-sm font-semibold text-brand-muted">
                {content.stageOneSubtitle}
              </p>
              <p className="mt-5 text-base leading-relaxed text-brand-navy/80 text-justify text-justify-site">
                {content.stageOneBody}
              </p>

              <div className="mt-8 space-y-5 border-t border-brand-navy/10 pt-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                    {content.stageOneObjectiveLabel}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-navy/80 text-justify text-justify-site">
                    {content.stageOneObjective}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                    {content.stageOneImpactLabel}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-brand-navy text-justify text-justify-site">
                    {content.stageOneImpact}
                  </p>
                </div>
              </div>
            </div>

            <Stagger className="grid gap-5 sm:grid-cols-2">
              {content.stageOneItems.map((item) => (
                <StaggerItem key={item.title}>
                  <article className="h-full border-t-2 border-brand-lime bg-white px-5 py-5">
                    <h4 className="text-sm font-extrabold uppercase tracking-wide text-brand-navy">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-brand-muted text-justify text-justify-site">
                      {item.body}
                    </p>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </FadeIn>

        <FadeIn delay={0.05} className="mt-16">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-muted">
            {content.futureEyebrow}
          </p>
          <h3 className="mt-2 text-xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-2xl">
            {content.futureTitle}
          </h3>
        </FadeIn>

        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {content.futureStages.map((stage) => (
            <StaggerItem key={stage.stage}>
              <article className="h-full border-l-2 border-brand-lime/80 bg-white/70 px-4 py-5">
                <p className="text-xs font-bold tracking-[0.18em] text-brand-lime-dark">
                  {stage.stage}
                </p>
                <h4 className="mt-2 text-sm font-extrabold uppercase leading-snug text-brand-navy">
                  {stage.title}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-brand-muted text-justify text-justify-site">
                  {stage.body}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>

        <FadeIn
          delay={0.08}
          className="mt-12 bg-brand-navy px-6 py-10 text-center sm:px-10"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
            {content.finalLabel}
          </p>
          <h3 className="mt-3 text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
            {content.finalTitle}
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base text-justify text-justify-site">
            {content.finalBody}
          </p>
          <a
            href={content.finalCta.href}
            className="mt-7 inline-flex items-center justify-center rounded-md bg-brand-lime px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-navy transition hover:bg-brand-lime-dark"
          >
            {content.finalCta.label}
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
