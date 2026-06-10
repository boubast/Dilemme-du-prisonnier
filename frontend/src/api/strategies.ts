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
  const newStrategy: Strategie = {
    ...strategy,
    id: String(MOCK_STRATEGIES.length + 1),
  }
  MOCK_STRATEGIES.push(newStrategy)
  return newStrategy
}

