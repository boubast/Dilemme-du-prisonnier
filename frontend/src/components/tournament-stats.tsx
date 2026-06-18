import { LoaderCircle, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

import { useTournament } from "@/hooks/useTournament"
import { Badge } from "./ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import TournamentResultsTab from "./tournament-results-tab"
import TournamentMatchesTab from "./tournament-matches-tab"
import TournamentMatrixTab from "./tournament-matrix-tab"
import TournamentInsightsTab from "./tournament-insights-tab"

interface TournamentStatsProps {
  tournamentId: string | null
  creating?: boolean
}

export default function TournamentStats({
  tournamentId,
  creating = false,
}: TournamentStatsProps) {
  const { activeTournament: tournament, activeLoading: loading } =
    useTournament(tournamentId, false)

  if (creating) {
    return (
      <section className="flex min-h-120 w-2/3 flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 pt-12 text-center">
        <LoaderCircle className="size-6 animate-spin text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Tournament in progress...
          </p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Statistics will appear once all matches have finished.
          </p>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="flex min-h-120 w-2/3 animate-pulse flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <div className="h-6 w-1/3 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="mt-2 flex gap-2">
          <div className="h-5 w-20 rounded-full bg-muted" />
          <div className="h-5 w-28 rounded-full bg-muted" />
          <div className="h-5 w-24 rounded-full bg-muted" />
        </div>
        <div className="mt-4 h-8 w-48 rounded-lg bg-muted" />
        <div className="mt-2 h-32 w-full rounded bg-muted" />
      </section>
    )
  }

  if (!tournament) {
    return (
      <section className="flex min-h-120 w-2/3 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p className="text-sm font-medium">
          No tournament selected or available.
        </p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          Configure and start a tournament above to generate statistics.
        </p>
      </section>
    )
  }

  const stats = tournament.strategies.map((s) => {
    const scoreTotal = tournament.scores_totaux[s.id] ?? 0
    const multiStat = tournament.multi_stats?.[s.id] || {
      cooperations: 0,
      betrayal: 0,
    }

    return {
      strategy: s,
      scoreTotal,
      cooperations: multiStat.cooperations,
      betrayal: multiStat.betrayal,
    }
  })

  // Trie les stratégies par score total décroissant
  stats.sort((a, b) => b.scoreTotal - a.scoreTotal)

  const isMulti = tournament.type === "Multi"

  return (
    <section className="flex min-h-120 w-2/3 flex-col gap-4 rounded-xl border border-border bg-card p-5">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold text-foreground">
          {tournament.nom}
        </h2>

        {/* Badges descriptifs */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="secondary"
            className={cn(
              "h-5 border-none px-2 text-[10px] font-medium uppercase",
              tournament.type === "Multi"
                ? "bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                : "bg-zinc-500/15 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400"
            )}
          >
            {tournament.type === "Multi" ? "Multi" : "Classique"}
          </Badge>
          <Badge
            variant="secondary"
            className="h-5 border-none bg-muted px-2 text-[10px] font-medium text-muted-foreground"
          >
            {tournament.type === "Multi"
              ? `${tournament.duration_seconds} seconds`
              : `${tournament.nb_iterations} itérations`}
          </Badge>
          <Badge
            variant="secondary"
            className="h-5 border-none bg-muted px-2 text-[10px] font-medium text-muted-foreground"
          >
            {tournament.strategies.length} strategies
          </Badge>
        </div>
      </div>

      {/* Navigation par onglets (Tabs) */}
      {isMulti ? (
        /* Multi-mode results layout (No tabs, just ranking table) */
        <div className="flex animate-in flex-col gap-4 py-2 duration-150 fade-in">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Ranking</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Cumulative score and action summary
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  <th className="w-12 px-4 py-3 text-center">#</th>
                  <th className="px-4 py-3">Strategy</th>
                  <th className="px-4 py-3 text-right">Score</th>
                  <th className="px-4 py-3 text-right">Cooperations</th>
                  <th className="px-4 py-3 text-right">betrayal</th>
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
                      <td className="px-4 py-3.5 text-right align-middle font-mono text-emerald-600 dark:text-emerald-400">
                        {row.cooperations}
                      </td>
                      <td className="px-4 py-3.5 text-right align-middle font-mono text-rose-600 dark:text-rose-400">
                        {row.betrayal}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Classic-mode tabs layout */
        <Tabs
          defaultValue="results"
          className="mt-2 flex min-h-0 w-full flex-1 flex-col"
        >
          <TabsList className="w-fit shrink-0 rounded-lg bg-muted p-0.75">
            <TabsTrigger
              value="results"
              className="cursor-pointer px-3 py-1 text-xs"
            >
              Résultats
            </TabsTrigger>
            <TabsTrigger
              value="matches"
              className="cursor-pointer px-3 py-1 text-xs"
            >
              Parties
            </TabsTrigger>
            <TabsTrigger
              value="matrix"
              className="cursor-pointer px-3 py-1 text-xs"
            >
              Matrice
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="cursor-pointer px-3 py-1 text-xs"
            >
              Insights
            </TabsTrigger>
          </TabsList>

          <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
            <TabsContent value="results" className="mt-0 outline-none">
              <TournamentResultsTab tournoi={tournament} />
            </TabsContent>
            <TabsContent value="matches" className="mt-0 outline-none">
              <TournamentMatchesTab tournoi={tournament} />
            </TabsContent>
            <TabsContent value="matrix" className="mt-0 outline-none">
              <TournamentMatrixTab tournoi={tournament} />
            </TabsContent>
            <TabsContent value="insights" className="mt-0 outline-none">
              <TournamentInsightsTab tournoi={tournament} />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </section>
  )
}
