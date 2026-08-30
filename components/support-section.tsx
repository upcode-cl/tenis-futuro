"use client";

import { FadeIn, Stagger, StaggerItem } from "@/components/fade-in";

const CARDS = [
  {
    id: "aporte",
    title: "Apóyanos",
    body: "Tu aporte financia becas, torneos y el desarrollo integral de nuestros jugadores.",
    cta: "Haz tu aporte",
    href: "#aporte",
    icon: "heart",
  },
  {
    id: "colaborar",
    title: "Sé parte",
    body: "Súmate como voluntario, sponsor o mentor. Juntos amplificamos el impacto en cancha y fuera de ella.",
    cta: "Quiero colaborar",
    href: "#colaborar",
    icon: "people",
  },
  {
    id: "programa",
    title: "Educación y valores",
    body: "Un programa que une alto rendimiento, formación académica y principios de vida.",
    cta: "Conoce nuestro programa",
    href: "#programa",
    icon: "edu",
  },
] as const;

export function SupportSection() {
  return (
    <section id="apoyanos" className="bg-brand-slate py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-muted">
            La Fundación
          </p>
          <h2
            id="fundacion"
            className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-brand-navy sm:text-4xl"
          >
            Cómo puedes sumarte
          </h2>
          <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-brand-lime" />
        </FadeIn>

        <Stagger className="grid gap-6 md:grid-cols-3">
          {CARDS.map((card) => (
            <StaggerItem key={card.id}>
              <article className="flex h-full flex-col rounded-xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-lime/25 text-brand-lime-dark">
                  <CardIcon type={card.icon} />
                </span>
                <h3 className="text-xl font-extrabold uppercase text-brand-navy">
                  {card.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-muted">
                  {card.body}
                </p>
                <a
                  href={card.href}
                  className="mt-6 inline-flex items-center justify-center rounded-md bg-brand-lime px-4 py-3 text-sm font-bold uppercase tracking-wide text-brand-navy transition hover:bg-brand-lime-dark"
                >
                  {card.cta}
                </a>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function CardIcon({ type }: { type: (typeof CARDS)[number]["icon"] }) {
  const className = "h-6 w-6";
  if (type === "heart") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
        <path d="M12 21s-7.2-4.5-9.5-8.2C.5 9.8 2.2 6 5.6 6c1.9 0 3.2 1 4 2.1C10.4 7 11.7 6 13.6 6c3.4 0 5.1 3.8 3.1 6.8C19.2 16.5 12 21 12 21z" />
      </svg>
    );
  }
  if (type === "people") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
        <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM8 12a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 8 12zm8 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4zM8 14c-.3 0-.7 0-1 .1C4.6 14.5 2 15.7 2 18v2h6v-2c0-1.5.7-2.7 2-3.6-.6-.3-1.3-.4-2-.4z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 3 1 9l11 6 9-4.9V17h2V9L12 3zm0 13L5.5 12.4 4 13.2 12 18l8-4.8-1.5-.8L12 16z" />
    </svg>
  );
}
