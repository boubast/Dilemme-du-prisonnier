import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

const DARK_QUERY = "(prefers-color-scheme: dark)"

function getSystemTheme() {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light"
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">(() =>
    getSystemTheme()
  )

  useEffect(() => {
    if (theme !== "system") {
      return undefined
    }

    const mediaQuery = window.matchMedia(DARK_QUERY)
    const handleChange = () => setSystemTheme(getSystemTheme())

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme])

  const resolvedTheme = theme === "system" ? systemTheme : theme
  const isDark = resolvedTheme === "dark"

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Activer le thème clair" : "Activer le thème sombre"}
      title={isDark ? "Thème clair" : "Thème sombre"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
