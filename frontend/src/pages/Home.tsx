import { useEffect, useState, useCallback } from "react"
import TournamentConfig from "@/components/tournament-config"
import TournamentHistory from "@/components/tournament-history"
import TournamentStats from "@/components/tournament-stats"
import { fetchTournaments } from "@/api/tournament"
import type { Tournoi } from "@/type"

const Home = () => {
  const [tournaments, setTournaments] = useState<Tournoi[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadTournaments = useCallback(async () => {
    setLoading(true)
    try {
      const list = await fetchTournaments()
      setTournaments(list)
    } catch (e) {
      console.error("Erreur lors du chargement des tournois :", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTournaments()
  }, [loadTournaments])

  // Par défaut, on sélectionne le dernier tournoi de la liste (le plus récent)
  const activeTournamentId =
    selectedId || (tournaments.length > 0 ? tournaments[0].id : null)

  const handleTournamentCreated = async () => {
    await loadTournaments()
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
