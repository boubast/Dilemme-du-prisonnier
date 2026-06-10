import type { Couts, Strategie } from "@/type"

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
