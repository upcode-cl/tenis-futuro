import { resolvePublicObjectUrl } from "@/lib/s3-public";
import type { SiteSettings } from "@/lib/cms/types";

export function resolveSiteLogoUrl(
  settings?: Pick<SiteSettings, "logoKey" | "logoSrc"> | null,
): string {
  if (settings?.logoKey) {
    const fromKey = resolvePublicObjectUrl(settings.logoKey);
    if (fromKey) return fromKey;
  }
  if (settings?.logoSrc?.trim()) return settings.logoSrc.trim();
  return "/LogoTenisFuturo.png";
}
