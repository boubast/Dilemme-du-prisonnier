import { useState } from "react"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createStrategy } from "@/api/strategies"
import { cn } from "@/lib/utils"

interface AddStrategyButtonProps {
  onStrategyAdded: () => void
}

export function AddStrategyButton({ onStrategyAdded }: AddStrategyButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [nom, setNom] = useState("")
  const [explication, setExplication] = useState("")
  const [scriptRhai, setScriptRhai] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nom.trim() || !explication.trim() || !scriptRhai.trim()) return

    setIsLoading(true)
    try {
      await createStrategy({
        nom: nom.trim(),
        explication: explication.trim(),
        script_rhai: scriptRhai.trim(),
      })
      // Reset form
      setNom("")
      setExplication("")
      setScriptRhai("")
      setIsOpen(false)
      onStrategyAdded()
    } catch (error) {
      console.error("Erreur lors de la création de la stratégie :", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-transparent text-sm font-medium text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground transition-all duration-150 cursor-pointer"
        >
          <Plus className="size-4" />
          Ajouter une stratégie
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Ajouter une stratégie</DialogTitle>
            <DialogDescription>
              Créez une nouvelle stratégie pour le tournoi d'Axelrod en fournissant son nom, sa description et son script Rhai.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {/* Nom */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="strategy-name" className="text-xs font-semibold text-foreground">
                Nom
              </label>
              <input
                id="strategy-name"
                type="text"
                placeholder="Ex: Tit for Tat"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                className={cn(
                  "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
                  "transition-colors"
                )}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="strategy-desc" className="text-xs font-semibold text-foreground">
                Description
              </label>
              <textarea
                id="strategy-desc"
                placeholder="Ex: Coopère au premier tour, puis reproduit le dernier coup..."
                value={explication}
                onChange={(e) => setExplication(e.target.value)}
                required
                rows={2}
                className={cn(
                  "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm resize-none",
                  "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
                  "transition-colors"
                )}
              />
            </div>

            {/* Script Rhai */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="strategy-code" className="text-xs font-semibold text-foreground">
                Script Rhai
              </label>
              <textarea
                id="strategy-code"
                placeholder="Ex: if iteration == 0 { coopere } else { last_move_opponent }"
                value={scriptRhai}
                onChange={(e) => setScriptRhai(e.target.value)}
                required
                rows={3}
                className={cn(
                  "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono resize-none",
                  "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
                  "transition-colors"
                )}
              />
            </div>
          </div>

          <DialogFooter className="mt-2 flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Création..." : "Ajouter la stratégie"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
