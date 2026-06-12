/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { Strategie } from "@/type"
import {
  fetchStrategies,
  fetchStrategyById,
  createStrategy,
  updateStrategy,
  deleteStrategy,
} from "@/api/strategies"

export function useStrategy(
  autoLoadList = false,
  strategyId: string | null = null,
  open = false
) {
  const [strategies, setStrategies] = useState<Strategie[]>([])
  const [loading, setLoading] = useState(false)

  // États du formulaire
  const [nom, setNom] = useState("")
  const [explication, setExplication] = useState("")
  const [scriptRhai, setScriptRhai] = useState("")

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const list = await fetchStrategies()
      setStrategies(list)
    } catch (e) {
      console.error("Erreur lors de la récupération des stratégies :", e)
    } finally {
      setLoading(false)
    }
  }, [])

  // Charge la liste complète si requis
  useEffect(() => {
    if (autoLoadList) {
      reload()
    }
  }, [autoLoadList, reload])

  // Charge les détails d'une stratégie pour l'édition et réinitialise en mode ajout
  useEffect(() => {
    if (!open) return

    if (strategyId) {
      const loadStrategy = async () => {
        setLoading(true)
        try {
          const s = await fetchStrategyById(strategyId)
          if (s) {
            setNom(s.nom)
            setExplication(s.explication)
            setScriptRhai(s.script_rhai)
          }
        } catch (error) {
          console.error("Erreur lors du chargement de la stratégie :", error)
        } finally {
          setLoading(false)
        }
      }
      loadStrategy()
    } else {
      setNom("")
      setExplication("")
      setScriptRhai("")
    }
  }, [open, strategyId])

  const addStrategy = useCallback(
    async (strategy: Omit<Strategie, "id">) => {
      const newStrat = await createStrategy(strategy)
      if (autoLoadList) {
        await reload()
      }
      return newStrat
    },
    [autoLoadList, reload]
  )

  const editStrategy = useCallback(
    async (id: string, strategy: Omit<Strategie, "id">) => {
      const updated = await updateStrategy(id, strategy)
      if (autoLoadList) {
        await reload()
      }
      return updated
    },
    [autoLoadList, reload]
  )

  const removeStrategy = useCallback(
    async (id: string) => {
      await deleteStrategy(id)
      if (autoLoadList) {
        await reload()
      }
    },
    [autoLoadList, reload]
  )

  // Sauvegarde (Création ou Mise à jour) basée sur l'état du formulaire
  const save = useCallback(async (): Promise<boolean> => {
    if (!nom.trim() || !explication.trim() || !scriptRhai.trim()) return false

    setLoading(true)
    const payload = {
      nom: nom.trim(),
      explication: explication.trim(),
      script_rhai: scriptRhai.trim(),
    }

    try {
      if (strategyId) {
        await editStrategy(strategyId, payload)
        return true
      }

      await addStrategy(payload)
      return true
    } catch (e) {
      console.error("Erreur lors de la sauvegarde :", e)
      return false
    } finally {
      setLoading(false)
    }
  }, [strategyId, nom, explication, scriptRhai, addStrategy, editStrategy])

  return {
    strategies,
    loading,
    reload,
    addStrategy,
    editStrategy,
    removeStrategy,
    // États du formulaire
    nom,
    setNom,
    explication,
    setExplication,
    scriptRhai,
    setScriptRhai: setScriptRhai as Dispatch<SetStateAction<string>>,
    save,
  }
}
