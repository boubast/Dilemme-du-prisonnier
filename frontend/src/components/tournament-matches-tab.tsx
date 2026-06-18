import type { Tournoi } from "@/type"
import { cn } from "@/lib/utils"

interface TournamentMatchesTabProps {
  tournoi: Tournoi
}

export default function TournamentMatchesTab({
  tournoi,
}: TournamentMatchesTabProps) {
  return (
    <div className="flex animate-in flex-col gap-4 py-2 duration-150 fade-in">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Match list</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {tournoi.parties.length} match
          {tournoi.parties.length === 1 ? "" : "es"} played
        </p>
      </div>

      <div className="flex max-h-100 flex-col gap-2 overflow-y-auto pr-1">
        {tournoi.parties.map((p, index) => {
          const score1 = p.scoreStrategie1
          const score2 = p.scoreStrategie2
          const isWinner1 = score1 > score2
          const isWinner2 = score2 > score1

          return (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-xs"
            >
              {/* Numéro du Match */}
              <span className="shrink-0 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Match {index + 1}
              </span>

              {/* Matchup */}
              <div className="flex min-w-0 flex-1 items-center justify-center gap-4 px-4">
                <span
                  className={cn(
                    "flex-1 truncate text-right",
                    isWinner1
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {p.strategie1.nom}
                </span>

                <div className="shrink-0 rounded bg-muted px-2.5 py-0.5 text-center font-mono font-semibold text-foreground">
                  {score1} &ndash; {score2}
                </div>

                <span
                  className={cn(
                    "flex-1 truncate text-left",
                    isWinner2
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {p.strategie2.nom}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
