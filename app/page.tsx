import { AboutSection } from "@/components/about-section";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { InstagramSection } from "@/components/instagram-section";
import { PlayersSection } from "@/components/players-section";
import { ProgramsSection } from "@/components/programs-section";
import { SupportSection } from "@/components/support-section";
import { SponsorsSection } from "@/components/sponsors-section";
import { NewsSection } from "@/components/news-section";
import { getSiteContent, getSiteSettings } from "@/lib/db/cms";
import { resolveSiteLogoUrl } from "@/lib/cms/logo";
import { listPlayers } from "@/lib/db/players";
import { listNews, ensureNewsSeed } from "@/lib/db/news";
import { getInstagramPosts } from "@/lib/instagram";

/** Contenido y jugadores siempre frescos */
export const dynamic = "force-dynamic";

export default async function Home() {
  await ensureNewsSeed();

  const [settings, content, instagram, news] = await Promise.all([
    getSiteSettings(),
    getSiteContent(),
    getInstagramPosts(6),
    listNews({ publishedOnly: true }),
  ]);

  let players: Awaited<ReturnType<typeof listPlayers>> = [];
  let playersError: string | null = null;

  try {
    players = await listPlayers({ randomize: true });
  } catch (err) {
    console.error("[Home] players", err);
    playersError =
      err instanceof Error ? err.message : "No se pudieron cargar los jugadores";
  }

  return (
    <>
      <Header logoSrc={resolveSiteLogoUrl(settings)} />
      <main className="flex-1">
        <Hero content={content.hero} />
        <AboutSection content={content.about} />
        <PlayersSection players={players} error={playersError} />
        <NewsSection news={news} />
        <ProgramsSection content={content.programs} />
        <InstagramSection posts={instagram.posts} error={instagram.error} />
        <SupportSection content={content.support} />
        <SponsorsSection content={content.sponsors} />
      </main>
      <Footer />
    </>
  );
}
