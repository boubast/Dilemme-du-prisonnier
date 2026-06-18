export type TournamentType = "Classique" | "Multi"

export type Strategie = {
  id: string
  nom: string
  explication: string
  script_rhai: string
  type: string
}

type PartieResult = {
  victoire_strategie1: number
  victoire_strategie2: number
  nul: number
}

export type Partie = {
  id: string
  strategie1: Strategie
  strategie2: Strategie
  scoreStrategie1: number
  scoreStrategie2: number
  iterations: Iteration[]
  resultats: PartieResult
}

type VND = {
  victoires: number
  nuls: number
  defaites: number
}

export type Tournoi = {
  id: string
  nom: string
  type?: TournamentType
  parties: Partie[]
  nb_iterations: number
  duration_seconds?: number
  couts: Couts
  date_creation: string
  meilleure_strategie: string
  strategies: Strategie[]
  resultats: Record<string, VND>
  scores_totaux: Record<string, number>
  multi_stats?: Record<string, { cooperations: number; betrayal: number }>
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
  type: TournamentType
  strategies_ids: string[]
  nb_iterations?: number
  duration_seconds?: number
  payoffs?: Couts
}

export interface HelpBlock {
  title: string
  description: string
  snippet: string
}
