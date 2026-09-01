import type { Player } from "@/lib/types/player";
import {
  formatTitlesLabel,
  formatTitlesLine,
  formatWtnSingles,
} from "@/lib/player-rankings";

type Variant = "card" | "profile";

export function PlayerRankingStats({
  player,
  variant = "profile",
}: {
  player: Player;
  variant?: Variant;
}) {
  const titlesLine = formatTitlesLine(player);
  const titlesLabel = formatTitlesLabel(player);
  const wtn = formatWtnSingles(player.wtnSingles);

  if (variant === "card") {
    return (
      <div className="mt-2 space-y-1 text-xs text-brand-muted">
        <p>{player.location}</p>
        <p className="font-semibold text-brand-navy">
          Ranking Nacional actual: #{player.ranking}
        </p>
        {player.bestNationalRanking != null && (
          <p>Mejor Ranking Nacional: #{player.bestNationalRanking}</p>
        )}
        {player.regionalRanking != null && (
          <p>Ranking Regional: #{player.regionalRanking}</p>
        )}
        <p>WTN Singles: {wtn}</p>
        {titlesLine && (
          <p>
            {titlesLabel}: {titlesLine}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-brand-navy/10 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wider text-brand-navy">
        Rankings y títulos
      </h2>
      <ul className="mt-4 space-y-2.5 text-sm text-brand-navy/90">
        <RankingRow label="Ranking Nacional actual" value={`#${player.ranking}`} />
        {player.bestNationalRanking != null && (
          <RankingRow
            label="Mejor Ranking Nacional"
            value={`#${player.bestNationalRanking}`}
          />
        )}
        {player.regionalRanking != null && (
          <RankingRow
            label="Ranking Regional"
            value={`#${player.regionalRanking}`}
          />
        )}
        <RankingRow label="WTN Singles" value={wtn} />
        {titlesLine && (
          <RankingRow label={titlesLabel} value={titlesLine} />
        )}
      </ul>
    </div>
  );
}

function RankingRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <span className="text-brand-muted">{label}:</span>
      <span className="font-bold text-brand-navy">{value}</span>
    </li>
  );
}
