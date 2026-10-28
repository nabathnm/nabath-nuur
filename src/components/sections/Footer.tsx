import { Code2, Mail, ArrowUpRight } from "lucide-react"

export default function Footer() {
  const socials = [
    {
      name: "GitHub",
      href: "https://github.com/",
      icon: Code2,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/",
      icon: Mail,
    },
    {
      name: "Email",
      href: "mailto:your@email.com",
      icon: Mail,
    },
  ]

  return (
    <footer
      id="contact"
      className="relative mt-20 overflow-hidden border-t border-white/10 bg-transparent text-white scroll-mt-28"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-8 py-16">
        {/* Main Footer */}
        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2">
          {/* Identity */}
          <div>
            <p className="mb-3 text-sm text-white/50">Let's build something</p>

            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Together.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60">
              I'm an Information Technology student interested in building web
              and mobile applications with modern technologies.
            </p>
          </div>

          {/* Contact */}
          <div className="md:justify-self-end">
            <p className="mb-4 text-sm text-white/50">Get in touch</p>

            <a
              href="mailto:your@email.com"
              className="group inline-flex items-center gap-2 text-lg font-medium transition hover:text-white/70"
            >
              your@email.com
              <ArrowUpRight
                size={18}
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </a>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">
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
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                  >
                    <Icon size={18} />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-white/10" />

        {/* Bottom */}
        <div className="flex flex-col justify-between gap-4 text-xs text-white/40 md:flex-row">
          <p>© {new Date().getFullYear()} Nabath Nuur. All rights reserved.</p>

          <p>Designed & built with React + TypeScript</p>
        </div>
      </div>
    </footer>
  )
}
