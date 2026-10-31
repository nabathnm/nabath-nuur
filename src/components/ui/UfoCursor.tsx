import Ufo from "@/components/svg/Ufo"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion"
import { useEffect, useState } from "react"

export default function UfoCursor() {
  const [isVisible, setIsVisible] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isHoveringClickable, setIsHoveringClickable] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  const reduceMotion = useReducedMotion()

  // Posisi mouse mentah
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  // Spring physics untuk pergerakan mulus & berbobot (inertia pesawat luar angkasa)
  const springConfig = { damping: 28, stiffness: 220, mass: 0.55 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  // Efek banking (kemiringan pesawat ke kiri/kanan saat bermanuver)
  const rotateZ = useTransform(smoothX, (currentX) => {
    const deltaX = mouseX.get() - currentX
    return Math.max(-22, Math.min(22, deltaX * 0.42))
  })

  // Efek pitch (sedikit mendongak/menukik saat kursor bergerak vertikal)
  const rotateX = useTransform(smoothY, (currentY) => {
    const deltaY = mouseY.get() - currentY
    return Math.max(-12, Math.min(12, -deltaY * 0.25))
  })

  useEffect(() => {
    // Cek apakah perangkat layar sentuh tanpa mouse presisi
    const touchMedia = window.matchMedia("(pointer: coarse)")
    const handleTouchChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsTouchDevice(e.matches)
    }
    handleTouchChange(touchMedia)
    touchMedia.addEventListener("change", handleTouchChange)

    const handleMouseMove = (e: MouseEvent) => {
      // Offset UFO melayang di sisi kanan atas kursor agar tidak menghalangi titik klik
      mouseX.set(e.clientX - 55)
      mouseY.set(e.clientY - 55)

      if (!isVisible) setIsVisible(true)

      // Cek apakah sedang hover di atas elemen interaktif (tombol, tautan, input)
      const target = e.target as HTMLElement | null
      if (target) {
        const isClickable = Boolean(
          target.closest("a, button, [role='button'], input, textarea, select")
        )
        setIsHoveringClickable(isClickable)
      }
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      touchMedia.removeEventListener("change", handleTouchChange)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [mouseX, mouseY, isVisible])

  // Jangan render jika preferensi reduced motion aktif atau di perangkat sentuh murni
  if (reduceMotion || isTouchDevice) return null

  return (
    <motion.div
      aria-hidden="true"
      style={{
        x: smoothX,
        y: smoothY,
        rotateZ,
        rotateX,
      }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isClicking ? 0.9 : isHoveringClickable ? 1.15 : 1,
      }}
      transition={{
        opacity: { duration: 0.25 },
        scale: { type: "spring", stiffness: 450, damping: 25 },
      }}
      className="pointer-events-none fixed top-0 left-0 z-40 hidden select-none md:block will-change-transform"
    >
      {/* Container dengan animasi melayang (ambient floating bob) */}
      <motion.div
        animate={{
          y: [-3, 3, -3],
          rotate: [-1, 1, -1],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >
        {/* Glow ambient cyan pendorong / mesin UFO */}
        <div
          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-8 w-12 rounded-full blur-md transition-opacity duration-300 pointer-events-none ${
            isHoveringClickable
              ? "bg-[#88C0D0]/50 scale-125"
              : "bg-[#88C0D0]/25"
          }`}
        />

        {/* Vektor UFO */}
        <Ufo className="h-auto w-18 drop-shadow-[0_4px_16px_rgba(136,192,208,0.22)]" />
      </motion.div>
    </motion.div>
  )
}

