import { Save, Lightbulb } from "lucide-react"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { FormEvent } from "react"
import { useStrategy } from "@/hooks/useStrategy"
import { StrategyCodeEditor } from "@/components/strategy-code-editor"

interface HelpBlock {
  title: string
  description: string
  snippet: string
}

const HELP_BLOCKS: HelpBlock[] = [
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

interface StrategyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  strategyId: string | null
  onSave: () => void
}

export function StrategyDialog({
  open,
  onOpenChange,
  strategyId,
  onSave,
}: StrategyDialogProps) {
  const {
    nom,
    setNom,
    explication,
    setExplication,
    scriptRhai,
    setScriptRhai,
    loading: isLoading,
    save,
  } = useStrategy(false, strategyId, open)

  function insertSnippet(snippet: string) {
    setScriptRhai((prev: string) => {
      const sep = prev.trim() ? "\n\n" : ""
      return prev + sep + snippet
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const success = await save()
    if (success) {
      toast.success(
        strategyId
          ? "Stratégie modifiée avec succès."
          : "Stratégie créée avec succès."
      )
      onSave()
      onOpenChange(false)
    } else {
      toast.error("Erreur lors de l'enregistrement de la stratégie.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-[95vw] sm:max-w-5xl h-[90vh] max-h-[90vh]",
          "flex flex-col gap-0 overflow-hidden p-0",
          "rounded-xl"
        )}
      >
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          {/* ── Header ── */}
          <div className="shrink-0 border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold text-foreground">
              {strategyId ? "Modifier la stratégie" : "Nouvelle stratégie"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {strategyId
                ? "Modifiez le nom, la description ou le script Rhai de la stratégie."
                : "Donnez un nom, une description et écrivez votre script Rhai."}
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
                  Nom
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
                  placeholder="En une phrase, que fait cette stratégie ?"
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

              {/* Script Rhai */}
              <div className="flex min-h-0 flex-1 flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="strategy-code"
                    className="text-sm font-medium text-foreground"
                  >
                    Script Rhai
                  </label>
                </div>
                <StrategyCodeEditor
                  id="strategy-code"
                  value={scriptRhai}
                  onChange={setScriptRhai}
                />
                <p className="text-[11px] text-muted-foreground">
                  La fonction doit retourner{" "}
                  <code className="rounded bg-muted px-1 font-mono">0</code>{" "}
                  (coopérer) ou{" "}
                  <code className="rounded bg-muted px-1 font-mono">1</code>{" "}
                  (trahir).
                </p>
              </div>
            </div>

            {/* Right — blocs d'aide */}
            <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-muted/20">
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Lightbulb className="size-4 text-yellow-500" />
                  Blocs d'aide
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Cliquez pour insérer un extrait de code Rhai courant.
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
              <div className="shrink-0 flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-3">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="flex-1 justify-center">
                    Annuler
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading} className="flex-1 justify-center gap-1.5">
                  <Save className="size-3.5" />
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </aside>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
