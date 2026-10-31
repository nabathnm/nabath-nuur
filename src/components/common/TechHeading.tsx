"use client"

import { useEffect, useRef } from "react"

/* =====================================================
   TECH HEADING
   Heading dengan overlay Canvas bernuansa "blueprint" Nord:
   - Intro   : scan bar menyapu teks; tiap huruf muncul dari wireframe
               (outline putus-putus) + titik-titik yang berkumpul, lalu solid.
   - Idle    : titik tepi huruf sangat samar.
   - Cursor  : outline & titik menyala di sekitar cursor, kata terdekat
               diberi reticle framing (sudut siku per kata).
   Teks DOM asli tetap dirender → SEO, selection, screen reader, dan layout
   tidak berubah. Canvas hanya overlay (pointer-events: none).
====================================================== */

const PAD = 20 // ruang canvas di luar heading (cukup kecil agar tidak overflow)
const REVEAL = 0.55 // detik per huruf untuk fade-in solid

export interface TechHeadingLine {
  text: string
  /** Kelas Tailwind untuk baris ini (mis. warna berbeda). */
  className?: string
}

export interface TechHeadingProps {
  lines: TechHeadingLine[]
  /** Elemen heading yang dirender. */
  as?: "h1" | "h2" | "h3" | "p" | "div"
  /** Kelas untuk elemen heading (tipografi). */
  className?: string
  /** Warna accent (hex). */
  accent?: string
  /** Jeda sebelum intro mulai (detik). */
  introDelay?: number
  /** Jeda antar huruf saat intro (detik). */
  charStagger?: number
  /** Radius pengaruh cursor (px). */
  radius?: number
  /** Matikan interaksi cursor. */
  interactive?: boolean
}

interface Glyph {
  el: HTMLElement
  ch: string
  font: string
  gx: number // kiri (koordinat canvas)
  gy: number // atas
  gw: number
  gh: number
  baseline: number
  cx: number
  cy: number
  line: number
  wordIndex: number
  start: number // detik
  r: number // progress reveal terakhir yang ditulis ke DOM
  prox: number // kedekatan cursor (0–1, dihaluskan)
}

interface WordBox {
  el: HTMLElement
  gx: number
  gy: number
  gw: number
  gh: number
  cx: number
  cy: number
  prox: number
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const smooth = (t: number) => {
  const c = clamp01(t)
  return c * c * (3 - 2 * c)
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  const n = parseInt(f, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export default function TechHeading({
  lines,
  as: Tag = "h1",
  className,
  accent = "#88C0D0",
  introDelay = 0.45,
  charStagger = 0.03,
  radius = 120,
  interactive = true,
}: TechHeadingProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return undefined

    const chars = Array.from(
      root.querySelectorAll<HTMLElement>("[data-tt-char]")
    )
    const wordEls = Array.from(
      root.querySelectorAll<HTMLElement>("[data-tt-word]")
    )
    const showAll = () =>
      chars.forEach((c) => {
        c.style.opacity = "1"
        c.style.filter = ""
      })

    // Reduced motion: teks langsung tampil, tanpa overlay animasi.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const ctx = canvas.getContext("2d")
    if (reduce || !ctx) {
      showAll()
      return undefined
    }

    const [ar, ag, ab] = hexToRgb(accent)
    const rgba = (a: number) => `rgba(${ar},${ag},${ab},${a.toFixed(3)})`

    let w = 0
    let h = 0
    let dpr = 1
    let glyphs: Glyph[] = []
    let words: WordBox[] = []
    let introDone = false
    let t0 = 0
    let raf = 0
    let running = false
    let disposed = false

    const pointer = { x: -9999, y: -9999, sx: -9999, sy: -9999, active: false }
    let pa = 0 // kekuatan pointer yang dihaluskan

    // Sembunyikan semua huruf sampai intro mencapainya.
    chars.forEach((c) => {
      c.style.opacity = "0"
      c.style.filter = "blur(6px)"
    })

    /* ---------- pengukuran & sampling ---------- */

    const measure = () => {
      const rootRect = root.getBoundingClientRect()
      w = rootRect.width
      h = rootRect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)

      const cw = Math.ceil(w + PAD * 2)
      const ch = Math.ceil(h + PAD * 2)
      canvas.width = cw * dpr
      canvas.height = ch * dpr
      canvas.style.width = `${cw}px`
      canvas.style.height = `${ch}px`

      // Ukur bounding box tiap kata
      words = wordEls.map((el) => {
        const r = el.getBoundingClientRect()
        const gx = r.left - rootRect.left + PAD
        const gy = r.top - rootRect.top + PAD
        return {
          el,
          gx,
          gy,
          gw: r.width,
          gh: r.height,
          cx: gx + r.width / 2,
          cy: gy + r.height / 2,
          prox: 0,
        }
      })

      let line = 0
      let prevBase = NaN
      glyphs = chars.map((el, i) => {
        const r = el.getBoundingClientRect()
        const cs = getComputedStyle(el)
        const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
        ctx.font = font
        const m = ctx.measureText("Mg")
        const descent = m.fontBoundingBoxDescent || r.height * 0.2
        const baseline = r.bottom - rootRect.top - descent + PAD
        if (!Number.isNaN(prevBase) && Math.abs(baseline - prevBase) > r.height * 0.5) {
          line += 1
        }
        prevBase = baseline

        const gx = r.left - rootRect.left + PAD
        const gy = r.top - rootRect.top + PAD
        const wordIndex = wordEls.findIndex((wel) => wel.contains(el))

        return {
          el,
          ch: el.textContent ?? "",
          font,
          gx,
          gy,
          gw: r.width,
          gh: r.height,
          baseline,
          cx: gx + r.width / 2,
          cy: gy + r.height / 2,
          line,
          wordIndex,
          start: introDelay + i * charStagger + line * 0.15,
          r: -1,
          prox: 0,
        }
      })
    }

    /* ---------- render ---------- */

    const frame = (now: number) => {
      raf = 0
      const time = (now - t0) / 1000
      const R = radius

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w + PAD * 2, h + PAD * 2)
      ctx.textBaseline = "alphabetic"
      ctx.textAlign = "left"

      // Pointer smoothing
      pa += ((pointer.active ? 1 : 0) - pa) * 0.12
      if (pointer.active) {
        pointer.sx += (pointer.x - pointer.sx) * 0.2
        pointer.sy += (pointer.y - pointer.sy) * 0.2
      }
      const sx = pointer.sx
      const sy = pointer.sy

      let anyProx = false
      let nearestWord = -1
      let nearestWordProx = 0.2

      for (let i = 0; i < words.length; i++) {
        const wb = words[i]
        // Jarak dari cursor ke bounding box kata (0 jika kursor berada di dalam kata)
        const dx = Math.max(wb.gx - sx, 0, sx - (wb.gx + wb.gw))
        const dy = Math.max(wb.gy - sy, 0, sy - (wb.gy + wb.gh))
        const dist = Math.hypot(dx, dy)

        const targetProx = pa > 0.01 ? smooth(1 - dist / R) * pa : 0
        wb.prox += (targetProx - wb.prox) * 0.18
        if (wb.prox > 0.01) anyProx = true
        if (wb.prox > nearestWordProx) {
          nearestWordProx = wb.prox
          nearestWord = i
        }
      }

      // Glyph: reveal DOM, outline, highlight
      for (let i = 0; i < glyphs.length; i++) {
        const g = glyphs[i]

        if (!introDone) {
          const r = clamp01((time - g.start) / REVEAL)
          if (r !== g.r) {
            g.r = r
            g.el.style.opacity = easeOut(r).toFixed(3)
            g.el.style.filter = r >= 1 ? "" : `blur(${((1 - r) * 6).toFixed(1)}px)`
          }
        }

        const wb = g.wordIndex >= 0 ? words[g.wordIndex] : null
        const targetProx =
          pa > 0.01
            ? Math.max(
                smooth(1 - Math.hypot(sx - g.cx, sy - g.cy) / R) * pa,
                wb ? wb.prox * 0.75 : 0
              )
            : 0
        g.prox += (targetProx - g.prox) * 0.16
        if (g.prox > 0.01) anyProx = true

        let oa = 0
        if (!introDone) {
          oa =
            time < g.start
              ? clamp01((time - (g.start - 0.45)) / 0.45) * 0.9
              : (1 - clamp01((time - g.start) / 0.8)) * 0.9
        }
        oa = Math.max(oa, g.prox * 0.75)

        if (oa > 0.02) {
          ctx.font = g.font
          ctx.lineWidth = 0.8
          ctx.setLineDash([2.5, 3.5])
          ctx.lineDashOffset = -time * 8
          ctx.strokeStyle = rgba(oa)
          ctx.strokeText(g.ch, g.gx, g.baseline)
          ctx.setLineDash([])
        }

        if (g.prox > 0.04) {
          ctx.font = g.font
          ctx.fillStyle = rgba(g.prox * 0.45)
          ctx.fillText(g.ch, g.gx, g.baseline)
        }
      }

      // Reticle pada kata terdekat dengan cursor (framing per kata)
      if (nearestWord >= 0) {
        const wb = words[nearestWord]
        const L = Math.min(10, Math.max(6, wb.gh * 0.22))
        const padX = 4
        const padY = 2
        const x0 = wb.gx - padX
        const y0 = wb.gy + padY
        const x1 = wb.gx + wb.gw + padX
        const y1 = wb.gy + wb.gh - padY
        ctx.strokeStyle = rgba(wb.prox * 0.75)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x0, y0 + L); ctx.lineTo(x0, y0); ctx.lineTo(x0 + L, y0)
        ctx.moveTo(x1 - L, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + L)
        ctx.moveTo(x0, y1 - L); ctx.lineTo(x0, y1); ctx.lineTo(x0 + L, y1)
        ctx.moveTo(x1 - L, y1); ctx.lineTo(x1, y1); ctx.lineTo(x1, y1 - L)
        ctx.stroke()
      }

      // Scan bar (hanya saat intro)
      if (!introDone && glyphs.length > 0) {
        const last = glyphs[glyphs.length - 1]
        let k = -1
        for (let i = 0; i < glyphs.length; i++) {
          if (glyphs[i].start <= time) k = i
          else break
        }

        let bx = glyphs[0].gx
        let g0 = glyphs[0]
        let alpha = clamp01((time - (glyphs[0].start - 0.3)) / 0.3)
        if (k >= 0) {
          g0 = glyphs[k]
          const n = glyphs[k + 1]
          if (n) {
            const f = clamp01((time - g0.start) / Math.max(n.start - g0.start, 0.001))
            if (n.line === g0.line) {
              bx = g0.gx + (n.gx - g0.gx) * f
              alpha = 1
            } else {
              bx = g0.gx + g0.gw
              alpha = 1 - f
            }
          } else {
            bx = g0.gx + g0.gw
            alpha = 1 - clamp01((time - g0.start - 0.3) / 0.5)
          }
        }

        if (alpha > 0.02) {
          const y0 = g0.gy - 2
          const y1 = g0.gy + g0.gh + 2
          const lg = ctx.createLinearGradient(0, y0, 0, y1)
          lg.addColorStop(0, rgba(0))
          lg.addColorStop(0.5, rgba(1))
          lg.addColorStop(1, rgba(0))
          ctx.save()
          ctx.globalAlpha = alpha
          ctx.shadowColor = rgba(0.9)
          ctx.shadowBlur = 12
          ctx.fillStyle = lg
          ctx.fillRect(bx - 0.75, y0, 1.5, y1 - y0)
          ctx.shadowBlur = 0
          ctx.fillStyle = accent
          ctx.fillRect(bx - 4, y0 + 2, 8, 1)
          ctx.fillRect(bx - 4, y1 - 3, 8, 1)
          ctx.restore()
        }

        if (time > last.start + REVEAL + 0.3) {
          introDone = true
          showAll()
        }
      }

      const keepGoing = !introDone || pointer.active || pa > 0.01 || anyProx
      if (keepGoing && !disposed) {
        raf = requestAnimationFrame(frame)
      } else {
        running = false
      }
    }

    const kick = () => {
      if (running || disposed) return
      running = true
      raf = requestAnimationFrame(frame)
    }

    /* ---------- interaksi ---------- */

    const onMove = (e: PointerEvent) => {
      const rr = root.getBoundingClientRect()
      const dx = Math.max(rr.left - e.clientX, 0, e.clientX - rr.right)
      const dy = Math.max(rr.top - e.clientY, 0, e.clientY - rr.bottom)
      const near = Math.hypot(dx, dy) < radius
      const x = e.clientX - rr.left + PAD
      const y = e.clientY - rr.top + PAD

      if (near && !pointer.active) {
        pointer.sx = x
        pointer.sy = y
      }
      pointer.x = x
      pointer.y = y
      pointer.active = near
      if (near) kick()
    }
    const onLeave = () => {
      pointer.active = false
      kick()
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") onLeave()
    }

    if (interactive) {
      window.addEventListener("pointermove", onMove, { passive: true })
      window.addEventListener("pointerup", onUp, { passive: true })
      window.addEventListener("pointercancel", onUp, { passive: true })
      document.documentElement.addEventListener("pointerleave", onLeave)
    }

    let lastW = 0
    let lastH = 0
    const observer = new ResizeObserver(() => {
      const rr = root.getBoundingClientRect()
      if (Math.abs(rr.width - lastW) < 0.5 && Math.abs(rr.height - lastH) < 0.5) return
      lastW = rr.width
      lastH = rr.height
      if (t0 === 0) return // belum mulai (menunggu font)
      measure()
      kick()
    })
    observer.observe(root)

    // Mulai setelah font siap agar ukuran huruf akurat.
    const start = () => {
      if (disposed) return
      const rr = root.getBoundingClientRect()
      lastW = rr.width
      lastH = rr.height
      measure()
      t0 = performance.now()
      kick()
    }
    if (document.fonts && document.fonts.ready) {
      void document.fonts.ready.then(start)
    } else {
      start()
    }

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
      document.documentElement.removeEventListener("pointerleave", onLeave)
    }
  }, [accent, introDelay, charStagger, radius, interactive])

  return (
    <div ref={rootRef} className="relative">
      <Tag className={className}>
        {lines.map((line, li) => {
          const words = line.text.split(" ")
          return (
            <span key={li} className={`block ${line.className ?? ""}`}>
              {/* Teks utuh untuk screen reader */}
              <span className="sr-only">{line.text}</span>

              <span aria-hidden="true">
                {words.map((word, wi) => (
                  <span key={wi} className="inline">
                    <span data-tt-word="" className="inline-block">
                      {Array.from(word).map((ch, ci) => (
                        <span
                          key={ci}
                          data-tt-char=""
                          className="motion-safe:opacity-0"
                        >
                          {ch}
                        </span>
                      ))}
                    </span>
                    {wi < words.length - 1 ? " " : ""}
                  </span>
                ))}
              </span>
            </span>
          )
        })}
      </Tag>

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ left: -PAD, top: -PAD }}
      />
    </div>
  )
}