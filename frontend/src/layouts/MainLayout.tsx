import { NavLink, Outlet } from "react-router-dom"
import { ThemeToggle } from "@/components/theme-toggle"

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:px-8">
          {/* Logo / Brand */}
          <NavLink
            to="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground transition-colors hover:text-primary"
          >
            Prisoner's Dilemma
          </NavLink>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6 md:px-8 md:py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
