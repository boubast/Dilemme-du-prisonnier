/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react"
import type { Tournoi, TournamentConfig } from "@/type"
import {
  fetchTournaments,
  fetchTournamentById,
  createTournament,
} from "@/api/tournament"
import { MOCK_MULTI_TOURNAMENTS } from "@/mocks"

//TODO : Type de tournoi

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
      const classicTournaments = list.map((t) => {
        t.mode = "classic"
        return t
      })
      setTournaments([...classicTournaments, ...MOCK_MULTI_TOURNAMENTS])
    } catch (e) {
      console.error("Could not retrieve tournaments:", e)
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

    if (tournamentId.startsWith("multi-")) {
      const t = MOCK_MULTI_TOURNAMENTS.find((x) => x.id === tournamentId)
      setActiveTournament(t || null)
      return
    }

    let ignore = false

    const loadActive = async () => {
      setActiveLoading(true)
      try {
        const t = await fetchTournamentById(tournamentId, "Classique")
        if (ignore) return

        if (t) {
          t.mode = "classic"
        }
        setActiveTournament(t || null)
      } catch (e) {
        console.error("Could not retrieve tournament details:", e)
      } finally {
        if (!ignore) {
          setActiveLoading(false)
        }
      }
    }

    loadActive()

    return () => {
      ignore = true
    }
  }, [tournamentId])

  const getTournament = useCallback(async (id: string) => {
    return await fetchTournamentById(id, "Classique")
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
