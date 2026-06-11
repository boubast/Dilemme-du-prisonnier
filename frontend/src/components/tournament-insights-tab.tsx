import type { Tournoi } from "@/type"
import { BarChart3 } from "lucide-react"

interface TournamentInsightsTabProps {
  tournoi: Tournoi
}

export default function TournamentInsightsTab({
  tournoi,
}: TournamentInsightsTabProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center animate-in fade-in duration-150">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <BarChart3 className="size-5 animate-pulse" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Analyses de &ldquo;{tournoi.nom}&rdquo;
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
          Cette section contiendra prochainement des graphiques détaillés pour
          comparer l'efficacité relative des stratégies du tournoi.
        </p>
      </div>
    </div>
  )
}
