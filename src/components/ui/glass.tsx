type Rounded =
  | "rounded-none"
  | "rounded-sm"
  | "rounded-md"
  | "rounded-lg"
  | "rounded-xl"
  | "rounded-2xl"
  | "rounded-3xl"
  | "rounded-full"

interface GlassProps {
  rounded?: Rounded | (string & {})
}

export default function Glass({ rounded = "rounded-2xl" }: GlassProps) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Outline highlight — hanya nyala di border, fokus top-left */}
      <div
        className={`pointer-events-none absolute inset-0 ${rounded}`}
        style={{
          padding: 0.5, // ketebalan "garis" outline
          background: `linear-gradient(
                        140deg,
                        rgba(255,255,255,0.55) 0%,
                        rgba(255,255,255,0.20) 25%,
                        rgba(255,255,255,0.00) 55%
                    )`,
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Specular blob — titik cahaya kecil di pojok, tetap dipertahankan */}
      {/* <div
                className={`pointer-events-none absolute inset-0 ${rounded}`}
                style={{
                    background: `radial-gradient(
                        circle at 10% 8%,
                        rgba(255,255,255,0.22) 0%,
                        rgba(255,255,255,0.00) 16%
                    )`,
                    filter: "blur(10px)",
                    mixBlendMode: "screen",
                }}
            /> */}

      {/* Bevel tepi — kedalaman kaca */}
      <div
        className={`pointer-events-none absolute inset-0 ${rounded}`}
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 2px rgba(0,0,0,0.35)",
        }}
      />

      {/* Noise */}
      <div
        className={`pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay ${rounded}`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}
