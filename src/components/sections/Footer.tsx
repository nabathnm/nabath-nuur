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
      className="relative mt-20 overflow-hidden border-t border-white/10 bg-transparent text-white"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[1600px] px-6 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
        {/* Main Footer */}
        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2">
          {/* Identity */}
          <div>
            <p className="mb-3 text-white text-2xl font-bold">I'm Nabath Nuur</p>
            <p className="mt-5 max-w-md text-4xl font-bold text-white/60">
             Let's create something amazing together.
            </p>
          </div>

          {/* Contact */}
          <div className="md:justify-self-end">
            <p className="mb-4 text-sm text-white/50">Get in touch</p>

            

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
            <a
              href="mailto:muhammadnabathnuur@email.com"
              className="group inline-flex items-center gap-2 text-lg font-medium transition hover:text-white/70 pt-4"
            >
              muhammadnabathnuur@email.com
            </a>
          </div>
        </div>

        {/* Divider */}

        {/* Bottom */}
        <div className="flex flex-col justify-between gap-4 text-xs text-black md:flex-row bg-white pt-20">
          <p>© {new Date().getFullYear()} Nabath Nuur. All rights reserved.</p>

          <p>Designed & built with React + TypeScript</p>
        </div>
      </div>
    </footer>
  )
}
