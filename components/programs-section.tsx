"use client";

import { FadeIn, Stagger, StaggerItem } from "@/components/fade-in";

const STAGE_ONE_ITEMS = [
  {
    title: "Techado para la cancha",
    body: "Galpón o techado sobre la cancha existente, para entrenar todo el año sin depender del clima.",
  },
  {
    title: "Baños, duchas y vestidores",
    body: "Instalaciones diferenciadas para hombres y mujeres, con higiene, comodidad y seguridad.",
  },
  {
    title: "Iluminación y optimización",
    body: "Elementos necesarios para aprovechar al máximo el uso de la cancha.",
  },
  {
    title: "Circulación y servicios",
    body: "Espacios de circulación y servicios complementarios asociados a la infraestructura.",
  },
] as const;

const FUTURE_STAGES = [
  {
    stage: "02",
    title: "Preparación física",
    body: "Área de gimnasio y entrenamiento físico.",
  },
  {
    stage: "03",
    title: "Salud y rehabilitación",
    body: "Área médica, kinesiología y recuperación deportiva.",
  },
  {
    stage: "04",
    title: "Alimentación",
    body: "Comedor y programa de nutrición.",
  },
  {
    stage: "05",
    title: "Educación",
    body: "Área de estudios y reforzamiento escolar.",
  },
  {
    stage: "06",
    title: "Experiencias internacionales",
    body: "Campamentos, intercambios, giras y entrenamientos en otros países.",
  },
] as const;

export function ProgramsSection() {
  return (
    <section id="programas" className="bg-brand-slate py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-muted">
            Programas
          </p>
          <h2 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-4xl">
            Programa de desarrollo integral
          </h2>
          <p className="mt-3 text-base leading-relaxed text-brand-navy/75 sm:text-lg">
            Un camino por etapas hacia el Centro de Desarrollo Integral Tenis
            Futuro: deporte, educación, salud, alimentación y experiencias
            internacionales.
          </p>
          <span className="mt-4 block h-1 w-14 rounded-full bg-brand-lime" />
        </FadeIn>

        <FadeIn delay={0.08} className="mt-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-lime-dark">
                Etapa 1
              </p>
              <h3 className="mt-2 text-2xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-3xl">
                Infraestructura deportiva
              </h3>
              <p className="mt-2 text-sm font-semibold text-brand-muted">
                Un espacio para entrenar durante todo el año
              </p>
              <p className="mt-5 text-base leading-relaxed text-brand-navy/80">
                Esta primera etapa contempla la construcción de la
                infraestructura básica necesaria para transformar la cancha
                existente en un espacio deportivo permanente, seguro y adecuado
                para nuestros jóvenes.
              </p>

              <div className="mt-8 space-y-5 border-t border-brand-navy/10 pt-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                    Objetivo
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-navy/80">
                    Permitir que los jóvenes de 8 a 18 años entrenen de manera
                    continua, sin que el clima sea una limitación, con
                    instalaciones adecuadas de higiene, comodidad y seguridad.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                    Impacto esperado
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-brand-navy">
                    Una cancha que hoy ya existe → un espacio deportivo operativo
                    durante todo el año.
                  </p>
                </div>
              </div>
            </div>

            <Stagger className="grid gap-5 sm:grid-cols-2">
              {STAGE_ONE_ITEMS.map((item) => (
                <StaggerItem key={item.title}>
                  <article className="h-full border-t-2 border-brand-lime bg-white px-5 py-5">
                    <h4 className="text-sm font-extrabold uppercase tracking-wide text-brand-navy">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-brand-muted">
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
            Próximas etapas
          </p>
          <h3 className="mt-2 text-xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-2xl">
            El camino hacia el centro integral
          </h3>
        </FadeIn>

        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {FUTURE_STAGES.map((stage) => (
            <StaggerItem key={stage.stage}>
              <article className="h-full border-l-2 border-brand-lime/80 bg-white/70 px-4 py-5">
                <p className="text-xs font-bold tracking-[0.18em] text-brand-lime-dark">
                  {stage.stage}
                </p>
                <h4 className="mt-2 text-sm font-extrabold uppercase leading-snug text-brand-navy">
                  {stage.title}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-brand-muted">
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
            Etapa final
          </p>
          <h3 className="mt-3 text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
            Centro de Desarrollo Integral Tenis Futuro
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            Deporte + Educación + Salud + Alimentación + Experiencias
            internacionales. Formamos personas, transformamos futuros.
          </p>
          <a
            href="#apoyanos"
            className="mt-7 inline-flex items-center justify-center rounded-md bg-brand-lime px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-navy transition hover:bg-brand-lime-dark"
          >
            Apoya este programa
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
