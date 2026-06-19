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
        "group relative w-full cursor-pointer rounded-lg border border-border bg-card px-3 py-2.5 text-left",
        "transition-all duration-150",
        "hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm",
        "active:scale-[0.99]",
        "animate-in duration-150 fade-in"
      )}
    >
      <div className="pr-16">
        <p className="text-sm leading-tight font-medium text-foreground">
          {strategie.nom}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
          {strategie.explication}
        </p>
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {onEdit && (
          <button
            type="button"
            onClick={handleEdit}
            title="Edit strategy"
            className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground"
          >
            <Pencil className="size-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            title="Delete strategy"
            className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-border bg-background text-destructive transition-all duration-150 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
