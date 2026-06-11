import { Plus } from "lucide-react"

interface AddStrategyButtonProps {
  onClick: () => void
}

export function AddStrategyButton({ onClick }: AddStrategyButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-transparent text-sm font-medium text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground transition-all duration-150 cursor-pointer"
    >
      <Plus className="size-4" />
      Ajouter une stratégie
    </button>
  )
}
