import type { Strategie } from "@/type"
import { mapStrategieDTOToStrategie, type StrategieDTO } from "@/dto/strategy"
import { handleApiResponseError } from "./apiError"

const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:8000") +
  (import.meta.env.VITE_API_PREFIX || "/api/v1")

export async function fetchStrategies(typeTournoi:string): Promise<Strategie[]> {
  try {
    const response = await fetch(`${API_URL}/strategy/${typeTournoi}`)

    if (!response.ok) {
      throw await handleApiResponseError(
        response,
        "Could not retrieve strategies"
      )
    }

    const data: StrategieDTO[] = await response.json()

    return data.map(mapStrategieDTOToStrategie)
  } catch (error) {
    console.error("fetchStrategies error:", error)
    throw error
  }
}

export async function fetchStrategyById(
  id: string
): Promise<Strategie | undefined> {
  try {
    const response = await fetch(`${API_URL}/strategy/${id}`)

    if (response.status === 404) {
      return undefined
    }

    if (!response.ok) {
      throw await handleApiResponseError(
        response,
        "Could not retrieve the strategy"
      )
    }

    const data: StrategieDTO = await response.json()
    return mapStrategieDTOToStrategie(data)
  } catch (error) {
    console.error("fetchStrategyById error:", error)
    throw error
  }
}

export async function createStrategy(
  strategy: Omit<Strategie, "id">
): Promise<Strategie> {
  try {
    const response = await fetch(`${API_URL}/strategy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nom: strategy.nom,
        explication: strategy.explication,
        script_rhai: strategy.script_rhai,
        type_strategie: strategy.type,
      }),
    })

    if (!response.ok) {
      throw await handleApiResponseError(
        response,
        "Could not create the strategy"
      )
    }

    const data: StrategieDTO = await response.json()
    return mapStrategieDTOToStrategie(data)
  } catch (error) {
    console.error("createStrategy error:", error)
    throw error
  }
}

export async function validateStrategySyntax(
  scriptRhai: string
): Promise<string | null> {
  const response = await fetch(`${API_URL}/strategy/validate-syntax`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      script_rhai: scriptRhai,
    }),
  })

  if (!response.ok) {
    throw new Error("Syntax validation failed")
  }

  const data: { valid: boolean; error: string | null } = await response.json()
  return data.valid ? null : data.error || "Invalid Rhai script."
}

/**
 * Met à jour une stratégie existante.
 */
export async function updateStrategy(
  id: string,
  strategy: Omit<Strategie, "id">
): Promise<Strategie> {
  try {
    const response = await fetch(`${API_URL}/strategy/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nom: strategy.nom,
        explication: strategy.explication,
        script_rhai: strategy.script_rhai,
        type_strategie: strategy.type,
      }),
    })

    if (!response.ok) {
      throw await handleApiResponseError(
        response,
        "Could not update the strategy"
      )
    }

    const data: StrategieDTO = await response.json()
    return mapStrategieDTOToStrategie(data)
  } catch (error) {
    console.error("updateStrategy error:", error)
    throw error
  }
}

/**
 * Supprime une stratégie par son identifiant.
 */
export async function deleteStrategy(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/strategy/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw await handleApiResponseError(
        response,
        "Could not delete the strategy"
      )
    }
  } catch (error) {
    console.error("deleteStrategy error:", error)
    throw error
  }
}
