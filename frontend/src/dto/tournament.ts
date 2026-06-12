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
}

export interface TournoiDTO {
  id_tournoi: number
  nom: string
  date_creation: string
  meilleure_strategie: string
  nb_iterations: number
  couts: {
    tentation: number
    recompense: number
    punition: number
    dupe: number
  }
  strategies: StrategieDTO[]
  parties: PartieDTO[]
}

export interface TournoiListItemDTO {
  id_tournoi: number
  nom: string
  date_creation: string
  meilleure_strategie: string
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
  const couts = dto.couts

  // 1. Map each partie and compute its score/result details
  const parties = dto.parties.map((pDto) => {
    const partieId = String(pDto.id_partie)
    const s1 = mapStrategieDTOToStrategie(pDto.strategie_1)
    const s2 = mapStrategieDTOToStrategie(pDto.strategie_2)

    let scoreStrategie1 = 0
    let scoreStrategie2 = 0

    // Construct the iterations
    const partie: Partial<Partie> = {
      id: partieId,
      strategie1: s1,
      strategie2: s2,
    }

    const iterations = pDto.iterations.map((iDto) => {
      // Calculate scores for this round (choix_strategie: true = betray, false = cooperate)
      const c1 = iDto.choix_strategie_1
      const c2 = iDto.choix_strategie_2

      const players = {
        p1: 0,
        p2: 0,
      }
      if (!c1 && !c2) {
        players.p1 = couts.recompense
        players.p2 = couts.recompense
      } else if (!c1 && c2) {
        players.p1 = couts.dupe
        players.p2 = couts.tentation
      } else if (c1 && !c2) {
        players.p1 = couts.tentation
        players.p2 = couts.dupe
      } else {
        players.p1 = couts.punition
        players.p2 = couts.punition
      }

      scoreStrategie1 += players.p1
      scoreStrategie2 += players.p2

      return mapIterationDTOToIteration(iDto, partie as Partie)
    })

    partie.iterations = iterations
    partie.scoreStrategie1 = scoreStrategie1
    partie.scoreStrategie2 = scoreStrategie2
    partie.resultats = {
      victoire_strategie1: scoreStrategie1 > scoreStrategie2 ? 1 : 0,
      victoire_strategie2: scoreStrategie2 > scoreStrategie1 ? 1 : 0,
      nul: scoreStrategie1 === scoreStrategie2 ? 1 : 0,
    }

    return partie as Partie
  })

  // 2. Compute scores_totaux and resultats for the Tournoi
  type VND = { victoires: number; nuls: number; defaites: number }
  const scores_totaux: Record<string, number> = {}
  const resultats: Record<string, VND> = {}

  strategies.forEach((s) => {
    scores_totaux[s.id] = 0
    resultats[s.id] = { victoires: 0, nuls: 0, defaites: 0 }
  })

  parties.forEach((p) => {
    scores_totaux[p.strategie1.id] =
      (scores_totaux[p.strategie1.id] || 0) + p.scoreStrategie1
    scores_totaux[p.strategie2.id] =
      (scores_totaux[p.strategie2.id] || 0) + p.scoreStrategie2

    if (p.scoreStrategie1 > p.scoreStrategie2) {
      if (resultats[p.strategie1.id]) resultats[p.strategie1.id].victoires += 1
      if (resultats[p.strategie2.id]) resultats[p.strategie2.id].defaites += 1
    } else if (p.scoreStrategie1 < p.scoreStrategie2) {
      if (resultats[p.strategie2.id]) resultats[p.strategie2.id].victoires += 1
      if (resultats[p.strategie1.id]) resultats[p.strategie1.id].defaites += 1
    } else {
      if (resultats[p.strategie1.id]) resultats[p.strategie1.id].nuls += 1
      if (resultats[p.strategie2.id]) resultats[p.strategie2.id].nuls += 1
    }
  })

  return {
    id: String(dto.id_tournoi),
    nom: dto.nom,
    nb_iterations: dto.nb_iterations,
    date_creation: dto.date_creation,
    meilleure_strategie: dto.meilleure_strategie,
    couts: dto.couts,
    strategies,
    parties,
    scores_totaux,
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
