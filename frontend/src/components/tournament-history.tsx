import type { Tournoi } from "@/type"
import { cn } from "@/lib/utils"
import { Badge } from "./ui/badge"
import { Crown, LoaderCircle } from "lucide-react"

interface TournamentHistoryProps {
  tournaments: Tournoi[]
  pendingTournamentId: string | null
  selectedId: string | null
  onSelect: (id: string) => void
  loading: boolean
}

export default function TournamentHistory({
  tournaments,
  pendingTournamentId,
  selectedId,
  onSelect,
  loading,
}: TournamentHistoryProps) {
  return (
    <section className="flex w-1/3 flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Tournament history
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Recent experiments
        </p>
      </div>

      <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-20 animate-pulse rounded-lg border border-border bg-muted/20"
              />
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No tournaments recorded.
          </p>
        ) : (
          tournaments.map((t) => {
            const isActive = t.id === selectedId
            const isPending = t.id === pendingTournamentId

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelect(t.id)}
                className={cn(
                  "group relative w-full cursor-pointer rounded-lg border p-3.5 text-left transition-all duration-150",
                  isActive
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border bg-card hover:border-primary/30 hover:bg-muted/10"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      "text-xs leading-none font-semibold",
                      isActive
                        ? "text-primary"
                        : "text-foreground transition-colors group-hover:text-primary"
                    )}
                  >
                    {t.nom}
                  </span>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "h-4 shrink-0 rounded-sm border-none px-1.5 py-0 text-[9px] font-semibold tracking-wide uppercase",
                        t.mode === "multi"
                          ? "bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                          : "bg-zinc-500/15 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400"
                      )}
                    >
                      In progress
                    </Badge>
                    ) : isRecent ? (
                    <Badge
                      variant="secondary"
                      className="h-4 shrink-0 rounded-sm border-none bg-primary/10 px-1 py-0 text-[9px] font-semibold tracking-wide text-primary uppercase"
                    >
                      Recent
                    </Badge>
                    ) : null
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-[10px] leading-none text-muted-foreground">
                    {t.date_creation}
                  </p>
                  <Badge variant={"outline"}>
                    {isPending ? (
                      <>
                        <LoaderCircle className="size-3 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        {" "}
                        <Crown /> {t.meilleure_strategie}
                      </>
                    )}
                  </Badge>
                </div>
              </button>
            )
          })
        )}
      </div>
    </section>
  )
}
