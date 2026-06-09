import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Strategy from "./pages/Strategy"
import NotFound from "./pages/NotFound"

export function App() {
  return (
    <Routes>
      <Route path="*" element={<NotFound />} />
      <Route path="/" element={<Home />} />
      <Route path="/strategy" element={<Strategy />} />
    </Routes>
  )
}

export default App
