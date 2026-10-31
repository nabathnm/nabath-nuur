import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { useLenis } from "@/lib/lenis"
import Glass from "@/components/ui/glass"

const navItems = [
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Tools", href: "#tools" },
  { name: "Projects", href: "#projects" },
  { name: "Experiences", href: "#experiences" },
  { name: "Contact", href: "#contact" },
]

export default function Navbar() {
  const lenis = useLenis()
  const [activeSection, setActiveSection] = useState("home")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effects & active section detection
  useEffect(() => {
    function handleScroll({ scroll }: { scroll: number }) {
      const currentScroll = scroll ?? window.scrollY
      setScrolled(currentScroll > 20)

      // Jika user sudah berada di paling bawah dokumen, pilih Contact
      if (
        window.innerHeight + currentScroll >=
        document.documentElement.scrollHeight - 60
      ) {
        setActiveSection("contact")
        return
      }

      const sections = document.querySelectorAll<HTMLElement>("section[id], footer[id]")
      const scrollPosition = currentScroll + 200

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i]
        if (sec.offsetTop <= scrollPosition) {
          setActiveSection(sec.id)
          break
        }
      }
    }

    // Panggil sekali saat mount untuk sinkronisasi posisi awal
    handleScroll({ scroll: window.scrollY })

    if (lenis) {
      lenis.on("scroll", handleScroll)
    } else {
      const fallback = () => handleScroll({ scroll: window.scrollY })
      window.addEventListener("scroll", fallback)
      return () => window.removeEventListener("scroll", fallback)
    }

    return () => {
      if (lenis) lenis.off("scroll", handleScroll)
    }
  }, [lenis])

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault()
    const targetId = href.replace("#", "")
    setActiveSection(targetId)

    if (targetId === "home") {
      if (lenis) {
        lenis.scrollTo(0, {
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        })
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
      setMobileMenuOpen(false)
      return
    }

    const element = document.getElementById(targetId)
    if (element) {
      if (lenis) {
        lenis.scrollTo(element, {
          offset: 0,
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        })
      } else {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
    setMobileMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 md:px-8">
      <nav
        aria-label="Main Navigation"
        className={`relative mx-auto flex max-w-6xl items-center justify-between overflow-hidden rounded-full border border-white/15 px-6 py-3 transition-all duration-300 ${
          scrolled
            ? "bg-[#2E3440]/85 shadow-2xl backdrop-blur-2xl"
            : "bg-[#2E3440]/60 shadow-lg backdrop-blur-xl"
        }`}
      >
        <Glass rounded="rounded-full" />

        {/* Logo (Kiri) */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="relative z-10 text-base font-bold tracking-wider text-white transition hover:text-white/80"
        >
          Nabath<span className="text-white/40">.</span>
        </a>

        {/* Right Section (Kanan): Desktop Links & Mobile Menu Toggle */}
        <div className="relative z-10 flex items-center gap-3">
          {/* Desktop Links */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = activeSection === item.href.replace("#", "")
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 rounded-full bg-white/15 border border-white/10 shadow-sm backdrop-blur-sm"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{item.name}</span>
                </a>
              )
            })}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 md:hidden"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="relative mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl border border-white/15 bg-[#2E3440]/95 p-6 shadow-2xl backdrop-blur-2xl md:hidden">
          <Glass rounded="rounded-3xl" />
          <div className="relative z-10 flex flex-col gap-3">
            {navItems.map((item) => {
              const isActive = activeSection === item.href.replace("#", "")
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative rounded-2xl px-5 py-3 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-navbar-active-pill"
                      className="absolute inset-0 rounded-2xl bg-white/15 border border-white/10"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{item.name}</span>
                </a>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
