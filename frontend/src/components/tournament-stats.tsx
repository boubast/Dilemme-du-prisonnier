import { LoaderCircle } from "lucide-react"

import { useTournament } from "@/hooks/useTournament"
import { Badge } from "./ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import TournamentResultsTab from "./tournament-results-tab"
import TournamentMatchesTab from "./tournament-matches-tab"
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
            Calcul du tournoi en cours...
          </p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Les statistiques s'afficheront dès que toutes les parties seront
            terminées.
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
          Aucun tournoi sélectionné ou disponible.
        </p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          Configurez et lancez un tournoi ci-dessus pour générer des
          statistiques.
        </p>
      </section>
    )
  }

  return (
    <section className="flex min-h-120 w-2/3 flex-col gap-4 rounded-xl border border-border bg-card p-5">
      {/* En-tête */}
      <div className="flex gap-4">
        <h2 className="text-sm font-semibold text-foreground">
          {tournament.nom}
        </h2>

        {/* Badges descriptifs */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="secondary"
            className="h-5 border-none bg-muted px-2 text-[10px] font-medium text-muted-foreground"
          >
            {tournament.nb_iterations} itérations
          </Badge>
          <Badge
            variant="secondary"
            className="h-5 border-none bg-muted px-2 text-[10px] font-medium text-muted-foreground"
          >
            {tournament.strategies.length} stratégies
          </Badge>
        </div>
      </div>

      {/* Navigation par onglets (Tabs) */}
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
          <TabsContent value="insights" className="mt-0 outline-none">
            <TournamentInsightsTab tournoi={tournament} />
          </TabsContent>
        </div>
      </Tabs>
    </section>
  )
}
