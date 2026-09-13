import { colorsToCssVars } from "@/lib/cms/colors";
import type { SiteSettings } from "@/lib/cms/types";

/** Inyecta colores del CMS como CSS variables en :root */
export function ThemeStyles({ settings }: { settings: SiteSettings }) {
  const css = `:root { ${colorsToCssVars(settings.colors)} }`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
