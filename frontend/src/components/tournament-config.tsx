import { useCallback, useEffect, useRef, useState } from "react"
import { Search, X, Play, Plus } from "lucide-react"
import type { Couts, Tournoi, TournamentConfig } from "@/type"
import { useStrategy } from "@/hooks/useStrategy"
const DEFAULT_PAYOFFS: Couts = {
  tentation: 5,
  recompense: 3,
  punition: 1,
  dupe: 0,
}
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import { SelectedTag } from "./selected-tag"
import { StrategyCard } from "./strategy-card"
import { PayoffInput } from "./payoff-input"
import { AddStrategyButton } from "./add-strategy-button"
import { PayoffMatrix } from "./payoff-matrix"
import { Separator } from "./ui/separator"
import { StrategyDialog } from "./strategy-dialog"
import { createTournament } from "@/api/tournament"
import { TOAST_STYLE } from "@/constants"
import { ApiError } from "@/api/apiError"

interface TournamentConfigProps {
  onTournamentCreated: (tournoi: Tournoi) => void | Promise<void>
  onTournamentCreating: (tournoi: Tournoi) => void
  onTournamentCreationFailed: () => void
}

export default function TournamentConfig({
  onTournamentCreated,
  onTournamentCreating,
  onTournamentCreationFailed,
}: TournamentConfigProps) {
  const {
    strategies: allStrategies,
    reload: loadStrategies,
    removeStrategy,
  } = useStrategy(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [nbIterations, setNbIterations] = useState(200)
  const [payoffs, setPayoffs] = useState<Couts>(DEFAULT_PAYOFFS)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const [settingsHeight, setSettingsHeight] = useState<number | null>(null)

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStrategyId, setEditingStrategyId] = useState<string | null>(
    null
  )

  // Stratégies sélectionnées (objets complets)
  const selectedStrategies = allStrategies.filter((s) =>
    selectedIds.includes(s.id)
  )

  // Stratégies disponibles = non sélectionnées + filtre recherche
  const availableStrategies = allStrategies.filter(
    (s) =>
      !selectedIds.includes(s.id) &&
      s.nom.toLowerCase().includes(search.toLowerCase())
  )

  function handleSelect(id: string) {
    setSelectedIds((prev) => [...prev, id])
  }

  function handleRemove(id: string) {
    setSelectedIds((prev) => prev.filter((s) => s !== id))
  }

  const handleEditStrategy = useCallback((id: string) => {
    setEditingStrategyId(id)
    setIsDialogOpen(true)
  }, [])

  const handleDeleteStrategy = useCallback(
    async (id: string) => {
      if (confirm("Are you sure you want to delete this strategy?")) {
        try {
          await removeStrategy(id)
          setSelectedIds((prev) => prev.filter((sid) => sid !== id))
          toast.success("Strategy deleted successfully.", {
            style: TOAST_STYLE.success,
          })
        } catch (e: unknown) {
          const message =
            e instanceof ApiError
              ? e.friendlyMessage
              : (e as Error).message || "Unknown error"
          toast.error("Could not delete the strategy: " + message, {
            style: TOAST_STYLE.error,
          })
        }
      }
    },
    [removeStrategy]
  )

  const handleAddStrategy = useCallback(() => {
    setEditingStrategyId(null)
    setIsDialogOpen(true)
  }, [])

  function updatePayoff(key: keyof Couts, value: number) {
    setPayoffs((prev) => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    const settingsElement = settingsRef.current
    if (!settingsElement) {
      return undefined
    }

    const updateSettingsHeight = () => {
      setSettingsHeight(settingsElement.offsetHeight)
    }

    updateSettingsHeight()

    const observer = new ResizeObserver(updateSettingsHeight)
    observer.observe(settingsElement)

    return () => {
      observer.disconnect()
    }
  }, [])

  async function handleSubmit() {
    if (selectedIds.length < 2) return
    const config: TournamentConfig = {
      strategies_ids: selectedIds,
      nb_iterations: nbIterations,
      payoffs,
    }
    const pendingTournoi: Tournoi = {
      id: "tournoi-en-calcul",
      nom: `Tournament - ${selectedIds.length} strategies`,
      parties: [],
      nb_iterations: nbIterations,
      couts: payoffs,
      date_creation: new Date().toLocaleDateString("fr-FR"),
      meilleure_strategie: "",
      strategies: selectedStrategies,
      resultats: {},
      scores_totaux: {},
    }

    setIsLoading(true)
    onTournamentCreating(pendingTournoi)
    try {
      const tournoi = await createTournament(config)
      toast.success("Tournament completed successfully!", {
        style: TOAST_STYLE.success,
      })
      await onTournamentCreated(tournoi)
    } catch (e: unknown) {
      const message =
        e instanceof ApiError
          ? e.friendlyMessage
          : (e as Error).message || "Unknown error"
      toast.error("Could not start the tournament: " + message, {
        style: TOAST_STYLE.error,
      })
      onTournamentCreationFailed()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-start gap-5">
      {/* ── Sélection des stratégies ── */}
      <section
        className="flex min-h-0 w-2/3 flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card p-4"
        style={
          settingsHeight
            ? { height: settingsHeight, maxHeight: settingsHeight }
            : undefined
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Select strategies
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {selectedIds.length}/{allStrategies.length} selected strateg
              {selectedIds.length === 1 ? "y" : "ies"}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddStrategy}
            className="cursor-pointer border-primary text-primary hover:bg-primary/10"
          >
            <Plus className="size-3.5" />
            Add a strategy
          </Button>
        </div>

        {/* Tags des stratégies sélectionnées */}
        {selectedStrategies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedStrategies.map((s) => (
              <SelectedTag key={s.id} strategie={s} onRemove={handleRemove} />
            ))}
          </div>
        )}

        <Separator />

        {/* Barre de recherche */}
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search for a strategy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full rounded-md border border-input bg-background py-1.5 pr-3 pl-8 text-sm",
              "placeholder:text-muted-foreground",
              "focus:border-ring focus:ring-2 focus:ring-ring/50 focus:outline-none",
              "transition-colors"
            )}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Liste des stratégies disponibles */}
        {availableStrategies.length > 0 ? (
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-2">
              {availableStrategies.map((s) => (
                <StrategyCard
                  key={s.id}
                  strategie={s}
                  onSelect={handleSelect}
                  onEdit={handleEditStrategy}
                  onDelete={handleDeleteStrategy}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="py-4 text-center text-xs text-muted-foreground">
            {allStrategies.length === selectedIds.length
              ? "All strategies are selected."
              : "No strategy matches your search."}
          </p>
        )}

        <div className="mt-2">
          <AddStrategyButton onClick={handleAddStrategy} />
        </div>
      </section>

      <div ref={settingsRef} className="flex w-1/3 flex-col gap-5">
        {/* ── Paramètres ── */}
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Settings</h2>

          {/* Nombre d'itérations */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="nb-iterations"
                className="text-xs font-medium text-foreground"
              >
                Number of iterations
              </label>
            </div>
            <input
              id="nb-iterations"
              type="number"
              min={1}
              max={10000}
              value={nbIterations}
              onChange={(e) =>
                setNbIterations(Math.max(1, Number(e.target.value)))
              }
              className={cn(
                "w-full rounded-md border border-input bg-background px-3 py-1.5 font-mono text-sm",
                "focus:border-ring focus:ring-2 focus:ring-ring/50 focus:outline-none",
                "[appearance:textfield] transition-colors [&::-webkit-inner-spin-button]:appearance-none"
              )}
            />
            <p className="text-[11px] text-muted-foreground">
              Rounds played for each pair of strategies.
            </p>
          </div>
        </section>

        {/* ── Configuration des coûts ── */}
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Payoff configuration
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Dilemma payoff matrix
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <PayoffInput
              label="Temptation"
              sublabel="I betray, they cooperate"
              value={payoffs.tentation}
              onChange={(v) => updatePayoff("tentation", v)}
            />
            <PayoffInput
              label="Reward"
              sublabel="Mutual cooperation"
              value={payoffs.recompense}
              onChange={(v) => updatePayoff("recompense", v)}
            />
            <PayoffInput
              label="Punishment"
              sublabel="Mutual betrayal"
              value={payoffs.punition}
              onChange={(v) => updatePayoff("punition", v)}
            />
            <PayoffInput
              label="Sucker"
              sublabel="I cooperate, they betray"
              value={payoffs.dupe}
              onChange={(v) => updatePayoff("dupe", v)}
            />
          </div>

          <PayoffMatrix payoffs={payoffs} />
        </section>

        {/* ── Lancer le tournoi ── */}
        <Button
          onClick={handleSubmit}
          disabled={selectedIds.length < 2 || isLoading}
          size="lg"
          className="w-full gap-2 font-semibold"
        >
          <Play className="size-4" />
          {isLoading ? "Starting..." : "Start tournament"}
        </Button>
      </div>

      <StrategyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        strategyId={editingStrategyId}
        onSave={loadStrategies}
      />
    </div>
  )
}
