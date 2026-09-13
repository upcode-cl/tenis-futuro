export type SiteColors = {
  background: string;
  foreground: string;
  lime: string;
  limeDark: string;
  navy: string;
  navyDeep: string;
  slate: string;
  muted: string;
};

export type SiteSettings = {
  siteName: string;
  tagline: string;
  /** Key S3 del logo (ej. site/logo.png) */
  logoKey?: string;
  /** URL pública o ruta /public */
  logoSrc?: string;
  colors: SiteColors;
};

export type CtaLink = {
  label: string;
  href: string;
};

export type TextBlock = {
  title: string;
  subtitle?: string;
  body: string;
};

export type StageItem = {
  title: string;
  body: string;
};

export type FutureStage = {
  stage: string;
  title: string;
  body: string;
};

export type SupportAction = {
  id: string;
  title: string;
  body: string;
  cta: string;
  href: string;
};

export type HeroContent = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
  /** Key S3 (ej. site/hero.png) — preferido */
  imageKey?: string;
  /** URL pública o ruta /public (fallback) */
  imageSrc: string;
  imageAlt: string;
};

export type AboutContent = {
  eyebrow: string;
  title: string;
  tagline: string;
  paragraphs: string[];
  visionTitle: string;
  visionHeadline: string;
  visionBody: string;
  pillars: TextBlock[];
  impactEyebrow: string;
  impactTitle: string;
  impactIntro: string;
  impactItems: string[];
  purposeEyebrow: string;
  purposeBody: string;
  purposeFooter: string;
};

export type ProgramsContent = {
  eyebrow: string;
  title: string;
  intro: string;
  stageOneLabel: string;
  stageOneTitle: string;
  stageOneSubtitle: string;
  stageOneBody: string;
  stageOneObjectiveLabel: string;
  stageOneObjective: string;
  stageOneImpactLabel: string;
  stageOneImpact: string;
  stageOneItems: StageItem[];
  futureEyebrow: string;
  futureTitle: string;
  futureStages: FutureStage[];
  finalLabel: string;
  finalTitle: string;
  finalBody: string;
  finalCta: CtaLink;
};

export type SupportContent = {
  eyebrow: string;
  title: string;
  body: string;
  actions: SupportAction[];
};

export type SponsorItem = {
  id: string;
  name: string;
  /** Key en S3 si fue subido al bucket */
  logoKey?: string;
  /** URL pública o relativa del logo */
  logoSrc: string;
  /** Enlace opcional a la web del sponsor */
  url?: string;
};

export type SponsorsContent = {
  eyebrow: string;
  title: string;
  description: string;
  items: SponsorItem[];
};

export type SiteContent = {
  hero: HeroContent;
  about: AboutContent;
  programs: ProgramsContent;
  support: SupportContent;
  sponsors: SponsorsContent;
};

export type SiteSettingsDocument = SiteSettings & {
  _id: string;
  updatedAt: Date;
};

export type SiteContentDocument = SiteContent & {
  _id: string;
  updatedAt: Date;
};
