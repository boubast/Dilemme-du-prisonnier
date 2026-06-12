import type { Tournoi, TournamentConfig } from "@/type"
import {
  MOCK_TOURNOIS,
  generateMockTournoi,
  MOCK_STRATEGIES,
} from "@/mock/mocks"

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
 * Lance un nouveau tournoi avec la configuration fournie et l'ajoute à l'historique mocké.
 */
export async function createTournament(
  config: TournamentConfig
): Promise<Tournoi> {
  await new Promise((r) => setTimeout(r, 0))

  const strategies = MOCK_STRATEGIES.filter((s) =>
    config.strategies_ids.includes(s.id)
  )

  // Calcule l'ID du prochain tournoi
  const nextId = String(
    Math.max(...MOCK_TOURNOIS.map((t) => parseInt(t.id) || 0), 0) + 1
  )

  // Formatte la date courante (YYYY-MM-DD HH:MM)
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )} ${pad(now.getHours())}:${pad(now.getMinutes())}`

  const newTournoi = generateMockTournoi(
    nextId,
    `Tournoi classique #${nextId}`,
    dateStr,
    strategies,
    config.nb_iterations,
    config.payoffs
  )

  MOCK_TOURNOIS.push(newTournoi)
  return newTournoi
}

// Fonctions utilitaires

export const getTournamentStats = (tournoi: Tournoi) => {
  return tournoi.strategies.map((s) => {
    let scoreTotal = 0
    let totalTours = 0
    let victoires = 0
    let nuls = 0
    let defaites = 0

    tournoi.parties.forEach((p) => {
      const isS1 = p.strategie1.id === s.id
      const isS2 = p.strategie2.id === s.id
      if (!isS1 && !isS2) return

      let myScore = 0
      let opponentScore = 0

      p.iterations.forEach((iter) => {
        const m1 = iter.coup_strategie1
        const m2 = iter.coup_strategie2

        const players = {
          p1: 0,
          p2: 0,
        }

        if (m1 && m2) {
          players.p1 = tournoi.couts.recompense
          players.p2 = tournoi.couts.recompense
        } else if (m1 && !m2) {
          players.p1 = tournoi.couts.dupe
          players.p2 = tournoi.couts.tentation
        } else if (!m1 && m2) {
          players.p1 = tournoi.couts.tentation
          players.p2 = tournoi.couts.dupe
        } else {
          players.p1 = tournoi.couts.punition
          players.p2 = tournoi.couts.punition
        }

        myScore += isS1 ? players.p1 : players.p2
        opponentScore += isS1 ? players.p2 : players.p1
      })

      scoreTotal += myScore
      totalTours += p.iterations.length

      if (myScore > opponentScore) {
        victoires += 1
      } else if (myScore === opponentScore) {
        nuls += 1
      } else {
        defaites += 1
      }
    })

    return {
      strategy: s,
      scoreTotal,
      totalTours,
      victoires,
      nuls,
      defaites,
    }
  })
}
