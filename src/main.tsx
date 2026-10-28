import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { LenisProvider } from "@/lib/lenis.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <LenisProvider>
        <App />
      </LenisProvider>
    </ThemeProvider>
  </StrictMode>
)
