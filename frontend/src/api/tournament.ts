import type { Tournoi, TournamentConfig } from "@/type"
import { MOCK_TOURNOIS } from "@/mock/mocks"

const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:8000") +
  (import.meta.env.VITE_API_PREFIX || "/api/v1")

/**
 * Récupère l'historique de tous les tournois.
 */
export async function fetchTournaments(): Promise<Tournoi[]> {
  await new Promise((r) => setTimeout(r, 0))
  // Trie par date de création descendante (le plus récent en premier)
  return [...MOCK_TOURNOIS].sort(
    (a, b) =>
      new Date(b.date_creation.replace(/-/g, "/")).getTime() -
      new Date(a.date_creation.replace(/-/g, "/")).getTime()
  )
}

/**
 * Récupère un tournoi spécifique par son ID.
 */
export async function fetchTournamentById(
  id: string
): Promise<Tournoi | undefined> {
  await new Promise((r) => setTimeout(r, 0))
  return MOCK_TOURNOIS.find((t) => t.id === id)
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
      throw new Error("Erreur lors du lancement du tournoi")
    }

    const result: { id_tournoi: number; nom_tournoi: string } =
      await response.json()

    // Récupère les détails du tournoi créé pour renvoyer l'objet complet
    const newTournoi = await fetchTournamentById(String(result.id_tournoi))
    if (!newTournoi) {
      throw new Error("Le tournoi créé n'a pas pu être récupéré depuis l'API")
    }

    return newTournoi
  } catch (error) {
    console.error("createTournament error:", error)
    throw error
  }
}
