"use client";

import { FadeIn, Stagger, StaggerItem } from "@/components/fade-in";

const ACTIONS = [
  {
    id: "aporte",
    title: "Haz tu aporte",
    body: "Financia infraestructura, formación, equipamiento, entrenamientos y experiencias internacionales. Cada aporte puede convertirse en una cancha, un viaje o la oportunidad de que un joven descubra que sus sueños están más cerca.",
    cta: "Quiero aportar",
    href: "#contacto",
  },
  {
    id: "alianza",
    title: "Sé un aliado",
    body: "Buscamos alianzas con empresas, instituciones y personas que compartan nuestra convicción: el deporte puede transformar vidas e invertir en los jóvenes es invertir en el futuro.",
    cta: "Quiero colaborar",
    href: "#contacto",
  },
  {
    id: "programa",
    title: "Conoce el programa",
    body: "Desde el techado de la cancha hasta el Centro de Desarrollo Integral: un camino por etapas que une deporte, educación, salud y experiencias internacionales.",
    cta: "Ver programas",
    href: "#programas",
  },
] as const;

export function SupportSection() {
  return (
    <section id="apoyanos" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-muted">
            Apóyanos
          </p>
          <h2 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-4xl">
            ¿Por qué apoyar a Tenis Futuro?
          </h2>
          <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-brand-lime" />
          <p className="mt-6 text-base leading-relaxed text-brand-navy/80 sm:text-lg">
            Apoyar a Tenis Futuro significa invertir en las nuevas generaciones.
            El financiamiento de empresas, instituciones y personas permitirá
            avanzar en infraestructura, programas de formación, equipamiento,
            entrenamientos y experiencias internacionales.
          </p>
        </FadeIn>

        <Stagger className="mt-12 grid gap-8 md:grid-cols-3">
          {ACTIONS.map((action) => (
            <StaggerItem key={action.id}>
              <article className="flex h-full flex-col border-t-2 border-brand-lime pt-6">
                <h3 className="text-xl font-extrabold uppercase text-brand-navy">
                  {action.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-muted">
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
