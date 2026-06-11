import type { Strategie } from "@/type"
import { MOCK_STRATEGIES } from "@/mock/mocks"

/**
 * Récupère toutes les stratégies disponibles depuis le backend.
 * TODO: remplacer par un vrai appel HTTP vers l'API REST.
 */
export async function fetchStrategies(): Promise<Strategie[]> {
  // Simulation d'une latence réseau
  await new Promise((r) => setTimeout(r, 0))
  return MOCK_STRATEGIES
}

/**
 * Récupère une stratégie par son identifiant.
 * TODO: GET /api/strategies/:id
 */
export async function fetchStrategyById(
  id: string
): Promise<Strategie | undefined> {
  await new Promise((r) => setTimeout(r, 0))
  return MOCK_STRATEGIES.find((s) => s.id === id)
}

/**
 * Crée une nouvelle stratégie (simulé).
 */
export async function createStrategy(
  strategy: Omit<Strategie, "id">
): Promise<Strategie> {
  await new Promise((r) => setTimeout(r, 0))
  const nextId = String(
    Math.max(...MOCK_STRATEGIES.map((s) => parseInt(s.id) || 0), 0) + 1
  )
  const newStrategy: Strategie = {
    ...strategy,
    id: nextId,
  }
  MOCK_STRATEGIES.push(newStrategy)
  return newStrategy
}

/**
 * Met à jour une stratégie existante.
 */
export async function updateStrategy(
  id: string,
  strategy: Omit<Strategie, "id">
): Promise<Strategie> {
  await new Promise((r) => setTimeout(r, 0))
  const index = MOCK_STRATEGIES.findIndex((s) => s.id === id)
  if (index === -1) {
    throw new Error("Stratégie non trouvée")
  }
  const updatedStrategy: Strategie = {
    ...strategy,
    id,
  }
  MOCK_STRATEGIES[index] = updatedStrategy
  return updatedStrategy
}

/**
 * Supprime une stratégie par son identifiant.
 */
export async function deleteStrategy(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 0))
  const index = MOCK_STRATEGIES.findIndex((s) => s.id === id)
  if (index !== -1) {
    MOCK_STRATEGIES.splice(index, 1)
  }
}
