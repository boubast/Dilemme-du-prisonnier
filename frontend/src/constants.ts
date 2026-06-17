import type { HelpBlock } from "./type"

export const HELP_BLOCKS: HelpBlock[] = [
  {
    title: "Always cooperate",
    description: "Always cooperate",
    snippet: `return Choice::COOPERATE;`,
  },
  {
    title: "Always betray",
    description: "Always betray",
    snippet: `return Choice::BETRAY;`,
  },
  {
    title: "Random",
    description: "Random",
    snippet: `if rand(0,1)==0{return Choice::COOPERATE;} 
else{return Choice::BETRAY;};`,
  },
  {
    title: "Tit for tat",
    description:
      "First cooperate, then subsequently replicate an opponent's previous action",
    snippet: `if len(derniers_coups_strategie_adverse)==0{return Choice::COOPERATE;} 
else{
    if derniers_coups_strategie_adverse[-1]==Choice::COOPERATE.value{return Choice::COOPERATE;}
    else{return Choice::BETRAY;}
};`,
  },
  {
    title: "Grudger",
    description: "Cooperate, but always betray if an opponent betray",
    snippet: `for i in derniers_coups_strategie_adverse{
    if i==Choice::BETRAY.value{return Choice::BETRAY;}
} 
return Choice::COOPERATE;`,
  },
]

export const TOAST_STYLE = {
  success: {
    "--normal-bg":
      "color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
    "--normal-text":
      "light-dark(var(--color-green-600), var(--color-green-400))",
    "--normal-border":
      "light-dark(var(--color-green-600), var(--color-green-400))",
  } as React.CSSProperties,
  error: {
    "--normal-bg":
      "color-mix(in oklab, var(--destructive) 10%, var(--background))",
    "--normal-text": "var(--destructive)",
    "--normal-border": "var(--destructive)",
  } as React.CSSProperties,
}
