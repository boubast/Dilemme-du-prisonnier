import { useMemo } from "react"
import type { Tournoi } from "@/type"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { type ChartConfig } from "@/components/ui/chart"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface TournamentInsightsTabProps {
  tournoi: Tournoi
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

  // 1. Construit la configuration de couleurs dynamique pour shadcn/ui charts
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {}
    tournoi.strategies.forEach((s, idx) => {
      config[s.id] = {
        label: s.nom,
        color: colorPalette[idx % colorPalette.length],
      }
    })
    return config
  }, [tournoi.strategies, colorPalette])

  // 2. Calcule les scores cumulés de chaque stratégie à chaque itération (1 à nb_iterations)
  const chartData = useMemo(() => {
    const strategies = tournoi.strategies
    const parties = tournoi.parties
    const nbIterations = tournoi.nb_iterations
    const couts = tournoi.couts

    // Initialise les scores cumulés à 0 pour chaque stratégie
    const runningTotals: Record<string, number> = {}
    strategies.forEach((s) => {
      runningTotals[s.id] = 0
    })

    const data: Array<Record<string, number>> = []

    for (let i = 0; i < nbIterations; i++) {
      // Pour cette itération, ajoute les points marqués par chaque stratégie dans tous ses matchs
      strategies.forEach((s) => {
        parties.forEach((p) => {
          const isS1 = p.strategie1.id === s.id
          const isS2 = p.strategie2.id === s.id
          if (!isS1 && !isS2) return

          const iter = p.iterations[i]
          if (!iter) return // Sécurité si le match a moins d'itérations

          const m1 = iter.coup_strategie1
          const m2 = iter.coup_strategie2

          const players = {
            p1: 0,
            p2: 0,
          }
          if (m1 && m2) {
            players.p1 = couts.recompense
            players.p2 = couts.recompense
          } else if (m1 && !m2) {
            players.p1 = couts.dupe
            players.p2 = couts.tentation
          } else if (!m1 && m2) {
            players.p1 = couts.tentation
            players.p2 = couts.dupe
          } else {
            players.p1 = couts.punition
            players.p2 = couts.punition
          }

          const points = isS1 ? players.p1 : players.p2
          runningTotals[s.id] += points
        })
      })

      // Enregistre les scores de cette itération
      const dataPoint: Record<string, number> = {
        iteration: i + 1,
      }
      strategies.forEach((s) => {
        dataPoint[s.id] = runningTotals[s.id]
      })
      data.push(dataPoint)
    }

    return data
  }, [
    tournoi.strategies,
    tournoi.parties,
    tournoi.nb_iterations,
    tournoi.couts,
  ])

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
