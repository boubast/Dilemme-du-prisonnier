import { useState } from "react"
import TournamentConfig from "@/components/tournament-config"
import TournamentHistory from "@/components/tournament-history"
import TournamentStats from "@/components/tournament-stats"
import { useTournament } from "@/hooks/useTournament"
import type { Tournoi } from "@/type"

const Home = () => {
  const { tournaments, loading, reload } = useTournament(null, true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
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
        <h1 className="text-4xl font-bold">Axelrod Tournament</h1>
        <p className="text-sm text-gray-700">
          An experimental environment for the prisoner's dilemma. Configure an
          experiment, pit your strategies against each other, and analyze the
          results.
        </p>
      </div>

      <div className="w-full">
        <TournamentConfig
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
