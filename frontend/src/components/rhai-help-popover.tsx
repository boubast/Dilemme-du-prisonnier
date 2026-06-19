import { HelpCircle, ExternalLink } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface RhaiHelpPopoverProps {
  typeTournoi: string
}

export function RhaiHelpPopover({ typeTournoi }: RhaiHelpPopoverProps) {
  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Rhai variables help"
        >
          <HelpCircle className="size-4" />
          <span>Help</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="center"
        sideOffset={8}
        className="max-h-100 w-80 overflow-y-auto p-4 sm:w-105"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-3">
          {typeTournoi === "Multi" ? (
            <>
              <div className="border-b border-border pb-2">
                <h4 className="text-sm font-semibold text-foreground">
                  Rhai Variables &amp; Syntax (Multi)
                </h4>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Variables and functions available during each turn of your
                  strategy in a multi-player tournament.
                </p>
              </div>

              {/* Variables */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Injected Variables
                </span>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="rounded-md border border-border/50 bg-muted/40 p-2">
                    <code className="block font-mono text-[11px] font-semibold text-primary">
                      last_strokes
                    </code>
                    <span className="text-[11px] text-muted-foreground">
                      Chronological list of all choices played by all strategies
                      in the tournament (e.g.,{" "}
                      <code className="bg-muted px-1 font-mono text-[10px]">
                        [0, 1, 0, 0]
                      </code>
                      ).
                    </span>
                  </div>
                  <div className="rounded-md border border-border/50 bg-muted/40 p-2">
                    <code className="block font-mono text-[11px] font-semibold text-primary">
                      strategies_strokes_locations
                    </code>
                    <span className="text-[11px] text-muted-foreground">
                      Nested list where{" "}
                      <code className="font-mono text-[10px]">
                        strategies_strokes_locations[i]
                      </code>{" "}
                      contains indices of the actions taken by strategy{" "}
                      <code className="font-mono text-[10px]">i</code> in{" "}
                      <code className="font-mono text-[10px]">
                        last_strokes
                      </code>
                      .
                    </span>
                  </div>
                  <div className="rounded-md border border-border/50 bg-muted/40 p-2">
                    <code className="block font-mono text-[11px] font-semibold text-primary">
                      own_number
                    </code>
                    <span className="text-[11px] text-muted-foreground">
                      Index of your current strategy (e.g.,{" "}
                      <code className="bg-muted px-1 font-mono text-[10px]">
                        0
                      </code>{" "}
                      or{" "}
                      <code className="bg-muted px-1 font-mono text-[10px]">
                        1
                      </code>
                      ). Use it to look up your own moves.
                    </span>
                  </div>
                </div>
              </div>

              {/* Syntaxe & Astuces */}
              <div className="flex flex-col gap-1.5 border-t border-border pt-2.5">
                <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Syntax &amp; Tips
                </span>
                <ul className="list-inside list-disc space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  <li>
                    Must return{" "}
                    <code className="bg-muted px-1 font-mono font-semibold text-foreground">
                      Choice::COOPERATE
                    </code>{" "}
                    or{" "}
                    <code className="bg-muted px-1 font-mono font-semibold text-foreground">
                      Choice::BETRAY
                    </code>
                    .
                  </li>
                  <li>
                    To get your own last choice:
                    <pre className="mt-1 overflow-x-auto rounded bg-muted/50 p-1.5 font-mono text-[10px]">
                      {`let my_indices = strategies_strokes_locations[own_number];
if len(my_indices) > 0 {
    let my_last_choice = last_strokes[my_indices[-1]];
}`}
                    </pre>
                  </li>
                  <li>
                    To get the other player's last choice (assuming a 2-player
                    multi-game setup):
                    <pre className="mt-1 overflow-x-auto rounded bg-muted/50 p-1.5 font-mono text-[10px]">
                      {`let opp_number = 1 - own_number;
let opp_indices = strategies_strokes_locations[opp_number];
if len(opp_indices) > 0 {
    let opp_last_choice = last_strokes[opp_indices[-1]];
}`}
                    </pre>
                  </li>
                  <li>
                    Random:{" "}
                    <code className="bg-muted px-1 font-mono text-foreground">
                      rand(0, 1)
                    </code>
                    .
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="border-b border-border pb-2">
                <h4 className="text-sm font-semibold text-foreground">
                  Rhai Variables &amp; Syntax (Classic)
                </h4>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Variables and functions available during each turn of your
                  strategy in a classic 2-player tournament.
                </p>
              </div>

              {/* Variables */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Injected Variables
                </span>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="rounded-md border border-border/50 bg-muted/40 p-2">
                    <code className="block font-mono text-[11px] font-semibold text-primary">
                      last_current_strokes
                    </code>
                    <span className="text-[11px] text-muted-foreground">
                      List of your past choices (e.g.,{" "}
                      <code className="bg-muted px-1 font-mono text-[10px]">
                        [0, 1]
                      </code>
                      ).
                    </span>
                  </div>
                  <div className="rounded-md border border-border/50 bg-muted/40 p-2">
                    <code className="block font-mono text-[11px] font-semibold text-primary">
                      last_opposing_stokes
                    </code>
                    <span className="text-[11px] text-muted-foreground">
                      List of the opponent's past choices (e.g.,{" "}
                      <code className="bg-muted px-1 font-mono text-[10px]">
                        [0, 1]
                      </code>
                      ).
                    </span>
                  </div>

                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <div className="rounded-md border border-border/50 bg-muted/40 p-2">
                      <code className="block font-mono text-[11px] font-semibold text-primary">
                        cost_cooperate
                      </code>
                      <span className="text-[11px] text-muted-foreground">
                        Mutual cooperation (C-C).
                      </span>
                    </div>
                    <div className="rounded-md border border-border/50 bg-muted/40 p-2">
                      <code className="block font-mono text-[11px] font-semibold text-primary">
                        cost_betray
                      </code>
                      <span className="text-[11px] text-muted-foreground">
                        Mutual betrayal (T-T).
                      </span>
                    </div>
                    <div className="rounded-md border border-border/50 bg-muted/40 p-2">
                      <code className="block font-mono text-[11px] font-semibold text-primary">
                        cost_betray_cooperate
                      </code>
                      <span className="text-[11px] text-muted-foreground">
                        Temptation (you betray, opponent cooperates).
                      </span>
                    </div>
                    <div className="rounded-md border border-border/50 bg-muted/40 p-2">
                      <code className="block font-mono text-[11px] font-semibold text-primary">
                        cost_cooperate_betray
                      </code>
                      <span className="text-[11px] text-muted-foreground">
                        Sucker (you cooperate, opponent betrays).
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Syntaxe & Astuces */}
              <div className="flex flex-col gap-1.5 border-t border-border pt-2.5">
                <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Syntax &amp; Tips
                </span>
                <ul className="list-inside list-disc space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  <li>
                    Must return{" "}
                    <code className="bg-muted px-1 font-mono font-semibold text-foreground">
                      Choice::COOPERATE
                    </code>{" "}
                    or{" "}
                    <code className="bg-muted px-1 font-mono font-semibold text-foreground">
                      Choice::BETRAY
                    </code>
                    .
                  </li>
                  <li>
                    To compare:{" "}
                    <code className="bg-muted px-1 font-mono text-foreground">
                      last_opposing_stokes[-1] == Choice::COOPERATE.value
                    </code>{" "}
                    (past choices correspond to string values{" "}
                    <code className="font-mono font-bold">"0"</code> or{" "}
                    <code className="font-mono font-bold">"1"</code>).
                  </li>
                  <li>
                    Number of past rounds:{" "}
                    <code className="bg-muted px-1 font-mono text-foreground">
                      len(last_opposing_stokes)
                    </code>
                    .
                  </li>
                  <li>
                    Random:{" "}
                    <code className="bg-muted px-1 font-mono text-foreground">
                      rand(0, 1)
                    </code>
                    .
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* Liens utiles */}
          <div className="mt-1 flex border-t border-border pt-3">
            <a
              href="https://rhai.rs/book/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/95"
            >
              <ExternalLink className="size-3" />
              View Rhai Documentation
            </a>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
