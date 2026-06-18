import { Save, Lightbulb, HelpCircle, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMemo, useState, type FormEvent } from "react"
import { useStrategy } from "@/hooks/useStrategy"
import { StrategyCodeEditor } from "@/components/strategy-code-editor"
import { HELP_BLOCKS, TOAST_STYLE } from "@/constants"
import { toast } from "sonner"
import { validateRhaiScript } from "@/lib/rhai-validation"
import { validateStrategySyntax } from "@/api/strategies"
import { ApiError } from "@/api/apiError"

interface StrategyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  strategyId: string | null
  onSave: () => void
  defaultType?: string
}

export function StrategyDialog({
  open,
  onOpenChange,
  strategyId,
  onSave,
  defaultType = "Classique",
}: StrategyDialogProps) {
  const {
    nom,
    setNom,
    explication,
    setExplication,
    scriptRhai,
    setScriptRhai,
    typeTournoi,
    setTypeTournoi,
    loading: isLoading,
    save,
  } = useStrategy(false, strategyId, open, defaultType)
  const syntaxError = useMemo(
    () => validateRhaiScript(scriptRhai),
    [scriptRhai]
  )
  const [rhaiError, setRhaiError] = useState<string | null>(null)
  const [isValidatingSyntax, setIsValidatingSyntax] = useState(false)
  const displayedSyntaxError = syntaxError?.message || rhaiError

  function insertSnippet(snippet: string) {
    setScriptRhai((prev: string) => {
      const sep = prev.trim() ? "\n\n" : ""
      return prev + sep + snippet
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (syntaxError) {
      toast.error(syntaxError.message, { style: TOAST_STYLE.error })
      return
    }

    setIsValidatingSyntax(true)
    setRhaiError(null)
    try {
      const validationError = await validateStrategySyntax(scriptRhai.trim(),typeTournoi)
      if (validationError) {
        setRhaiError(validationError)
        toast.error(validationError, { style: TOAST_STYLE.error })
        return
      }
    } catch (error) {
      console.error("Rhai validation failed:", error)
      toast.error("Could not validate the Rhai syntax.")
      return
    } finally {
      setIsValidatingSyntax(false)
    }
    try {
      await save()
      toast.success(
        strategyId
          ? "Strategy updated successfully."
          : "Strategy created successfully.",
        { style: TOAST_STYLE.success }
      )
      onSave()
      onOpenChange(false)
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.friendlyMessage
          : (err as Error).message || "Unknown error"
      toast.error(`Could not save the strategy: ${message}`, {
        style: TOAST_STYLE.error,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "h-[90vh] max-h-[90vh] w-[95vw] sm:max-w-5xl",
          "flex flex-col gap-0 overflow-hidden p-0",
          "rounded-xl"
        )}
      >
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          {/* ── Header ── */}
          <div className="shrink-0 border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold text-foreground">
              {strategyId ? "Edit strategy" : "New strategy"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {strategyId
                ? "Edit the strategy name, description, or Rhai script."
                : "Enter a name and description, then write your Rhai script."}
            </p>
          </div>

          {/* ── Body (two columns, scrollable) ── */}
          <div className="flex min-h-0 flex-1">
            {/* Left — form */}
            <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
              {/* Nom */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="strategy-name"
                  className="text-sm font-medium text-foreground"
                >
                  Name
                </label>
                <input
                  id="strategy-name"
                  type="text"
                  placeholder="Ex. Tit for Two Tats"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  autoFocus
                  className={cn(
                    "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm",
                    "focus:border-ring focus:ring-2 focus:ring-ring/50 focus:outline-none",
                    "transition-colors"
                  )}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="strategy-desc"
                  className="text-sm font-medium text-foreground"
                >
                  Description
                </label>
                <input
                  id="strategy-desc"
                  type="text"
                  placeholder="In one sentence, what does this strategy do?"
                  value={explication}
                  onChange={(e) => setExplication(e.target.value)}
                  required
                  className={cn(
                    "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm",
                    "focus:border-ring focus:ring-2 focus:ring-ring/50 focus:outline-none",
                    "transition-colors"
                  )}
                />
              </div>

              {/* Type de tournoi */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="strategy-type"
                  className="text-sm font-medium text-foreground"
                >
                  Type de tournoi
                </label>
                <select
                  id="strategy-type"
                  value={typeTournoi}
                  onChange={(e) => setTypeTournoi(e.target.value)}
                  required
                  className={cn(
                    "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:border-ring focus:ring-2 focus:ring-ring/50 focus:outline-none transition-colors"
                  )}
                >
                  <option value="Classique">Classique</option>
                  <option value="Multi">Multi</option>
                </select>
              </div>

              {/* Script Rhai */}
              <div className="flex min-h-0 flex-1 flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="strategy-code"
                    className="text-sm font-medium text-foreground"
                  >
                    Script Rhai
                  </label>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
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
                      className="w-80 sm:w-105 p-4 max-h-100 overflow-y-auto"
                      onWheel={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="border-b border-border pb-2">
                          <h4 className="font-semibold text-foreground text-sm">
                            Rhai Variables &amp; Syntax
                          </h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Variables and functions available during each turn of your strategy's execution.
                          </p>
                        </div>

                        {/* Variables */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Injected Variables
                          </span>
                          <div className="flex flex-col gap-2 text-xs">
                            <div className="rounded-md bg-muted/40 p-2 border border-border/50">
                              <code className="font-mono text-primary font-semibold block text-[11px]">
                                derniers_coups_strategie_courante
                              </code>
                              <span className="text-muted-foreground text-[11px]">
                                List of your past choices (e.g., <code className="font-mono bg-muted px-1 text-[10px]">[0, 1]</code>).
                              </span>
                            </div>
                            <div className="rounded-md bg-muted/40 p-2 border border-border/50">
                              <code className="font-mono text-primary font-semibold block text-[11px]">
                                derniers_coups_strategie_adverse
                              </code>
                              <span className="text-muted-foreground text-[11px]">
                                List of the opponent's past choices (e.g., <code className="font-mono bg-muted px-1 text-[10px]">[0, 1]</code>).
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div className="rounded-md bg-muted/40 p-2 border border-border/50">
                                <code className="font-mono text-primary font-semibold block text-[11px]">
                                  cout_cooperation
                                </code>
                                <span className="text-muted-foreground text-[11px]">
                                  Mutual cooperation (C-C).
                                </span>
                              </div>
                              <div className="rounded-md bg-muted/40 p-2 border border-border/50">
                                <code className="font-mono text-primary font-semibold block text-[11px]">
                                  cout_trahison
                                </code>
                                <span className="text-muted-foreground text-[11px]">
                                  Mutual betrayal (T-T).
                                </span>
                              </div>
                              <div className="rounded-md bg-muted/40 p-2 border border-border/50">
                                <code className="font-mono text-primary font-semibold block text-[11px]">
                                  cout_trahison_cooperation
                                </code>
                                <span className="text-muted-foreground text-[11px]">
                                  Temptation (you betray, opponent cooperates).
                                </span>
                              </div>
                              <div className="rounded-md bg-muted/40 p-2 border border-border/50">
                                <code className="font-mono text-primary font-semibold block text-[11px]">
                                  cout_cooperation_trahison
                                </code>
                                <span className="text-muted-foreground text-[11px]">
                                  Sucker (you cooperate, opponent betrays).
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Syntaxe & Astuces */}
                        <div className="flex flex-col gap-1.5 border-t border-border pt-2.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Syntax &amp; Tips
                          </span>
                          <ul className="list-disc list-inside text-[11px] text-muted-foreground space-y-1.5 leading-relaxed">
                            <li>
                              Must return{" "}
                              <code className="font-mono text-foreground font-semibold bg-muted px-1">
                                Choice::COOPERATE
                              </code>{" "}
                              or{" "}
                              <code className="font-mono text-foreground font-semibold bg-muted px-1">
                                Choice::BETRAY
                              </code>.
                            </li>
                            <li>
                              To compare:{" "}
                              <code className="font-mono text-foreground bg-muted px-1">
                                derniers_coups_strategie_adverse[-1] == Choice::COOPERATE.value
                              </code>{" "}
                              (past choices correspond to string values <code className="font-mono font-bold">"0"</code> or <code className="font-mono font-bold">"1"</code>).
                            </li>
                            <li>
                              Number of past rounds:{" "}
                              <code className="font-mono text-foreground bg-muted px-1">
                                len(derniers_coups_strategie_adverse)
                              </code>.
                            </li>
                            <li>
                              Random:{" "}
                              <code className="font-mono text-foreground bg-muted px-1">
                                rand(0, 1)
                              </code>.
                            </li>
                          </ul>
                        </div>

                        {/* Liens utiles */}
                        <div className="flex border-t border-border pt-3 mt-1">
                          <a
                            href="https://rhai.rs/book/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/95 transition-colors"
                          >
                            <ExternalLink className="size-3" />
                            View Rhai Documentation
                          </a>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <StrategyCodeEditor
                  id="strategy-code"
                  value={scriptRhai}
                  onChange={(value) => {
                    setRhaiError(null)
                    setScriptRhai(value)
                  }}
                />
                {displayedSyntaxError && (
                  <p className="rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
                    {displayedSyntaxError}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  The function must return{" "}
                  <code className="rounded bg-muted px-1 font-mono">
                    Choice::COOPERATE
                  </code>{" "}
                  (cooperate) or{" "}
                  <code className="rounded bg-muted px-1 font-mono">
                    Choice::BETRAY
                  </code>{" "}
                  (betray).
                </p>
              </div>
            </div>

            {/* Right — blocs d'aide */}
            <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-muted/20">
              {/* Scrollable content */}
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Lightbulb className="size-4 text-yellow-500" />
                  Help blocks
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Click to insert a common Rhai code snippet.
                </p>

                <div className="flex flex-col gap-2">
                  {HELP_BLOCKS.map((block) => (
                    <button
                      key={block.title}
                      type="button"
                      onClick={() => insertSnippet(block.snippet)}
                      className={cn(
                        "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-left",
                        "cursor-pointer transition-all duration-150",
                        "hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm",
                        "active:scale-[0.98]"
                      )}
                    >
                      <p className="text-xs font-semibold text-foreground">
                        {block.title}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                        {block.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-3">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 justify-center"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    isValidatingSyntax ||
                    Boolean(displayedSyntaxError)
                  }
                  className="flex-1 justify-center gap-1.5"
                >
                  <Save className="size-3.5" />
                  {isValidatingSyntax
                    ? "Validating..."
                    : isLoading
                      ? "Saving..."
                      : "Save"}
                </Button>
              </div>
            </aside>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
