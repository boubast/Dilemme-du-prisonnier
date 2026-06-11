import type { HelpBlock } from "./type"

export const HELP_BLOCKS: HelpBlock[] = [
  {
    title: "Premier tour",
    description: "Agir différemment au tout premier coup",
    snippet: `if history.is_empty() {
    return "C";
}`,
  },
  {
    title: "Dernier coup adverse",
    description: "Lire le dernier coup de l'adversaire",
    snippet: `let last = history[history.len() - 1];
if last == "C" { "C" } else { "D" }`,
  },
  {
    title: "A déjà trahi ?",
    description: "Vérifier si l'adversaire a trahi",
    snippet: `let betrayed = history.contains("D");
if betrayed { "D" } else { "C" }`,
  },
  {
    title: "Aléatoire",
    description: "Choisir au hasard",
    snippet: `if rand() > 0.5 { "C" } else { "D" }`,
  },
  {
    title: "Compter les coopérations",
    description: "Boucler sur l'historique",
    snippet: `let coops = 0;
for m in history {
    if m == "C" { coops += 1; }
}
if coops > history.len() / 2 { "C" } else { "D" }`,
  },
]
