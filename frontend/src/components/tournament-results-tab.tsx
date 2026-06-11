import type { Tournoi, Strategie } from "@/type"
import { Trophy } from "lucide-react"

interface TournamentResultsTabProps {
  tournoi: Tournoi
}

interface StrategyStats {
  strategy: Strategie
  scoreTotal: number
  totalTours: number
  victoires: number
  nuls: number
  defaites: number
  moyenneParTour: number
}

export default function TournamentResultsTab({
  tournoi,
}: TournamentResultsTabProps) {
  // Calcul dynamique des statistiques pour chaque stratégie du tournoi
  const stats: StrategyStats[] = tournoi.strategies.map((s) => {
    let scoreTotal = 0
    let totalTours = 0
    let victoires = 0
    let nuls = 0
    let defaites = 0

    tournoi.parties.forEach((p) => {
      const isS1 = p.strategie1.id === s.id
      const isS2 = p.strategie2.id === s.id
      if (!isS1 && !isS2) return

      let myScore = 0
      let opponentScore = 0

      p.iterations.forEach((iter) => {
        const m1 = iter.coup_strategie1
        const m2 = iter.coup_strategie2

        let p1 = 0
        let p2 = 0

        if (m1 && m2) {
          p1 = tournoi.couts.recompense
          p2 = tournoi.couts.recompense
        } else if (m1 && !m2) {
          p1 = tournoi.couts.dupe
          p2 = tournoi.couts.tentation
        } else if (!m1 && m2) {
          p1 = tournoi.couts.tentation
          p2 = tournoi.couts.dupe
        } else {
          p1 = tournoi.couts.punition
          p2 = tournoi.couts.punition
        }

        myScore += isS1 ? p1 : p2
        opponentScore += isS1 ? p2 : p1
      })

      scoreTotal += myScore
      totalTours += p.iterations.length

      if (myScore > opponentScore) {
        victoires += 1
      } else if (myScore === opponentScore) {
        nuls += 1
      } else {
        defaites += 1
      }
    })

    const moyenneParTour = totalTours > 0 ? scoreTotal / totalTours : 0

    return {
      strategy: s,
      scoreTotal,
      totalTours,
      victoires,
      nuls,
      defaites,
      moyenneParTour,
    }
  })

  // Trie les stratégies par score total décroissant
  stats.sort((a, b) => b.scoreTotal - a.scoreTotal)

  return (
    <div className="flex flex-col gap-4 py-2 animate-in fade-in duration-150">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Classement des stratégies
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Score cumulé sur l'ensemble des parties
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              <th className="px-4 py-3 w-12 text-center">#</th>
              <th className="px-4 py-3">Stratégie</th>
              <th className="px-4 py-3 text-right">Score total</th>
              <th className="px-4 py-3 text-right">Moyenne / tour</th>
              <th className="px-4 py-3 text-center w-32">V / N / D</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stats.map((row, index) => {
              const rank = index + 1
              const isFirst = rank === 1

              return (
                <tr
                  key={row.strategy.id}
                  className="hover:bg-muted/10 transition-colors"
                >
                  <td className="px-4 py-3.5 text-center font-medium text-muted-foreground align-middle">
                    {isFirst ? (
                      <div className="mx-auto flex size-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                        <Trophy className="size-3" />
                      </div>
                    ) : (
                      rank
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-foreground align-middle">
                    {row.strategy.nom}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-semibold text-foreground align-middle">
                    {row.scoreTotal}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-foreground align-middle">
                    {row.moyenneParTour.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-muted-foreground align-middle">
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
