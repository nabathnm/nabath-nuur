import { Mail } from "lucide-react"

/* =====================================================
   BRAND ICONS (feather / lucide standard SVG paths)
====================================================== */

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

export default function Footer() {
  const socials = [
    {
      name: "GitHub",
      href: "https://github.com/",
      icon: GithubIcon,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/",
      icon: LinkedinIcon,
    },
    {
      name: "Instagram",
      href: "https://instagram.com/",
      icon: InstagramIcon,
    },
    {
      name: "Email",
      href: "mailto:muhammadnabathnuur@email.com",
      icon: Mail,
    },
  ]

  return (
    <footer
      id="contact"
      className="relative mt-24 overflow-hidden border-t border-white/10 bg-transparent text-white pt-16 md:mt-32 md:pt-20 lg:mt-10 lg:pt-6 pb-10"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#88C0D0]/10 blur-3xl" />

      {/* Main Footer Container with consistent padding across all viewports */}
      <div className="relative mx-auto w-full max-w-[1600px] px-6 md:px-8 lg:px-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Identity (Left) */}
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-[#88C0D0]">
                I&apos;m Nabath Nuur
              </p>
              <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-3xl lg:text-3xl">
                Let&apos;s create something amazing together.{" "}
              </h2>
            </div>
          </div>

          {/* Contact & Socials (Right) */}
          <div className="flex flex-col gap-8 lg:col-span-5 lg:items-end lg:text-right">
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
                Get in touch
              </p>
            </div>

            {/* Social Links */}
            <div>
            
              <div className="flex items-center gap-3">
                {socials.map((social) => {
                  const Icon = social.icon

                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target={social.name !== "Email" ? "_blank" : undefined}
                      rel={
                        social.name !== "Email"
                          ? "noopener noreferrer"
                          : undefined
                      }
                      aria-label={social.name}
                      title={social.name}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#88C0D0]/50 hover:bg-[#88C0D0]/10 hover:text-white"
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Divider (Minimalis) */}
        <div className="mt-8 md:mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Bottom Bar */}
        <div className="mt-5 flex flex-col items-center justify-between gap-3 text-xs text-white/40 sm:flex-row pb-2">
          <p>© {new Date().getFullYear()} Nabath Nuur. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Designed &amp; built with React + TypeScript
          </p>
        </div>
      </div>
    </footer>
  )
}
