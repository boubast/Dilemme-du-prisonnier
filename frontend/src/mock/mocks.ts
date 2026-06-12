import type { Couts, Strategie, Tournoi, Partie, Iteration } from "@/type"

export const MOCK_STRATEGIES: Array<Strategie> = [
  {
    id: "1",
    nom: "Tit for Tat",
    explication:
      "Coopère au premier tour, puis reproduit le dernier coup de l'adversaire.",
    script_rhai: "if iteration == 0 { coopere } else { last_move_opponent }",
  },
  {
    id: "2",
    nom: "Always Cooperate",
    explication: "Coopère systématiquement, quoi qu'il arrive.",
    script_rhai: "coopere",
  },
  {
    id: "3",
    nom: "Always Betray",
    explication: "Trahit systématiquement, quoi qu'il arrive.",
    script_rhai: "trahit",
  },
  {
    id: "4",
    nom: "Random",
    explication: "Trahit une fois sur deux de manière aléatoire.",
    script_rhai: "if random() > 0.5 { coopere } else { trahit }",
  },
  {
    id: "5",
    nom: "Grudger",
    explication:
      "Coopère jusqu'à la première trahison, puis trahit pour toujours.",
    script_rhai: "if opponent_ever_betrayed { trahit } else { coopere }",
  },
  {
    id: "6",
    nom: "Soft Tit for Tat",
    explication:
      "Coopère si au moins 25% des n derniers coups sont des coopérations.",
    script_rhai: "if coop_rate(last_n: 5) >= 0.25 { coopere } else { trahit }",
  },
]

export const DEFAULT_PAYOFFS: Couts = {
  tentation: 5,
  recompense: 3,
  punition: 1,
  dupe: 0,
}

//########################################################//
//  Fonctions générées pour simuler des stats de tournoi  //
//########################################################//

// Moteur de simulation de match pour générer des itérations réalistes
function simulateMatch(
  s1: Strategie,
  s2: Strategie,
  nbIterations: number,
  payoffs: Couts,
  partieId: string
): { iterations: Iteration[]; score1: number; score2: number } {
  const history1: boolean[] = [] // Les coups joués par s1 (true = coopérer, false = trahir)
  const history2: boolean[] = [] // Les coups joués par s2

  const getMove = (
    strategy: Strategie,
    opponentHistory: boolean[]
  ): boolean => {
    const name = strategy.nom.toLowerCase()

    if (name.includes("always cooperate") || name.includes("coopère")) {
      return true
    }
    if (name.includes("always betray") || name.includes("trahit")) {
      return false
    }
    if (name.includes("tit for tat") || name.includes("donnant-donnant")) {
      if (opponentHistory.length === 0) return true
      return opponentHistory[opponentHistory.length - 1]
    }
    if (name.includes("grudger") || name.includes("rancunier")) {
      if (opponentHistory.includes(false)) return false
      return true
    }
    if (name.includes("soft tit for tat")) {
      if (opponentHistory.length === 0) return true
      const lastN = opponentHistory.slice(-5)
      const coops = lastN.filter((x) => x).length
      return coops / lastN.length >= 0.25
    }
    if (name.includes("random") || name.includes("aléatoire")) {
      return Math.random() > 0.5
    }

    // Comportement par défaut (Donnant-donnant)
    if (opponentHistory.length === 0) return true
    return opponentHistory[opponentHistory.length - 1]
  }

  const iterations: Iteration[] = []
  let score1 = 0
  let score2 = 0

  for (let i = 0; i < nbIterations; i++) {
    const move1 = getMove(s1, history2)
    const move2 = getMove(s2, history1)

    history1.push(move1)
    history2.push(move2)

    const players = {
      p1: 0,
      p2: 0,
    }
    if (move1 && move2) {
      players.p1 = payoffs.recompense
      players.p2 = payoffs.recompense
    } else if (move1 && !move2) {
      players.p1 = payoffs.dupe
      players.p2 = payoffs.tentation
    } else if (!move1 && move2) {
      players.p1 = payoffs.tentation
      players.p2 = payoffs.dupe
    } else {
      players.p1 = payoffs.punition
      players.p2 = payoffs.punition
    }

    score1 += players.p1
    score2 += players.p2

    iterations.push({
      id: `${partieId}_iter_${i}`,
      partie: {} as Partie, // Référence circulaire temporaire
      numero_iteration: i + 1,
      coup_strategie1: move1,
      coup_strategie2: move2,
    })
  }

  return { iterations, score1, score2 }
}

export function generateMockTournoi(
  id: string,
  nom: string,
  date: string,
  strategies: Strategie[],
  nbIterations: number = 200,
  payoffs: Couts = DEFAULT_PAYOFFS
): Tournoi {
  const parties: Partie[] = []
  let matchIdCounter = 1

  for (let i = 0; i < strategies.length; i++) {
    for (let j = i + 1; j < strategies.length; j++) {
      const s1 = strategies[i]
      const s2 = strategies[j]
      const partieId = `${id}_partie_${matchIdCounter++}`

      const { iterations, score1, score2 } = simulateMatch(
        s1,
        s2,
        nbIterations,
        payoffs,
        partieId
      )

      const resultatsPartie = {
        victoire_strategie1: score1 > score2 ? 1 : 0,
        victoire_strategie2: score2 > score1 ? 1 : 0,
        nul: score1 === score2 ? 1 : 0,
      }

      const partie: Partie = {
        id: partieId,
        strategie1: s1,
        strategie2: s2,
        scoreStrategie1: score1,
        scoreStrategie2: score2,
        iterations,
        resultats: resultatsPartie,
      }

      iterations.forEach((iter) => {
        iter.partie = partie
      })

      parties.push(partie)
    }
  }

  // Calculer les scores totaux et les résultats (VND) par stratégie
  const scores_totaux: Record<string, number> = {}
  const resultatsTournoi: Record<
    string,
    { victoires: number; nuls: number; defaites: number }
  > = {}

  strategies.forEach((s) => {
    scores_totaux[s.id] = 0
    resultatsTournoi[s.id] = { victoires: 0, nuls: 0, defaites: 0 }
  })

  parties.forEach((p) => {
    scores_totaux[p.strategie1.id] += p.scoreStrategie1
    scores_totaux[p.strategie2.id] += p.scoreStrategie2

    if (p.scoreStrategie1 > p.scoreStrategie2) {
      resultatsTournoi[p.strategie1.id].victoires += 1
      resultatsTournoi[p.strategie2.id].defaites += 1
    } else if (p.scoreStrategie1 < p.scoreStrategie2) {
      resultatsTournoi[p.strategie2.id].victoires += 1
      resultatsTournoi[p.strategie1.id].defaites += 1
    } else {
      resultatsTournoi[p.strategie1.id].nuls += 1
      resultatsTournoi[p.strategie2.id].nuls += 1
    }
  })

  // Trouver la meilleure stratégie
  let bestStrategyId = strategies[0]?.id || ""
  let bestScore = -1
  strategies.forEach((s) => {
    if (scores_totaux[s.id] > bestScore) {
      bestScore = scores_totaux[s.id]
      bestStrategyId = s.id
    }
  })

  const meilleure =
    strategies.find((s) => s.id === bestStrategyId)?.nom || "Tit for Tat"

  return {
    id,
    nom,
    date_creation: date,
    nb_iterations: nbIterations,
    couts: payoffs,
    strategies,
    parties,
    meilleure_strategie: meilleure,
    resultats: resultatsTournoi,
    scores_totaux,
  }
}

// Initialisation de l'historique des tournois simulés
export const MOCK_TOURNOIS: Tournoi[] = [
  generateMockTournoi(
    "1",
    "Tournoi classique #4",
    "2025-03-02 14:32",
    MOCK_STRATEGIES.slice(0, 5) // Tit for Tat, Always Cooperate, Always Betray, Random, Grudger
  ),
  generateMockTournoi(
    "2",
    "Test Soft TfT",
    "2025-02-28 09:11",
    [MOCK_STRATEGIES[0], MOCK_STRATEGIES[5], MOCK_STRATEGIES[3]] // Tit for Tat, Soft Tit for Tat, Random
  ),
  generateMockTournoi(
    "3",
    "Homme vs Tit for Tat",
    "2025-02-20 18:45",
    [MOCK_STRATEGIES[0], MOCK_STRATEGIES[2]] // Tit for Tat, Always Betray
  ),
]
