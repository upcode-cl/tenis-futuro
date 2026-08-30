"use client";

import { FadeIn } from "@/components/fade-in";

export function Footer() {
  return (
    <footer id="contacto" className="relative bg-brand-navy-deep text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1.5fr_1fr]">
          <FadeIn>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-lime text-brand-navy">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M5 8c3 2 5 6 3 11M19 8c-3 2-5 6-3 11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-lime">
                  Tenis Futuro
                </p>
                <p className="text-xs uppercase tracking-wider text-white/60">
                  Fundación
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Formamos jugadores con propósito: rendimiento, educación y
              comunidad. Construimos futuro desde la cancha.
            </p>
            <div className="mt-5 flex gap-3">
              {["Instagram", "Facebook", "YouTube"].map((network) => (
                <a
                  key={network}
                  href="#"
                  aria-label={network}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-xs font-bold text-white/80 transition hover:border-brand-lime hover:text-brand-lime"
                >
                  {network.slice(0, 2).toUpperCase()}
                </a>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.08} className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterCol
              title="Navegación"
              links={[
                ["Inicio", "#inicio"],
                ["Jugadores", "#jugadores"],
                ["Instagram", "#instagram"],
                ["Contacto", "#contacto"],
              ]}
            />
            <FooterCol
              title="La Fundación"
              links={[
                ["Quiénes somos", "#fundacion"],
                ["Programa", "#programa"],
                ["Noticias", "#instagram"],
              ]}
            />
            <FooterCol
              title="Apóyanos"
              links={[
                ["Donar", "#aporte"],
                ["Colaborar", "#colaborar"],
                ["Sponsors", "#apoyanos"],
              ]}
            />
          </FadeIn>

          <FadeIn delay={0.16}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-lime">
              Contacto
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li>Santiago, Chile</li>
              <li>
                <a
                  href="mailto:contacto@tenisfuturo.cl"
                  className="transition hover:text-brand-lime"
                >
                  contacto@tenisfuturo.cl
                </a>
              </li>
              <li>
                <a href="tel:+56900000000" className="transition hover:text-brand-lime">
                  +56 9 0000 0000
                </a>
              </li>
            </ul>
          </FadeIn>
        </div>

        <div className="mt-14 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Fundación Tenis Futuro. Todos los derechos
          reservados.
        </div>
      </div>

      <a
        href="https://wa.me/56900000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-brand-lime px-5 py-3 text-sm font-bold uppercase tracking-wide text-brand-navy shadow-lg shadow-black/25 transition hover:scale-[1.03] hover:bg-brand-lime-dark"
      >
        Escríbenos por WhatsApp
      </a>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-brand-lime">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <a
              href={href}
              className="text-sm text-white/70 transition hover:text-brand-lime"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
