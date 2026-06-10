export type Strategie = {
  id: string
  nom: string
  explication: string
  script_rhai: string
}

export type Partie = {
  id: string
  strategie1: Strategie
  strategie2: Strategie
}

export type Tournoi = {
  id: string
  nom: string
  parties: Partie[]
  nb_iterations: number
  cout_coop_coop: number
  cout_coop_trahit: number
  cout_trahit_coop: number
  cout_trahit_trahit: number
  date_creation: string
  meilleure_strategie: Strategie
}

export type Iteration = {
  id: string
  partie: Partie
  numero_iteration: number
  coup_strategie1: "coopere" | "trahit"
  coup_strategie2: "coopere" | "trahit"
}

export type Participation = {
  tournoi: Tournoi
  strategie: Strategie
  score_total: number
  rang_final: number
}

/** Coûts du dilemme du prisonnier (grille 2×2). */
export type Couts = {
  tentation: number
  recompense: number
  punition: number
  dupe: number
}

export type TournamentConfig = {
  strategies_ids: string[]
  nb_iterations: number
  payoffs: Couts
}