"use client";

import { FadeIn, Stagger, StaggerItem } from "@/components/fade-in";

const PILLARS = [
  {
    title: "Infraestructura",
    subtitle: "Construir oportunidades",
    body: "Impulsamos la creación y mejora de espacios deportivos especializados. Invertir en infraestructura es crear lugares donde los jóvenes puedan soñar, esforzarse, aprender y construir su futuro.",
  },
  {
    title: "Experiencias internacionales",
    subtitle: "Más allá de las fronteras",
    body: "Programas de entrenamiento e intercambio que permiten a jóvenes de 8 a 18 años viajar, competir y compartir con jugadores de su edad, conociendo nuevas metodologías y culturas.",
  },
  {
    title: "Red de oportunidades",
    subtitle: "Conectar con el mundo",
    body: "Alianzas con academias, clubes, entrenadores e instituciones nacionales e internacionales: campamentos, intercambios y giras que entregan herramientas más allá de la cancha.",
  },
] as const;

const IMPACT = [
  "Desarrollen disciplina y perseverancia.",
  "Aprendan a enfrentar desafíos y superar frustraciones.",
  "Fortalezcan su autoestima y confianza.",
  "Aprendan a trabajar y convivir con otros.",
  "Conozcan nuevas culturas y realidades.",
  "Tengan acceso a experiencias deportivas de nivel internacional.",
  "Descubran nuevas posibilidades para su futuro.",
] as const;

export function AboutSection() {
  return (
    <section id="fundacion" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-muted">
            ¿Quiénes somos?
          </p>
          <h2 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-4xl">
            Fundación Tenis Futuro
          </h2>
          <p className="mt-3 text-lg font-bold uppercase tracking-wide text-brand-lime-dark sm:text-xl">
            Formamos personas, transformamos futuros
          </p>
          <span className="mt-4 block h-1 w-14 rounded-full bg-brand-lime" />
          <div className="mt-8 space-y-5 text-base leading-relaxed text-brand-navy/80 sm:text-[17px]">
            <p>
              Tenis Futuro es una fundación orientada al desarrollo deportivo y
              personal de niños, niñas y jóvenes entre 8 y 18 años, utilizando el
              tenis como una herramienta para potenciar sus capacidades,
              fortalecer valores y abrir nuevas oportunidades para su futuro.
            </p>
            <p>
              Creemos que el deporte puede ser mucho más que una actividad
              física. Puede convertirse en un espacio de formación, disciplina,
              esfuerzo, perseverancia, compañerismo y crecimiento personal.
            </p>
            <p>
              Nuestro propósito es acompañar a jóvenes que poseen talento,
              compromiso y motivación por el tenis, entregándoles las condiciones
              y oportunidades necesarias para desarrollar su máximo potencial,
              tanto dentro como fuera de la cancha.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.08} className="mt-16 max-w-3xl border-l-4 border-brand-lime pl-6 sm:pl-8">
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-brand-muted">
            Nuestra visión
          </h3>
          <p className="mt-3 text-xl font-extrabold leading-snug text-brand-navy sm:text-2xl">
            El talento necesita oportunidades para crecer.
          </p>
          <p className="mt-4 text-base leading-relaxed text-brand-navy/80">
            Buscamos construir un ecosistema de desarrollo que combine
            entrenamiento de calidad, infraestructura deportiva, formación
            integral y experiencias nacionales e internacionales. Queremos que
            cada joven pueda descubrir sus capacidades, superar sus propios
            límites y comprender que los desafíos deportivos también pueden
            convertirse en aprendizajes para la vida.
          </p>
        </FadeIn>

        <Stagger className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {PILLARS.map((pillar) => (
            <StaggerItem key={pillar.title}>
              <article>
                <span className="mb-4 block h-1 w-10 rounded-full bg-brand-lime" />
                <h3 className="text-lg font-extrabold uppercase tracking-tight text-brand-navy">
                  {pillar.title}
                </h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                  {pillar.subtitle}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-brand-navy/75">
                  {pillar.body}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-20 grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-start">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-muted">
              Nuestro impacto
            </p>
            <h3 className="mt-2 text-2xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-3xl">
              Cada joven, una oportunidad
            </h3>
            <span className="mt-3 block h-1 w-14 rounded-full bg-brand-lime" />
            <p className="mt-5 text-base leading-relaxed text-brand-navy/80">
              Cada joven que participa en Tenis Futuro representa una
              oportunidad para generar un impacto positivo. Queremos contribuir
              a formar jóvenes que:
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <ul className="space-y-3">
              {IMPACT.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-brand-navy/85 sm:text-base"
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
            Nuestro propósito
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-lg font-medium leading-relaxed text-white sm:text-xl">
            Detectar, acompañar, desarrollar y proyectar jóvenes a través del
            tenis, entregándoles herramientas deportivas, personales y
            experiencias que amplíen sus posibilidades de futuro.
          </p>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
            Tenis Futuro — Formamos personas, transformamos futuros
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
