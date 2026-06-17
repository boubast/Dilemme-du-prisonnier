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

function formatRhaiScriptForEditor(script: string) {
  const source = script.replace(/\r\n?/g, "\n").trim()
  let formatted: string = ""
  let indentLevel: number = 0
  let lineHasContent: boolean = false
  let quote: '"' | "'" | null = null
  let escaped: boolean = false
  let inLineComment: boolean = false
  let inBlockComment: boolean = false

  if (!source) {
    return ""
  }

  const writeIndent = () => {
    if (!lineHasContent) {
      formatted += "    ".repeat(indentLevel)
      lineHasContent = true
    }
  }

  const write = (char: string) => {
    writeIndent()
    formatted += char
  }

  const newline = () => {
    formatted = formatted.trimEnd()
    if (!formatted.endsWith("\n")) {
      formatted += "\n"
    }
    lineHasContent = false
  }

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i]
    const nextChar = source[i + 1]

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false
        newline()
      } else {
        write(char)
      }
      continue
    }

    if (inBlockComment) {
      write(char)
      if (char === "*" && nextChar === "/") {
        write(nextChar)
        i += 1
        inBlockComment = false
      }
      continue
    }

    if (quote) {
      write(char)
      if (escaped) {
        escaped = false
      } else if (char === "\\") {
        escaped = true
      } else if (char === quote) {
        quote = null
      }
      continue
    }

    if (char === "/" && nextChar === "/") {
      write(char)
      write(nextChar)
      i += 1
      inLineComment = true
      continue
    }

    if (char === "/" && nextChar === "*") {
      write(char)
      write(nextChar)
      i += 1
      inBlockComment = true
      continue
    }

    if (char === "\"" || char === "'") {
      quote = char
      write(char)
      continue
    }

    if (char === "\n") {
      newline()
      continue
    }

    if (char === "}") {
      if (lineHasContent) {
        newline()
      }
      indentLevel = Math.max(0, indentLevel - 1)
      write(char)
      continue
    }

    if (char === "{") {
      write(char)
      indentLevel += 1
      newline()
      continue
    }

    if (char === ";") {
      write(char)
      newline()
      continue
    }

    if (!lineHasContent && /\s/.test(char)) {
      continue
    }

    write(char)
  }

  return formatted.trim()
}

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
            setScriptRhai(formatRhaiScriptForEditor(s.script_rhai))
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
  const save = useCallback(async (): Promise<void> => {
    if (!nom.trim() || !explication.trim() || !scriptRhai.trim()) {
      throw new Error("Veuillez remplir tous les champs obligatoires.")
    }

    setLoading(true)
    const payload = {
      nom: nom.trim(),
      explication: explication.trim(),
      script_rhai: scriptRhai.trim(),
    }

    try {
      if (strategyId) {
        await editStrategy(strategyId, payload)
      } else {
        await addStrategy(payload)
      }
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
