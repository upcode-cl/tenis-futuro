/**
 * Migración CMS Fase 1 — inserta site_settings y site_content si no existen.
 * Uso (con MONGODB_URI en .env.local):
 *   pnpm exec tsx --env-file=.env.local scripts/seed-cms.ts
 *
 * También se ejecuta automáticamente al cargar el sitio o el admin.
 */
import { ensureCmsSeed, getSiteContent, getSiteSettings } from "../lib/db/cms";

async function main() {
  await ensureCmsSeed();
  const settings = await getSiteSettings();
  const content = await getSiteContent();
  console.log("CMS seed OK");
  console.log("- settings:", settings.siteName, "/", settings.tagline);
  console.log("- content:", Object.keys(content).join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
