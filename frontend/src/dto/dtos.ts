import type { Strategie } from "@/type"

export type StrategieDTO = {
  id_strategie: number
  nom: string
  explication: string
  script_rhai?: string
}

export const mapStrategieDTOToStrategie = (dto: StrategieDTO): Strategie => {
  return {
    id: String(dto.id_strategie),
    nom: dto.nom,
    explication: dto.explication,
    script_rhai: dto.script_rhai || "",
  }
}
