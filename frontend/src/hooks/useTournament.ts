/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react"
import type { Tournoi, TournamentConfig } from "@/type"
import {
  fetchTournaments,
  fetchTournamentById,
  createTournament,
} from "@/api/tournament"

export function useTournament(
  tournamentId: string | null = null,
  autoLoadList = false
) {
  const [tournaments, setTournaments] = useState<Tournoi[]>([])
  const [activeTournament, setActiveTournament] = useState<Tournoi | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeLoading, setActiveLoading] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const list = await fetchTournaments()
      setTournaments(list)
    } catch (e) {
      console.error("Erreur lors de la récupération des tournois :", e)
    } finally {
      setLoading(false)
    }
  }, [])

  // Charge la liste de tous les tournois si autoLoadList est vrai
  useEffect(() => {
    if (autoLoadList) {
      reload()
    }
  }, [autoLoadList, reload])

  // Charge le détail du tournoi actif s'il change
  useEffect(() => {
    if (!tournamentId) {
      setActiveTournament(null)
      return
    }

    const loadActive = async () => {
      setActiveLoading(true)
      try {
        const t = await fetchTournamentById(tournamentId)
        setActiveTournament(t || null)
      } catch (e) {
        console.error(
          "Erreur lors de la récupération du détail du tournoi :",
          e
        )
      } finally {
        setActiveLoading(false)
      }
    }

    loadActive()
  }, [tournamentId])

  const getTournament = useCallback(async (id: string) => {
    return await fetchTournamentById(id)
  }, [])

  const addTournament = useCallback(
    async (config: TournamentConfig) => {
      const newTournoi = await createTournament(config)
      if (autoLoadList) {
        await reload()
      }
      return newTournoi
    },
    [autoLoadList, reload]
  )

  return {
    tournaments,
    activeTournament,
    loading,
    activeLoading,
    reload,
    getTournament,
    addTournament,
  }
}
