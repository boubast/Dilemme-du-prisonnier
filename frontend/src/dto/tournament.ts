import type { Tournoi, Partie, Iteration, Strategie } from "@/type"

export interface StrategieDTO {
  id_strategie: number
  nom: string
  explication: string
  script_rhai: string
}

export interface IterationDTO {
  id_iteration: number
  numero_iteration: number
  choix_strategie_1: boolean
  choix_strategie_2: boolean
}

export interface PartieDTO {
  id_partie: number
  id_strategie_1: number
  id_strategie_2: number
  strategie_1: StrategieDTO
  strategie_2: StrategieDTO
  iterations: IterationDTO[]
  score_strategie_1: number
  score_strategie_2: number
  resultats: { V1: number; V2: number; N: number }
}

export interface TournoiDTO {
  id_tournoi: number
  nom: string
  date_creation: string
  meilleure_strategie: string | null
  nb_iterations: number
  couts: {
    tentation: number
    recompense: number
    punition: number
    dupe: number
  }
  strategies: StrategieDTO[]
  parties: PartieDTO[]
  resultats: Record<string, { V: number; N: number; D: number }>
  scores_totaux: Record<string, number>
}

export interface TournoiListItemDTO {
  id_tournoi: number
  nom: string
  date_creation: string
  meilleure_strategie: string | null
}

export function mapStrategieDTOToStrategie(dto: StrategieDTO): Strategie {
  return {
    id: String(dto.id_strategie),
    nom: dto.nom,
    explication: dto.explication,
    script_rhai: dto.script_rhai,
  }
}

export function mapIterationDTOToIteration(
  dto: IterationDTO,
  partieRef: Partie
): Iteration {
  return {
    id: String(dto.id_iteration),
    partie: partieRef,
    numero_iteration: dto.numero_iteration,
    coup_strategie1: dto.choix_strategie_1,
    coup_strategie2: dto.choix_strategie_2,
  }
}

export function mapPartieDTOToPartie(dto: PartieDTO): Partie {
  const partie: Partial<Partie> = {
    id: String(dto.id_partie),
    strategie1: mapStrategieDTOToStrategie(dto.strategie_1),
    strategie2: mapStrategieDTOToStrategie(dto.strategie_2),
  }

  partie.iterations = dto.iterations.map((i) =>
    mapIterationDTOToIteration(i, partie as Partie)
  )

  return partie as Partie
}

export function mapTournoiDTOToTournoi(dto: TournoiDTO): Tournoi {
  const strategies = dto.strategies.map(mapStrategieDTOToStrategie)

  // Map each partie
  const parties = dto.parties.map((pDto) => {
    const partieId = String(pDto.id_partie)
    const s1 = mapStrategieDTOToStrategie(pDto.strategie_1)
    const s2 = mapStrategieDTOToStrategie(pDto.strategie_2)

    const partie: Partial<Partie> = {
      id: partieId,
      strategie1: s1,
      strategie2: s2,
      scoreStrategie1: pDto.score_strategie_1,
      scoreStrategie2: pDto.score_strategie_2,
      resultats: {
        victoire_strategie1: pDto.resultats.V1 ?? 0,
        victoire_strategie2: pDto.resultats.V2 ?? 0,
        nul: pDto.resultats.N ?? 0,
      },
    }

    partie.iterations = pDto.iterations.map((iDto) =>
      mapIterationDTOToIteration(iDto, partie as Partie)
    )

    return partie as Partie
  })

  // Map backend-computed results
  const resultats: Record<
    string,
    { victoires: number; nuls: number; defaites: number }
  > = {}
  if (dto.resultats) {
    Object.entries(dto.resultats).forEach(([key, val]) => {
      resultats[key] = {
        victoires: val.V ?? 0,
        nuls: val.N ?? 0,
        defaites: val.D ?? 0,
      }
    })
  }

  return {
    id: String(dto.id_tournoi),
    nom: dto.nom,
    nb_iterations: dto.nb_iterations,
    date_creation: dto.date_creation,
    meilleure_strategie: dto.meilleure_strategie || "",
    couts: dto.couts,
    strategies,
    parties,
    scores_totaux: dto.scores_totaux || {},
    resultats,
  }
}

export function mapTournoiListItemDTOToTournoi(
  dto: TournoiListItemDTO
): Tournoi {
  return {
    id: String(dto.id_tournoi),
    nom: dto.nom,
    date_creation: dto.date_creation,
    meilleure_strategie: dto.meilleure_strategie || "",
    parties: [],
    nb_iterations: 0,
    couts: {
      tentation: 0,
      recompense: 0,
      punition: 0,
      dupe: 0,
    },
    strategies: [],
    scores_totaux: {},
    resultats: {},
  }
}
