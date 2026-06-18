import { useMemo } from "react"
import type { Tournoi, Partie } from "@/type"
import { cn } from "@/lib/utils"

interface TournamentMatrixTabProps {
  tournoi: Tournoi
}

export default function TournamentMatrixTab({
  tournoi,
}: TournamentMatrixTabProps) {
  // Tri des stratégies par classement (score total décroissant)
  const sortedStrategies = useMemo(() => {
    return [...tournoi.strategies].sort((a, b) => {
      const scoreA = tournoi.scores_totaux[a.id] ?? 0
      const scoreB = tournoi.scores_totaux[b.id] ?? 0
      return scoreB - scoreA
    })
  }, [tournoi.strategies, tournoi.scores_totaux])

  // Création d'une map associative pour retrouver la partie en O(1)
  const matchMap = useMemo(() => {
    const map = new Map<string, Partie>()
    tournoi.parties.forEach((p) => {
      // Clé normalisée triée pour être indépendante de l'ordre stratégie 1 / 2
      const key = [p.strategie1.id, p.strategie2.id].sort().join("-")
      map.set(key, p)
    })
    return map
  }, [tournoi.parties])

  return (
    <div className="flex animate-in flex-col gap-4 py-2 duration-150 fade-in">
      {/* En-tête et description */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Matrice des confrontations
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Scores individuels obtenus par la stratégie en ligne (Y) contre la
            stratégie en colonne (X).
          </p>
        </div>
      </div>

      {/* Grille de la Matrice */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full border-collapse text-left text-[11px]">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {/* Case vide en haut à gauche */}
              <th className="sticky left-0 z-20 max-w-45 min-w-35 truncate border-r border-border bg-muted px-3 py-3 font-semibold tracking-wider text-muted-foreground uppercase">
                Ligne (Y) \ Col (X)
              </th>
              {/* En-têtes des colonnes (Stratégies) */}
              {sortedStrategies.map((s) => (
                <th
                  key={s.id}
                  className="max-w-30 min-w-22.5 truncate border-r border-border px-2 py-3 text-center font-semibold tracking-wider text-muted-foreground uppercase"
                  title={s.nom}
                >
                  {s.nom}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedStrategies.map((y) => (
              <tr key={y.id} className="transition-colors hover:bg-muted/5">
                {/* En-tête de ligne sticky sur la gauche */}
                <td
                  className="sticky left-0 z-10 max-w-45 min-w-35 truncate border-r border-b border-border bg-card px-3 py-2.5 font-medium text-foreground shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"
                  title={y.nom}
                >
                  {y.nom}
                </td>

                {/* Cases de score */}
                {sortedStrategies.map((x) => {
                  const isDiagonal = y.id === x.id

                  if (isDiagonal) {
                    return (
                      <td
                        key={x.id}
                        className="border-r border-b border-border bg-muted/30 py-2.5 text-center font-mono text-muted-foreground/30 select-none"
                      >
                        -
                      </td>
                    )
                  }

                  const key = [y.id, x.id].sort().join("-")
                  const match = matchMap.get(key)

                  if (!match) {
                    return (
                      <td
                        key={x.id}
                        className="border-r border-b border-border py-2.5 text-center font-mono text-muted-foreground/40"
                      >
                        -
                      </td>
                    )
                  }

                  const isYStrategie1 = match.strategie1.id === y.id
                  const scoreY = isYStrategie1
                    ? match.scoreStrategie1
                    : match.scoreStrategie2
                  const scoreX = isYStrategie1
                    ? match.scoreStrategie2
                    : match.scoreStrategie1
                  const won = scoreY > scoreX
                  const isTie = scoreY === scoreX

                  return (
                    <td
                      key={x.id}
                      className={cn(
                        "cursor-default border-r border-b border-border py-2.5 text-center font-mono font-semibold transition-all duration-150 select-all",
                        won
                          ? "bg-blue-500/5 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400"
                          : isTie
                            ? "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                            : "bg-red-500/5 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                      )}
                      title={`${y.nom} (Y) vs ${x.nom} (X)\nScore Y : ${scoreY}\nScore X : ${scoreX}\nRésultat : ${won ? "Victoire" : isTie ? "Match Nul" : "Défaite"}`}
                    >
                      {scoreY}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
