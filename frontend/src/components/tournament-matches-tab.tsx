import type { Tournoi, Partie } from "@/type"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"

interface TournamentMatchesTabProps {
  tournoi: Tournoi
}

export default function TournamentMatchesTab({
  tournoi,
}: TournamentMatchesTabProps) {
  const getMatchScores = (p: Partie) => {
    let score1 = 0
    let score2 = 0
    p.iterations.forEach((iter) => {
      const m1 = iter.coup_strategie1
      const m2 = iter.coup_strategie2

      if (m1 && m2) {
        score1 += tournoi.couts.recompense
        score2 += tournoi.couts.recompense
      } else if (m1 && !m2) {
        score1 += tournoi.couts.dupe
        score2 += tournoi.couts.tentation
      } else if (!m1 && m2) {
        score1 += tournoi.couts.tentation
        score2 += tournoi.couts.dupe
      } else {
        score1 += tournoi.couts.punition
        score2 += tournoi.couts.punition
      }
    })
    return { score1, score2 }
  }

  return (
    <div className="flex flex-col gap-4 py-2 animate-in fade-in duration-150">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Liste des parties
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {tournoi.parties.length} match
          {tournoi.parties.length > 1 ? "s" : ""} joué
          {tournoi.parties.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
        {tournoi.parties.map((p, index) => {
          const { score1, score2 } = getMatchScores(p)
          const isWinner1 = score1 > score2
          const isWinner2 = score2 > score1

          return (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-xs"
            >
              {/* Numéro du Match */}
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase shrink-0">
                Partie {index + 1}
              </span>

              {/* Matchup */}
              <div className="flex flex-1 items-center justify-center gap-4 px-4 min-w-0">
                <span
                  className={cn(
                    "text-right flex-1 truncate",
                    isWinner1
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {p.strategie1.nom}
                </span>

                <div className="rounded bg-muted px-2.5 py-0.5 font-mono font-semibold text-foreground text-center shrink-0">
                  {score1} &ndash; {score2}
                </div>

                <span
                  className={cn(
                    "text-left flex-1 truncate",
                    isWinner2
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {p.strategie2.nom}
                </span>
              </div>

              {/* Badge du nombre de tours */}
              <Badge
                variant="outline"
                className="font-mono text-[10px] border-border shrink-0 bg-muted/20 text-muted-foreground"
              >
                {p.iterations.length} tours
              </Badge>
            </div>
          )
        })}
      </div>
    </div>
  )
}
