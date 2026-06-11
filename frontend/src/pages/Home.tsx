import { useState } from "react"
import TournamentConfig from "@/components/tournament-config"
import TournamentHistory from "@/components/tournament-history"
import TournamentStats from "@/components/tournament-stats"
import { useTournament } from "@/hooks/useTournament"

const Home = () => {
  const { tournaments, loading, reload } = useTournament(null, true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Par défaut, on sélectionne le dernier tournoi de la liste (le plus récent)
  const activeTournamentId =
    selectedId || (tournaments.length > 0 ? tournaments[0].id : null)

  const handleTournamentCreated = async () => {
    await reload()
    // Réinitialise selectedId à null pour que le nouveau tournoi soit sélectionné par défaut
    setSelectedId(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">Tournoi d'Axelrod</h1>
        <p className="text-sm text-gray-700">
          Environnement d'expérimentation pour le dilemme du prisonnier.
          Configurez une expérience, opposez vos stratégies et analysez les
          résultats.
        </p>
      </div>

      <div className="w-full">
        <TournamentConfig onTournamentCreated={handleTournamentCreated} />
      </div>

      <div className="flex w-full gap-5">
        <TournamentHistory
          tournaments={tournaments}
          selectedId={activeTournamentId}
          onSelect={setSelectedId}
          loading={loading}
        />
        <TournamentStats tournamentId={activeTournamentId} />
      </div>
    </div>
  )
}

export default Home
