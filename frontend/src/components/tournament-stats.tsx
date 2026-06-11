import { useTournament } from "@/hooks/useTournament"
import { Badge } from "./ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import TournamentResultsTab from "./tournament-results-tab"
import TournamentMatchesTab from "./tournament-matches-tab"
import TournamentInsightsTab from "./tournament-insights-tab"

interface TournamentStatsProps {
  tournamentId: string | null
}

export default function TournamentStats({
  tournamentId,
}: TournamentStatsProps) {
  const { activeTournament: tournament, activeLoading: loading } =
    useTournament(tournamentId, false)

  if (loading) {
    return (
      <section className="flex w-2/3 flex-col gap-4 rounded-xl border border-border bg-card p-5 animate-pulse min-h-120">
        <div className="h-6 w-1/3 bg-muted rounded" />
        <div className="h-4 w-1/2 bg-muted rounded" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 w-20 bg-muted rounded-full" />
          <div className="h-5 w-28 bg-muted rounded-full" />
          <div className="h-5 w-24 bg-muted rounded-full" />
        </div>
        <div className="h-8 w-48 bg-muted rounded-lg mt-4" />
        <div className="h-32 w-full bg-muted rounded mt-2" />
      </section>
    )
  }

  if (!tournament) {
    return (
      <section className="flex w-2/3 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-8 text-center text-muted-foreground min-h-120">
        <p className="text-sm font-medium">
          Aucun tournoi sélectionné ou disponible.
        </p>
        <p className="text-xs text-muted-foreground max-w-xs mt-1">
          Configurez et lancez un tournoi ci-dessus pour générer des
          statistiques.
        </p>
      </section>
    )
  }

  const isHuman = tournament.nom.toLowerCase().includes("homme")
  const modeLabel = isHuman ? "Homme vs Machine" : "Machine vs Machine"

  return (
    <section className="flex w-2/3 flex-col gap-4 rounded-xl border border-border bg-card p-5 min-h-120">
      {/* En-tête */}
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          {tournament.nom}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Détail du tournoi &middot; {tournament.date_creation}
        </p>

        {/* Badges descriptifs */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge
            variant="secondary"
            className="h-5 px-2 text-[10px] font-medium bg-muted text-muted-foreground border-none"
          >
            {tournament.nb_iterations} itérations
          </Badge>
          <Badge
            variant="secondary"
            className="h-5 px-2 text-[10px] font-medium bg-muted text-muted-foreground border-none"
          >
            {modeLabel}
          </Badge>
          <Badge
            variant="secondary"
            className="h-5 px-2 text-[10px] font-medium bg-muted text-muted-foreground border-none"
          >
            {tournament.strategies.length} stratégies
          </Badge>
        </div>
      </div>

      {/* Navigation par onglets (Tabs) */}
      <Tabs
        defaultValue="results"
        className="w-full flex-1 flex flex-col min-h-0 mt-2"
      >
        <TabsList className="bg-muted p-0.75 rounded-lg shrink-0 w-fit">
          <TabsTrigger
            value="results"
            className="px-3 py-1 text-xs cursor-pointer"
          >
            Résultats
          </TabsTrigger>
          <TabsTrigger
            value="matches"
            className="px-3 py-1 text-xs cursor-pointer"
          >
            Parties
          </TabsTrigger>
          <TabsTrigger
            value="insights"
            className="px-3 py-1 text-xs cursor-pointer"
          >
            Insights
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto mt-2 min-h-0">
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
