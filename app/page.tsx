import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { InstagramSection } from "@/components/instagram-section";
import { PlayersSection } from "@/components/players-section";
import { SupportSection } from "@/components/support-section";
import { listPlayers } from "@/lib/db/players";
import { getInstagramPosts } from "@/lib/instagram";

/** Jugadores siempre desde MongoDB en cada visita */
export const dynamic = "force-dynamic";

export default async function Home() {
  const { posts, error: instagramError } = await getInstagramPosts(6);

  let players: Awaited<ReturnType<typeof listPlayers>> = [];
  let playersError: string | null = null;

  try {
    players = await listPlayers();
  } catch (err) {
    console.error("[Home] players", err);
    playersError =
      err instanceof Error ? err.message : "No se pudieron cargar los jugadores";
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <PlayersSection players={players} error={playersError} />
        <InstagramSection posts={posts} error={instagramError} />
        <SupportSection />
      </main>
      <Footer />
    </>
  );
}
