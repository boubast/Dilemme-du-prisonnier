import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Strategy from "./pages/Strategy"
import NotFound from "./pages/NotFound"
import MainLayout from "./layouts/MainLayout"

export function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/strategy" element={<Strategy />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
