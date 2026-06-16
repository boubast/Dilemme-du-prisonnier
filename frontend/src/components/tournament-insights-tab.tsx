import { useMemo } from "react"
import type { Tournoi } from "@/type"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface TournamentInsightsTabProps {
  tournoi: Tournoi
}

const getScoreStrategies = (
  coup_s1: boolean,
  coup_s2: boolean,
  couts: Tournoi["couts"]
) => {
  if (!coup_s1) {
    return {
      scoreS1: coup_s2 ? couts.dupe : couts.recompense,
      scoreS2: coup_s2 ? couts.tentation : couts.recompense,
    }
  }

  return {
    scoreS1: coup_s2 ? couts.punition : couts.tentation,
    scoreS2: coup_s2 ? couts.punition : couts.dupe,
  }
}

// Calcule les scores pour une itération spécifique d'une partie donnée
const getScoreForIteration = (
  iterationIndex: number,
  partie: Tournoi["parties"][number],
  couts: Tournoi["couts"]
): Record<string, number> => {
  const { strategie1, strategie2, iterations } = partie
  const iter = iterations[iterationIndex]
  if (!iter) return {}

  const coup_s1 = iter.coup_strategie1
  const coup_s2 = iter.coup_strategie2
  const { scoreS1, scoreS2 } = getScoreStrategies(coup_s1, coup_s2, couts)

  return {
    [strategie1.id]: scoreS1,
    [strategie2.id]: scoreS2,
  }
}

const calculateChartData = (
  tournoi: Tournoi
): Array<Record<string, number>> => {
  const { strategies, parties, nb_iterations, couts } = tournoi
  const runningTotals: Record<string, number> = Object.fromEntries(
    strategies.map((s) => [s.id, 0])
  )

  // Liste des données à afficher sur le graphe, chaque élément représentant les scores cumulés à une itération donnée
  const data: Array<Record<string, number>> = []

  // Pour chaque itération, calcule les scores cumulés de chaque stratégie à partir des résultats de toutes les parties
  for (let i = 0; i < nb_iterations; i++) {
    parties.forEach((p) => {
      const scores = getScoreForIteration(i, p, couts)
      Object.entries(scores).forEach(([stratId, score]) => {
        runningTotals[stratId] = (runningTotals[stratId] || 0) + score
      })
    })

    data.push({
      iteration: i + 1,
      ...runningTotals,
    })
  }

  return data
}

export default function TournamentInsightsTab({
  tournoi,
}: TournamentInsightsTabProps) {
  // Palette de couleurs pour distinguer chaque stratégie sur le graphe
  const colorPalette = useMemo(
    () => [
      "oklch(0.6 0.18 250)", // Bleu
      "oklch(0.65 0.2 140)", // Vert
      "oklch(0.6 0.22 30)", // Orange
      "oklch(0.55 0.18 300)", // Violet
      "oklch(0.7 0.16 80)", // Jaune
      "oklch(0.6 0.18 0)", // Rouge
      "oklch(0.5 0.15 200)", // Turquoise
    ],
    []
  )

  // Construit la configuration de couleurs dynamique pour shadcn/ui charts
  const chartConfig = useMemo(() => {
    return Object.fromEntries(
      tournoi.strategies.map((s, idx) => [
        s.id,
        {
          label: s.nom,
          color: colorPalette[idx % colorPalette.length],
        },
      ])
    )
  }, [tournoi.strategies, colorPalette])

  // Calcule les scores cumulés de chaque stratégie à chaque itération
  const chartData = useMemo(() => calculateChartData(tournoi), [tournoi])

  return (
    <div className="flex animate-in flex-col gap-4 py-2 duration-150 fade-in">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Évolution des scores au cours du tournoi
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Score cumulé de chaque stratégie à chaque itération (somme de tous ses
          matchs)
        </p>
      </div>

      <div className="min-h-87.5 rounded-lg border border-border bg-card p-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-87.5 w-full"
        >
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="iteration"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}`}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {tournoi.strategies.map((s) => (
              <Line
                key={s.id}
                type="monotone"
                dataKey={s.id}
                stroke={`var(--color-${s.id})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  )
}
