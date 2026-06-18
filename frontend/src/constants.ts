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
    snippet: `if len(last_opposing_stokes)==0{return Choice::COOPERATE;} 
else{
    if last_opposing_stokes[-1]==Choice::COOPERATE.value{return Choice::COOPERATE;}
    else{return Choice::BETRAY;}
};`,
  },
  {
    title: "Grudger",
    description: "Cooperate, but always betray if an opponent betray",
    snippet: `for i in last_opposing_stokes{
    if i==Choice::BETRAY.value{return Choice::BETRAY;}
} 
return Choice::COOPERATE;`,
  },
]

export const HELP_BLOCKS_MULTI: HelpBlock[] = [
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
    title: "Tit for tat (Multi)",
    description:
      "Replicates the last action of the other player (assumes a 2-player multi-game setup)",
    snippet: `let opp_number = 1 - own_number;
let opp_indices = strategies_strokes_locations[opp_number];
if len(opp_indices) == 0 {
    return Choice::COOPERATE;
} else {
    let last_opp_choice = last_strokes[opp_indices[-1]];
    if last_opp_choice == Choice::COOPERATE.value {
        return Choice::COOPERATE;
    } else {
        return Choice::BETRAY;
    }
}`,
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
