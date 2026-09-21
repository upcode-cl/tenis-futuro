import type { HeroContent, HeroSlide } from "@/lib/cms/types";
import { resolvePublicObjectUrl } from "@/lib/s3-public";

const FALLBACK_SRC = "/heroPhoto.png";

function cleanSlide(slide: Partial<HeroSlide> | null | undefined): HeroSlide | null {
  const imageKey = slide?.imageKey?.trim() || undefined;
  const imageSrc = slide?.imageSrc?.trim() || "";
  const imageAlt = slide?.imageAlt?.trim() || undefined;
  if (!imageKey && !imageSrc) return null;
  return { imageKey, imageSrc, imageAlt };
}

/** Lista editable del hero. Si `images` viene en el documento, esa lista manda. */
export function normalizeHeroSlides(
  hero?: Partial<HeroContent> | null,
): HeroSlide[] {
  if (Array.isArray(hero?.images)) {
    return hero.images
      .map((slide) => cleanSlide(slide))
      .filter((slide): slide is HeroSlide => slide !== null);
  }

  const single = cleanSlide({
    imageKey: hero?.imageKey,
    imageSrc: hero?.imageSrc,
    imageAlt: hero?.imageAlt,
  });
  return single ? [single] : [];
}

export function applyHeroSlides(
  hero: HeroContent,
  images: HeroSlide[],
): HeroContent {
  const first = images[0];
  return {
    ...hero,
    images,
    imageKey: first?.imageKey ?? "",
    imageSrc: first?.imageSrc ?? "",
    imageAlt: hero.imageAlt,
  };
}

export type ResolvedHeroSlide = {
  src: string;
  alt: string;
  remote: boolean;
};

export function resolveHeroSlides(hero: HeroContent): ResolvedHeroSlide[] {
  const slides = normalizeHeroSlides(hero);
  const resolved = slides
    .map((slide) => {
      const fromKey = slide.imageKey
        ? resolvePublicObjectUrl(slide.imageKey)
        : undefined;
      const src = fromKey || slide.imageSrc;
      if (!src) return null;
      return {
        src,
        alt: slide.imageAlt?.trim() || hero.imageAlt,
        remote: src.startsWith("http://") || src.startsWith("https://"),
      };
    })
    .filter((slide): slide is ResolvedHeroSlide => slide !== null);

  if (resolved.length > 0) return resolved;

  return [
    {
      src: FALLBACK_SRC,
      alt: hero.imageAlt,
      remote: false,
    },
  ];
}

export function heroSlidePreview(slide: HeroSlide): string {
  return (
    resolvePublicObjectUrl(slide.imageKey) || slide.imageSrc || FALLBACK_SRC
  );
}
