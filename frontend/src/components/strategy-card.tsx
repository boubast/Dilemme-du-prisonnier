import { cn } from "@/lib/utils"
import type { Strategie } from "@/type"

interface StrategyCardProps {
  strategie: Strategie
  onSelect: (id: string) => void
}

export function StrategyCard({ strategie, onSelect }: StrategyCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(strategie.id)}
      className={cn(
        "group w-full rounded-lg border border-border bg-card px-3 py-2.5 text-left cursor-pointer",
        "transition-all duration-150",
        "hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm",
        "active:scale-[0.99]",
        "animate-in fade-in duration-150"
      )}
    >
      <p className="text-sm font-medium text-foreground leading-tight">{strategie.nom}</p>
      <p className="mt-0.5 text-xs text-muted-foreground leading-snug line-clamp-2">
        {strategie.explication}
      </p>
    </button>
  )
}
