import type { Strategie } from "@/type"
import { mapStrategieDTOToStrategie, type StrategieDTO } from "@/dto/strategy"

const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:8000") +
  (import.meta.env.VITE_API_PREFIX || "/api/v1")

export async function fetchStrategies(): Promise<Strategie[]> {
  try {
    const response = await fetch(`${API_URL}/strategy`)

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des stratégies")
    }

    const data: StrategieDTO[] = await response.json()

    return data.map(mapStrategieDTOToStrategie)
  } catch (error) {
    console.error("Erreur fetchStrategies:", error)
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
      throw new Error("Erreur lors de la récupération de la stratégie")
    }

    const data: StrategieDTO = await response.json()
    return mapStrategieDTOToStrategie(data)
  } catch (error) {
    console.error("Erreur fetchStrategyById:", error)
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
      }),
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la création de la stratégie")
    }

    const data: StrategieDTO = await response.json()
    return mapStrategieDTOToStrategie(data)
  } catch (error) {
    console.error("Erreur createStrategy:", error)
    throw error
  }
}

export async function validateStrategySyntax(scriptRhai: string): Promise<string | null> {
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
    throw new Error("Erreur lors de la validation syntaxique")
  }

  const data: { valid: boolean; error: string | null } = await response.json()
  return data.valid ? null : data.error || "Script Rhai invalide."
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
      }),
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour de la stratégie")
    }

    const data: StrategieDTO = await response.json()
    return mapStrategieDTOToStrategie(data)
  } catch (error) {
    console.error("Erreur updateStrategy:", error)
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
      throw new Error("Erreur lors de la suppression de la stratégie")
    }
  } catch (error) {
    console.error("Erreur deleteStrategy:", error)
    throw error
  }
}
