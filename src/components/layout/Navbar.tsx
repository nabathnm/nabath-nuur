import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { useLenis } from "@/lib/lenis"
import Glass from "@/components/ui/glass"

const navItems = [
  { name: "About", href: "#about" },
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

  // Handle scroll effects & active section detection via IntersectionObserver
  useEffect(() => {
    // Use Lenis scroll event when available, fallback to window scroll
    function handleScroll({ scroll }: { scroll: number }) {
      setScrolled(scroll > 20)
    }

    if (lenis) {
      lenis.on("scroll", handleScroll)
    } else {
      const fallback = () => setScrolled(window.scrollY > 20)
      window.addEventListener("scroll", fallback)
      return () => window.removeEventListener("scroll", fallback)
    }

    const sections = document.querySelectorAll("section[id], footer[id]")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-20% 0px -60% 0px",
      }
    )

    sections.forEach((section) => observer.observe(section))

    return () => {
      if (lenis) lenis.off("scroll", handleScroll)
      observer.disconnect()
    }
  }, [lenis])

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault()
    const targetId = href.replace("#", "")
    const element = document.getElementById(targetId)
    if (element) {
      if (lenis) {
        lenis.scrollTo(element, {
          offset: -80, // Kompensasi tinggi navbar fixed
          duration: 1.4,
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

        {/* Logo */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="relative z-10 text-base font-bold tracking-wider text-white transition hover:text-white/80"
        >
          Nabath<span className="text-white/40">.</span>
        </a>

        {/* Desktop Links */}
        <div className="relative z-10 hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = activeSection === item.href.replace("#", "")
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.name}
              </a>
            )
          })}
        </div>

        {/* Right CTA / Mobile Toggle */}
        <div className="relative z-10 flex items-center gap-3">

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
                  className={`rounded-2xl px-5 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.name}
                </a>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
