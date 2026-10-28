import Lenis from "lenis"
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

/* -------------------------------------------------------
   Context
------------------------------------------------------- */

const LenisContext = createContext<Lenis | null>(null)

/** Retrieve the Lenis instance from any child component. */
export function useLenis() {
  return useContext(LenisContext)
}

/* -------------------------------------------------------
   Provider
------------------------------------------------------- */

interface LenisProviderProps {
  children: ReactNode
}

export function LenisProvider({ children }: LenisProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    })

    setLenis(instance)

    function raf(time: number) {
      instance.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }

    rafRef.current = requestAnimationFrame(raf)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  )
}
