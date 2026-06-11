import type { Tournoi } from "@/type"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"

interface TournamentMatchesTabProps {
  tournoi: Tournoi
}

export default function TournamentMatchesTab({
  tournoi,
}: TournamentMatchesTabProps) {
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

      <div className="flex flex-col gap-2 max-h-100 overflow-y-auto pr-1">
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
