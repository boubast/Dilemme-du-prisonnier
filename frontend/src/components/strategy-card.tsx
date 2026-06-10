import { cn } from "@/lib/utils"
import type { Strategie } from "@/type"
import { Pencil, Trash2 } from "lucide-react"
import type { MouseEvent } from "react"

interface StrategyCardProps {
  strategie: Strategie
  onSelect: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function StrategyCard({
  strategie,
  onSelect,
  onEdit,
  onDelete,
}: StrategyCardProps) {
  function handleEdit(e: MouseEvent) {
    e.stopPropagation()
    onEdit?.(strategie.id)
  }

  function handleDelete(e: MouseEvent) {
    e.stopPropagation()
    onDelete?.(strategie.id)
  }

  return (
    <div
      onClick={() => onSelect(strategie.id)}
      className={cn(
        "group relative w-full rounded-lg border border-border bg-card px-3 py-2.5 text-left cursor-pointer",
        "transition-all duration-150",
        "hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm",
        "active:scale-[0.99]",
        "animate-in fade-in duration-150"
      )}
    >
      <div className="pr-16">
        <p className="text-sm font-medium text-foreground leading-tight">
          {strategie.nom}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground leading-snug line-clamp-2">
          {strategie.explication}
        </p>
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {onEdit && (
          <button
            type="button"
            onClick={handleEdit}
            title="Modifier la stratégie"
            className="flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 cursor-pointer"
          >
            <Pencil className="size-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            title="Supprimer la stratégie"
            className="flex size-7 items-center justify-center rounded-md border border-border bg-background text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-150 cursor-pointer"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
