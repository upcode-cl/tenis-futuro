"use client";

import { motion } from "motion/react";
import Image from "next/image";

export function Hero() {
  return (
    <section id="inicio" className="relative min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/heroPhoto.png"
            alt="Jugador de Tenis Futuro celebrando en cancha de polvo de ladrillo"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[55%_25%] sm:object-[60%_center] brightness-[1.05] contrast-[1.02]"
          />
        </motion.div>
        {/* Sombra solo a la izquierda para el texto; el jugador (derecha) queda limpio */}
        <div
          className="absolute inset-y-0 left-0 w-[68%] sm:w-[55%] lg:w-[46%] bg-gradient-to-r from-brand-navy/80 via-brand-navy/30 to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-brand-navy/45 to-transparent sm:h-20"
          aria-hidden
        />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-20 pt-28 sm:px-6 lg:justify-center lg:px-8 lg:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-brand-lime"
        >
          Academia & Fundación
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          Formamos jugadores,{" "}
          <span className="text-brand-lime">construimos futuro</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.55 }}
          className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg"
        >
          Impulsamos el talento juvenil con entrenamiento de alto nivel,
          educación y valores. Cada punto en la cancha es una oportunidad de
          crecimiento.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.55 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <a
            href="#jugadores"
            className="inline-flex items-center justify-center rounded-md bg-brand-lime px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-navy transition hover:bg-brand-lime-dark"
          >
            Conoce a nuestros jugadores
          </a>
          <a
            href="#fundacion"
            className="inline-flex items-center justify-center rounded-md border-2 border-white/80 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:border-brand-lime hover:text-brand-lime"
          >
            Conoce la fundación
          </a>
        </motion.div>
      </div>
    </section>
  );
}
