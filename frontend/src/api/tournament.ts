import type { TournamentConfig, Tournoi } from "@/type"
import {
  mapTournoiDTOToTournoi,
  mapTournoiListItemDTOToTournoi,
  type TournoiDTO,
  type TournoiListItemDTO,
} from "@/dto/tournament"
import { handleApiResponseError } from "./apiError"

const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:8000") +
  (import.meta.env.VITE_API_PREFIX || "/api/v1")

/**
 * Récupère tous les tournois depuis le backend.
 */
export async function fetchTournaments(): Promise<Tournoi[]> {
  try {
    const response = await fetch(`${API_URL}/tournament`)
    if (!response.ok) {
      throw await handleApiResponseError(
        response,
        "Could not retrieve tournaments"
      )
    }

    const data: TournoiListItemDTO[] = await response.json()
    return data.map(mapTournoiListItemDTOToTournoi)
  } catch (error) {
    console.error("fetchTournaments error:", error)
    throw error
  }
}

/**
 * Récupère le détail d'un tournoi par son identifiant.
 */
export async function fetchTournamentById(
  id: string,
  type: string
): Promise<Tournoi | undefined> {
  try {
    const response = await fetch(`${API_URL}/tournament/${type}/${id}`)

    if (response.status === 404) {
      return undefined
    }

    if (!response.ok) {
      throw await handleApiResponseError(
        response,
        `Could not retrieve tournament ${id}`
      )
    }

    const data: TournoiDTO = await response.json()
    return mapTournoiDTOToTournoi(data)
  } catch (error) {
    console.error("fetchTournamentById error:", error)
    throw error
  }
}

/**
 * Lance un nouveau tournoi avec la configuration fournie.
 */
export async function createTournament(
  config: TournamentConfig
): Promise<Tournoi> {
  try {
    const body = {
      strategie_ids: config.strategies_ids.map(Number),
      nb_iterations: config.nb_iterations,
      cout_coop_coop: config.payoffs.recompense,
      cout_coop_trahi: config.payoffs.dupe,
      cout_trahi_coop: config.payoffs.tentation,
      cout_trahi_trahi: config.payoffs.punition,
    }

    const response = await fetch(`${API_URL}/tournament/launch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw await handleApiResponseError(
        response,
        "Could not start the tournament"
      )
    }

    const data: TournoiDTO = await response.json()
    return mapTournoiDTOToTournoi(data)
  } catch (error) {
    console.error("createTournament error:", error)
    throw error
  }
}
