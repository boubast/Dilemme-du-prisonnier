import { Outlet } from "react-router-dom"

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8">
      <main className="mx-auto max-w-7xl">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
