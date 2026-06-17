import type { Strategie, Tournoi } from "./type"

export const MOCK_MULTI_STRATEGIES: Strategie[] = [
  {
    id: "multi-cooperate",
    nom: "Always Cooperate (Multi)",
    explication: "Always cooperates in multiplayer matches.",
    script_rhai: "return Choice::COOPERATE;",
    mode: "multi",
  },
  {
    id: "multi-betray",
    nom: "Always Betray (Multi)",
    explication: "Always defects in multiplayer matches.",
    script_rhai: "return Choice::BETRAY;",
    mode: "multi",
  },
  {
    id: "multi-majority",
    nom: "Majority Rule (Multi)",
    explication: "Cooperates if the majority of opponents cooperated in the last turn.",
    script_rhai: "return Choice::COOPERATE;",
    mode: "multi",
  },
  {
    id: "multi-titfortat",
    nom: "Tit for Tat (Multi)",
    explication: "Cooperates first, then replicates the choice of the most common opponent action.",
    script_rhai: "return Choice::COOPERATE;",
    mode: "multi",
  },
]

export const MOCK_MULTI_TOURNAMENTS: Tournoi[] = [
  {
    id: "multi-tournoi-1",
    nom: "Multi Arena Alpha",
    mode: "multi",
    parties: [],
    nb_iterations: 0,
    duration_seconds: 15,
    couts: { tentation: 0, recompense: 0, punition: 0, dupe: 0 },
    date_creation: "17/06/2026",
    meilleure_strategie: "Tit for Tat (Multi)",
    strategies: MOCK_MULTI_STRATEGIES,
    resultats: {},
    scores_totaux: {
      "multi-cooperate": 450,
      "multi-betray": 320,
      "multi-majority": 410,
      "multi-titfortat": 530,
    },
    multi_stats: {
      "multi-cooperate": { cooperations: 150, defections: 0 },
      "multi-betray": { cooperations: 0, defections: 150 },
      "multi-majority": { cooperations: 100, defections: 50 },
      "multi-titfortat": { cooperations: 130, defections: 20 },
    },
  },
]
