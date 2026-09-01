import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PlayerProfile } from "@/components/player-profile";
import { getPlayerById, listPlayers } from "@/lib/db/players";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const player = await getPlayerById(id);
  if (!player) return { title: "Jugador | Tenis Futuro" };
  return {
    title: `${player.name} | Tenis Futuro`,
    description:
      player.bio ||
      `${player.name} — ${player.category}, ranking #${player.ranking}`,
  };
}

export default async function PlayerPage({ params }: PageProps) {
  const { id } = await params;
  const player = await getPlayerById(id);
  if (!player || !player.published) notFound();

  const others = (await listPlayers())
    .filter((p) => p.id !== player.id)
    .slice(0, 4);

  return (
    <>
      <Header />
      <main className="flex-1 bg-brand-slate">
        <div className="mx-auto max-w-6xl px-4 pt-28 pb-10 sm:px-6 sm:pt-32 lg:px-8 lg:pb-14">
          <Link
            href="/#jugadores"
            className="mb-8 inline-flex items-center gap-2 rounded-md border border-brand-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-brand-navy shadow-sm transition hover:border-brand-lime hover:bg-brand-lime/20"
          >
            ← Volver a jugadores
          </Link>
          <PlayerProfile player={player} />

          {others.length > 0 && (
            <section className="mt-16">
              <h2 className="text-lg font-extrabold uppercase tracking-tight text-brand-navy">
                Otros jugadores
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {others.map((p) => (
                  <Link
                    key={p.id}
                    href={`/jugadores/${p.id}`}
                    className="rounded-xl border border-brand-navy/10 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <p className="text-[11px] font-bold uppercase text-brand-lime-dark">
                      {p.category}
                    </p>
                    <p className="mt-1 font-extrabold uppercase text-brand-navy">
                      {p.name}
                    </p>
                    <p className="mt-1 text-xs text-brand-muted">
                      Ranking nacional #{p.ranking}
                      {p.regionalRanking != null
                        ? ` · Regional #${p.regionalRanking}`
                        : ""}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
