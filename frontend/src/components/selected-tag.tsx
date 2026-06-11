import { X } from "lucide-react"
import type { Strategie } from "@/type"
import { Badge } from "@/components/ui/badge"

interface SelectedTagProps {
  strategie: Strategie
  onRemove: (id: string) => void
}

export function SelectedTag({ strategie, onRemove }: SelectedTagProps) {
  return (
    <Badge
      variant="secondary"
      className="inline-flex items-center gap-1 pl-2.5 pr-1.5 h-6 font-medium animate-in fade-in slide-in-from-top-1 duration-150"
    >
      {strategie.nom}
      <button
        type="button"
        onClick={() => onRemove(strategie.id)}
        className="ml-0.5 flex size-3.5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        aria-label={`Retirer ${strategie.nom}`}
      >
        <X className="size-2.5" />
      </button>
    </Badge>
  )
}
