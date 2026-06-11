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
  iterations: Iteration[]
}

export type Tournoi = {
  id: string
  nom: string
  parties: Partie[]
  nb_iterations: number
  couts: Couts
  date_creation: string
  meilleure_strategie: string
  strategies: Strategie[]
}

export type Iteration = {
  id: string
  partie: Partie
  numero_iteration: number
  coup_strategie1: boolean
  coup_strategie2: boolean
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

export interface HelpBlock {
  title: string
  description: string
  snippet: string
}
