import { DEFAULT_SITE_CONTENT, DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import { normalizeHexColor } from "@/lib/cms/colors";
import { normalizeHeroSlides } from "@/lib/cms/hero-slides";
import type {
  HeroContent,
  SiteContent,
  SiteSettings,
} from "@/lib/cms/types";
import { getDb } from "@/lib/mongodb";

export const SITE_SETTINGS_COLLECTION = "site_settings";
export const SITE_CONTENT_COLLECTION = "site_content";
export const SITE_SETTINGS_ID = "default";
export const SITE_CONTENT_ID = "home";

type SettingsDoc = SiteSettings & { _id: string; updatedAt: Date };
type ContentDoc = SiteContent & { _id: string; updatedAt: Date };

function mergeSettings(doc?: Partial<SiteSettings> | null): SiteSettings {
  return {
    siteName: doc?.siteName?.trim() || DEFAULT_SITE_SETTINGS.siteName,
    tagline: doc?.tagline?.trim() || DEFAULT_SITE_SETTINGS.tagline,
    logoKey: doc?.logoKey?.trim() || DEFAULT_SITE_SETTINGS.logoKey,
    logoSrc: doc?.logoSrc?.trim() || DEFAULT_SITE_SETTINGS.logoSrc,
    colors: {
      ...DEFAULT_SITE_SETTINGS.colors,
      ...(doc?.colors ?? {}),
    },
  };
}

function mergeHero(hero?: Partial<HeroContent> | null): HeroContent {
  const merged: HeroContent = {
    ...DEFAULT_SITE_CONTENT.hero,
    ...(hero ?? {}),
    primaryCta: {
      ...DEFAULT_SITE_CONTENT.hero.primaryCta,
      ...(hero?.primaryCta ?? {}),
    },
    secondaryCta: {
      ...DEFAULT_SITE_CONTENT.hero.secondaryCta,
      ...(hero?.secondaryCta ?? {}),
    },
  };

  const slides = normalizeHeroSlides(hero);
  const resolved =
    slides.length > 0
      ? slides
      : normalizeHeroSlides({
          imageKey: merged.imageKey,
          imageSrc: merged.imageSrc,
          imageAlt: merged.imageAlt,
        });
  const images =
    resolved.length > 0 ? resolved : DEFAULT_SITE_CONTENT.hero.images;
  const first = images[0];

  return {
    ...merged,
    images,
    imageKey: first?.imageKey,
    imageSrc: first?.imageSrc || DEFAULT_SITE_CONTENT.hero.imageSrc,
    imageAlt: merged.imageAlt || DEFAULT_SITE_CONTENT.hero.imageAlt,
  };
}

function mergeContent(doc?: Partial<SiteContent> | null): SiteContent {
  return {
    hero: mergeHero(doc?.hero),
    about: {
      ...DEFAULT_SITE_CONTENT.about,
      ...(doc?.about ?? {}),
      paragraphs:
        doc?.about?.paragraphs?.length
          ? doc.about.paragraphs
          : DEFAULT_SITE_CONTENT.about.paragraphs,
      pillars:
        doc?.about?.pillars?.length
          ? doc.about.pillars
          : DEFAULT_SITE_CONTENT.about.pillars,
      impactItems:
        doc?.about?.impactItems?.length
          ? doc.about.impactItems
          : DEFAULT_SITE_CONTENT.about.impactItems,
    },
    programs: {
      ...DEFAULT_SITE_CONTENT.programs,
      ...(doc?.programs ?? {}),
      stageOneItems:
        doc?.programs?.stageOneItems?.length
          ? doc.programs.stageOneItems
          : DEFAULT_SITE_CONTENT.programs.stageOneItems,
      futureStages:
        doc?.programs?.futureStages?.length
          ? doc.programs.futureStages
          : DEFAULT_SITE_CONTENT.programs.futureStages,
    },
    support: {
      ...DEFAULT_SITE_CONTENT.support,
      ...(doc?.support ?? {}),
      actions:
        doc?.support?.actions?.length
          ? doc.support.actions
          : DEFAULT_SITE_CONTENT.support.actions,
    },
    sponsors: {
      ...DEFAULT_SITE_CONTENT.sponsors,
      ...(doc?.sponsors ?? {}),
      items: Array.isArray(doc?.sponsors?.items)
        ? doc.sponsors.items
        : DEFAULT_SITE_CONTENT.sponsors.items,
    },
  };
}

/** Migración/seed idempotente: crea documentos CMS si no existen. */
export async function ensureCmsSeed(): Promise<void> {
  const db = await getDb();
  const now = new Date();
  const settings = db.collection<SettingsDoc>(SITE_SETTINGS_COLLECTION);
  const content = db.collection<ContentDoc>(SITE_CONTENT_COLLECTION);

  const existingSettings = await settings.findOne({ _id: SITE_SETTINGS_ID });
  if (!existingSettings) {
    await settings.insertOne({
      _id: SITE_SETTINGS_ID,
      ...DEFAULT_SITE_SETTINGS,
      updatedAt: now,
    });
  }

  const existingContent = await content.findOne({ _id: SITE_CONTENT_ID });
  if (!existingContent) {
    await content.insertOne({
      _id: SITE_CONTENT_ID,
      ...DEFAULT_SITE_CONTENT,
      updatedAt: now,
    });
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    await ensureCmsSeed();
    const db = await getDb();
    const doc = await db
      .collection<SettingsDoc>(SITE_SETTINGS_COLLECTION)
      .findOne({ _id: SITE_SETTINGS_ID });
    return mergeSettings(doc);
  } catch (err) {
    console.error("[getSiteSettings]", err);
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    await ensureCmsSeed();
    const db = await getDb();
    const doc = await db
      .collection<ContentDoc>(SITE_CONTENT_COLLECTION)
      .findOne({ _id: SITE_CONTENT_ID });
    return mergeContent(doc);
  } catch (err) {
    console.error("[getSiteContent]", err);
    return DEFAULT_SITE_CONTENT;
  }
}

export async function updateSiteSettings(
  input: Partial<SiteSettings>,
): Promise<SiteSettings> {
  await ensureCmsSeed();
  const db = await getDb();
  const current = await getSiteSettings();

  const nextColors = { ...current.colors, ...(input.colors ?? {}) };
  for (const [key, value] of Object.entries(nextColors)) {
    const normalized = normalizeHexColor(String(value));
    if (!normalized) {
      throw new Error(`Color inválido en ${key}: usa formato #RRGGBB`);
    }
    nextColors[key as keyof typeof nextColors] = normalized;
  }

  const next: SiteSettings = {
    siteName: input.siteName?.trim() || current.siteName,
    tagline: input.tagline?.trim() || current.tagline,
    logoKey:
      input.logoKey !== undefined
        ? input.logoKey.trim() || undefined
        : current.logoKey,
    logoSrc:
      input.logoSrc !== undefined
        ? input.logoSrc.trim() || undefined
        : current.logoSrc,
    colors: nextColors,
  };

  await db.collection<SettingsDoc>(SITE_SETTINGS_COLLECTION).updateOne(
    { _id: SITE_SETTINGS_ID },
    { $set: { ...next, updatedAt: new Date() } },
    { upsert: true },
  );

  return next;
}

export async function updateSiteContent(
  input: Partial<SiteContent>,
): Promise<SiteContent> {
  await ensureCmsSeed();
  const db = await getDb();
  const current = await getSiteContent();

  const resolved = mergeContent({
    hero: input.hero ? { ...current.hero, ...input.hero } : current.hero,
    about: input.about ? { ...current.about, ...input.about } : current.about,
    programs: input.programs
      ? { ...current.programs, ...input.programs }
      : current.programs,
    support: input.support
      ? { ...current.support, ...input.support }
      : current.support,
    sponsors: input.sponsors
      ? { ...current.sponsors, ...input.sponsors }
      : current.sponsors,
  });

  await db.collection<ContentDoc>(SITE_CONTENT_COLLECTION).updateOne(
    { _id: SITE_CONTENT_ID },
    { $set: { ...resolved, updatedAt: new Date() } },
    { upsert: true },
  );

  return resolved;
}

/** Fuerza reescritura con defaults (migración / reset). */
export async function resetCmsToDefaults(): Promise<{
  settings: SiteSettings;
  content: SiteContent;
}> {
  const db = await getDb();
  const now = new Date();

  await db.collection<SettingsDoc>(SITE_SETTINGS_COLLECTION).updateOne(
    { _id: SITE_SETTINGS_ID },
    {
      $set: {
        ...DEFAULT_SITE_SETTINGS,
        updatedAt: now,
      },
    },
    { upsert: true },
  );

  await db.collection<ContentDoc>(SITE_CONTENT_COLLECTION).updateOne(
    { _id: SITE_CONTENT_ID },
    {
      $set: {
        ...DEFAULT_SITE_CONTENT,
        updatedAt: now,
      },
    },
    { upsert: true },
  );

  return {
    settings: DEFAULT_SITE_SETTINGS,
    content: DEFAULT_SITE_CONTENT,
  };
}
