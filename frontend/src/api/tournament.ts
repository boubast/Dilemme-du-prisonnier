import type { TournamentConfig } from "@/type"

/**
 * Lance un tournoi avec la configuration fournie.
 * TODO: POST /api/tournois avec { strategies_ids, nb_iterations, couts }
 */
export async function createTournament(config: TournamentConfig): Promise<void> {
  console.log("createTournament called with:", config)
  await new Promise((r) => setTimeout(r, 0))
}
