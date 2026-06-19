import type { Tournoi, Partie, Iteration } from "@/type"
import { mapStrategieDTOToStrategie, type StrategieDTO } from "./strategy"

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

type ClassicResult = { V: number; N: number; D: number }
type MultiResult = { nb_cooperate: number; nb_betray: number; score: number }

export interface TournoiDTO {
  id_tournoi: number
  nom: string
  date_creation: string
  meilleure_strategie: string | null
  nb_iterations: number | null
  duree_secondes?: number | null
  couts: {
    tentation: number
    recompense: number
    punition: number
    dupe: number
  } | null
  strategies: StrategieDTO[]
  parties: PartieDTO[] | null
  resultats: Record<string, ClassicResult | MultiResult> | null
  scores_totaux: Record<string, number> | null
  type_tournoi: string
}

export interface TournoiListItemDTO {
  id_tournoi: number
  nom: string
  date_creation: string
  meilleure_strategie: string | null
  type_tournoi: string
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
  const type = dto.type_tournoi === "Multi" ? "Multi" : "Classique"
  const strategies = dto.strategies.map(mapStrategieDTOToStrategie)

  // Map each partie
  const parties = dto.parties
    ? dto.parties.map((pDto) => {
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
    : []

  // Map backend-computed results
  const resultats: Record<
    string,
    { victoires: number; nuls: number; defaites: number }
  > = {}

  const scores_totaux: Record<string, number> = {}
  const multi_stats: Record<string, { cooperations: number; betrayal: number }> = {}

  if (type === "Multi") {
    if (dto.resultats) {
      Object.entries(dto.resultats).forEach(([key, val]) => {
        const multiVal = val as MultiResult
        scores_totaux[key] = Math.round(multiVal.score ?? 0)
        multi_stats[key] = {
          cooperations: multiVal.nb_cooperate ?? 0,
          betrayal: multiVal.nb_betray ?? 0,
        }
      })
    }
  } else {
    if (dto.resultats) {
      Object.entries(dto.resultats).forEach(([key, val]) => {
        const classicVal = val as ClassicResult
        resultats[key] = {
          victoires: classicVal.V ?? 0,
          nuls: classicVal.N ?? 0,
          defaites: classicVal.D ?? 0,
        }
      })
    }
    if (dto.scores_totaux) {
      Object.entries(dto.scores_totaux).forEach(([key, val]) => {
        scores_totaux[key] = val
      })
    }
  }

  // Get duration_seconds if it's there (it might be returned by the backend)
  const duration_seconds = dto.duree_secondes || undefined

  return {
    id: String(dto.id_tournoi),
    nom: dto.nom,
    type,
    nb_iterations: dto.nb_iterations ?? 0,
    duration_seconds,
    date_creation: dto.date_creation,
    meilleure_strategie: dto.meilleure_strategie || "",
    couts: dto.couts || { tentation: 0, recompense: 0, punition: 0, dupe: 0 },
    strategies,
    parties,
    scores_totaux,
    resultats,
    multi_stats,
  }
}

export function mapTournoiListItemDTOToTournoi(
  dto: TournoiListItemDTO
): Tournoi {
  return {
    id: String(dto.id_tournoi),
    nom: dto.nom,
    type: dto.type_tournoi === "Multi" ? "Multi" : "Classique",
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
