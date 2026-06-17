import { useState } from "react"
import TournamentConfig from "@/components/tournament-config"
import TournamentHistory from "@/components/tournament-history"
import TournamentStats from "@/components/tournament-stats"
import { useTournament } from "@/hooks/useTournament"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Tournoi, TournamentMode } from "@/type"

const Home = () => {
  const { tournaments, loading, reload } = useTournament(null, true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mode, setMode] = useState<TournamentMode>("classic")
  const [pendingTournament, setPendingTournament] = useState<Tournoi | null>(
    null
  )

  const visibleTournaments = pendingTournament
    ? [pendingTournament, ...tournaments]
    : tournaments

  // Par défaut, on sélectionne le dernier tournoi de la liste (le plus récent)
  const activeTournamentId =
    selectedId === pendingTournament?.id
      ? null
      : selectedId || (tournaments.length > 0 ? tournaments[0].id : null)

  const handleTournamentCreated = async (tournoi: Tournoi) => {
    await reload()
    setPendingTournament(null)
    setSelectedId(tournoi.id)
  }

  const handleTournamentCreating = (tournoi: Tournoi) => {
    setPendingTournament(tournoi)
    setSelectedId(tournoi.id)
  }

  const handleTournamentCreationFailed = () => {
    setPendingTournament(null)
    setSelectedId((currentId) =>
      currentId === pendingTournament?.id ? null : currentId
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">Axelrod's Tournament</h1>
        <p className="text-sm text-gray-700">
          An experimental environment for the prisoner's dilemma. Configure an
          experiment, pit your strategies against each other, and analyze the
          results.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        <Tabs
          value={mode}
          onValueChange={(val) => setMode(val as TournamentMode)}
          className="w-fit"
        >
          <TabsList className="w-fit shrink-0 rounded-lg bg-muted p-0.75">
            <TabsTrigger
              value="classic"
              className="cursor-pointer px-4 py-1.5 text-xs font-semibold"
            >
              Classic
            </TabsTrigger>
            <TabsTrigger
              value="multi"
              className="cursor-pointer px-4 py-1.5 text-xs font-semibold"
            >
              Multi
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <TournamentConfig
          mode={mode}
          onTournamentCreated={handleTournamentCreated}
          onTournamentCreating={handleTournamentCreating}
          onTournamentCreationFailed={handleTournamentCreationFailed}
        />
      </div>

      <div className="flex w-full gap-5">
        <TournamentHistory
          tournaments={visibleTournaments}
          pendingTournamentId={pendingTournament?.id ?? null}
          selectedId={selectedId || activeTournamentId}
          onSelect={setSelectedId}
          loading={loading && !pendingTournament}
        />
        <TournamentStats
          tournamentId={activeTournamentId}
          creating={selectedId === pendingTournament?.id}
        />
      </div>
    </div>
  )
}

export default Home
