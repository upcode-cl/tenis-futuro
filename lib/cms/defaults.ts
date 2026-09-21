import type { SiteContent, SiteSettings } from "@/lib/cms/types";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "Tenis Futuro",
  tagline: "Formamos personas, transformamos futuros",
  logoKey: "site/logo.png",
  logoSrc: "/LogoTenisFuturo.png",
  colors: {
    background: "#ffffff",
    foreground: "#0b1f3a",
    lime: "#c8f000",
    limeDark: "#a8d000",
    navy: "#0b1f3a",
    navyDeep: "#061526",
    slate: "#edf2f7",
    muted: "#5a6b7d",
  },
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    eyebrow: "Academia & Fundación",
    title: "Formamos personas,",
    titleAccent: "transformamos futuros",
    subtitle:
      "Fundación de desarrollo deportivo y personal para jóvenes de 8 a 18 años. El tenis como herramienta para potenciar capacidades, valores y oportunidades.",
    primaryCta: {
      label: "Conoce a nuestros jugadores",
      href: "#jugadores",
    },
    secondaryCta: {
      label: "Conoce la fundación",
      href: "#fundacion",
    },
    images: [
      {
        imageKey: "site/hero.png",
        imageSrc:
          "https://tenis-futuro-bucket.s3.us-east-1.amazonaws.com/site/hero.png",
        imageAlt:
          "Jugador de Tenis Futuro celebrando en cancha de polvo de ladrillo",
      },
    ],
    imageKey: "site/hero.png",
    imageSrc:
      "https://tenis-futuro-bucket.s3.us-east-1.amazonaws.com/site/hero.png",
    imageAlt:
      "Jugador de Tenis Futuro celebrando en cancha de polvo de ladrillo",
  },
  about: {
    eyebrow: "¿Quiénes somos?",
    title: "Fundación Tenis Futuro",
    tagline: "Formamos personas, transformamos futuros",
    paragraphs: [
      "Tenis Futuro es una fundación orientada al desarrollo deportivo y personal de niños, niñas y jóvenes entre 8 y 18 años, utilizando el tenis como una herramienta para potenciar sus capacidades, fortalecer valores y abrir nuevas oportunidades para su futuro.",
      "Creemos que el deporte puede ser mucho más que una actividad física. Puede convertirse en un espacio de formación, disciplina, esfuerzo, perseverancia, compañerismo y crecimiento personal.",
      "Nuestro propósito es acompañar a jóvenes que poseen talento, compromiso y motivación por el tenis, entregándoles las condiciones y oportunidades necesarias para desarrollar su máximo potencial, tanto dentro como fuera de la cancha.",
    ],
    visionTitle: "Nuestra visión",
    visionHeadline: "El talento necesita oportunidades para crecer.",
    visionBody:
      "Buscamos construir un ecosistema de desarrollo que combine entrenamiento de calidad, infraestructura deportiva, formación integral y experiencias nacionales e internacionales. Queremos que cada joven pueda descubrir sus capacidades, superar sus propios límites y comprender que los desafíos deportivos también pueden convertirse en aprendizajes para la vida.",
    pillars: [
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
    ],
    impactEyebrow: "Nuestro impacto",
    impactTitle: "Cada joven, una oportunidad",
    impactIntro:
      "Cada joven que participa en Tenis Futuro representa una oportunidad para generar un impacto positivo. Queremos contribuir a formar jóvenes que:",
    impactItems: [
      "Desarrollen disciplina y perseverancia.",
      "Aprendan a enfrentar desafíos y superar frustraciones.",
      "Fortalezcan su autoestima y confianza.",
      "Aprendan a trabajar y convivir con otros.",
      "Conozcan nuevas culturas y realidades.",
      "Tengan acceso a experiencias deportivas de nivel internacional.",
      "Descubran nuevas posibilidades para su futuro.",
    ],
    purposeEyebrow: "Nuestro propósito",
    purposeBody:
      "Detectar, acompañar, desarrollar y proyectar jóvenes a través del tenis, entregándoles herramientas deportivas, personales y experiencias que amplíen sus posibilidades de futuro.",
    purposeFooter:
      "Tenis Futuro — Formamos personas, transformamos futuros",
  },
  programs: {
    eyebrow: "Programas",
    title: "Programa de desarrollo integral",
    intro:
      "Un camino por etapas hacia el Centro de Desarrollo Integral Tenis Futuro: deporte, educación, salud, alimentación y experiencias internacionales.",
    stageOneLabel: "Etapa 1",
    stageOneTitle: "Infraestructura deportiva",
    stageOneSubtitle: "Un espacio para entrenar durante todo el año",
    stageOneBody:
      "Esta primera etapa contempla la construcción de la infraestructura básica necesaria para transformar la cancha existente en un espacio deportivo permanente, seguro y adecuado para nuestros jóvenes.",
    stageOneObjectiveLabel: "Objetivo",
    stageOneObjective:
      "Permitir que los jóvenes de 8 a 18 años entrenen de manera continua, sin que el clima sea una limitación, con instalaciones adecuadas de higiene, comodidad y seguridad.",
    stageOneImpactLabel: "Impacto esperado",
    stageOneImpact:
      "Una cancha que hoy ya existe → un espacio deportivo operativo durante todo el año.",
    stageOneItems: [
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
    ],
    futureEyebrow: "Próximas etapas",
    futureTitle: "El camino hacia el centro integral",
    futureStages: [
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
    ],
    finalLabel: "Etapa final",
    finalTitle: "Centro de Desarrollo Integral Tenis Futuro",
    finalBody:
      "Deporte + Educación + Salud + Alimentación + Experiencias internacionales. Formamos personas, transformamos futuros.",
    finalCta: {
      label: "Apoya este programa",
      href: "#apoyanos",
    },
  },
  support: {
    eyebrow: "Apóyanos",
    title: "¿Por qué apoyar a Tenis Futuro?",
    body: "Apoyar a Tenis Futuro significa invertir en las nuevas generaciones. El financiamiento de empresas, instituciones y personas permitirá avanzar en infraestructura, programas de formación, equipamiento, entrenamientos y experiencias internacionales.",
    actions: [
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
    ],
  },
  sponsors: {
    eyebrow: "Alianzas y Auspiciadores",
    title: "Nuestros Sponsors",
    description:
      "Empresas e instituciones comprometidas con el desarrollo deportivo y personal de nuestros jóvenes deportistas.",
    items: [
      {
        id: "sponsor-1",
        name: "Tenis Futuro",
        logoSrc: "/LogoTenisFuturo.png",
        url: "#",
      },
      {
        id: "sponsor-2",
        name: "Sponsor Oficial",
        logoSrc: "/LogoTenisFuturo.png",
        url: "#",
      },
      {
        id: "sponsor-3",
        name: "Partner Deportivo",
        logoSrc: "/LogoTenisFuturo.png",
        url: "#",
      },
    ],
  },
};
