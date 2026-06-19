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
      className="inline-flex h-6 animate-in items-center gap-1 pr-1.5 pl-2.5 font-medium duration-150 fade-in slide-in-from-top-1"
    >
      {strategie.nom}
      <button
        type="button"
        onClick={() => onRemove(strategie.id)}
        className="ml-0.5 flex size-3.5 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={`Remove ${strategie.nom}`}
      >
        <X className="size-2.5" />
      </button>
    </Badge>
  )
}
