import type { Tournoi } from "@/type"
import { Trophy } from "lucide-react"

interface TournamentResultsTabProps {
  tournoi: Tournoi
}

export default function TournamentResultsTab({
  tournoi,
}: TournamentResultsTabProps) {
  const stats = tournoi.strategies.map((s) => {
    const scoreTotal = tournoi.scores_totaux[s.id] ?? 0
    const vnd = tournoi.resultats[s.id] || {
      victoires: 0,
      nuls: 0,
      defaites: 0,
    }

    return {
      strategy: s,
      scoreTotal,
      victoires: vnd.victoires,
      nuls: vnd.nuls,
      defaites: vnd.defaites,
    }
  })

  // Trie les stratégies par score total décroissant
  stats.sort((a, b) => b.scoreTotal - a.scoreTotal)

  return (
    <div className="flex animate-in flex-col gap-4 py-2 duration-150 fade-in">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Classement des stratégies
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Score cumulé sur l'ensemble des parties
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              <th className="w-12 px-4 py-3 text-center">#</th>
              <th className="px-4 py-3">Stratégie</th>
              <th className="px-4 py-3 text-right">Score total</th>
              <th className="w-32 px-4 py-3 text-center">V / N / D</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stats.map((row, index) => {
              const rank = index + 1
              const isFirst = rank === 1

              return (
                <tr
                  key={row.strategy.id}
                  className="transition-colors hover:bg-muted/10"
                >
                  <td className="px-4 py-3.5 text-center align-middle font-medium text-muted-foreground">
                    {isFirst ? (
                      <div className="mx-auto flex size-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                        <Trophy className="size-3" />
                      </div>
                    ) : (
                      rank
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-middle font-medium text-foreground">
                    {row.strategy.nom}
                  </td>
                  <td className="px-4 py-3.5 text-right align-middle font-mono font-semibold text-foreground">
                    {row.scoreTotal}
                  </td>
                  <td className="px-4 py-3.5 text-center align-middle font-mono text-muted-foreground">
                    {row.victoires} / {row.nuls} / {row.defaites}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
