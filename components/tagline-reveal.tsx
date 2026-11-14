"use client"

import { useEffect, useRef } from "react"

const TAGLINE =
  "Every balance you sign off on deserves proof. Not a screenshot someone took. A sealed record no one can quietly change."

const DIM_OPACITY = 0.15

export function TaglineReveal() {
  const sectionRef = useRef<HTMLElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const words = TAGLINE.split(" ")

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0

    const update = () => {
      frame = 0
      if (reduceMotion.matches) {
        wordRefs.current.forEach((el) => el && (el.style.opacity = "1"))
        return
      }
      const rect = section.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      const progress = scrollable > 0 ? Math.min(Math.max(-rect.top / scrollable, 0), 1) : 1
      const revealed = progress * words.length
      wordRefs.current.forEach((el, i) => {
        if (!el) return
        const amount = Math.min(Math.max(revealed - i, 0), 1)
        el.style.opacity = String(DIM_OPACITY + (1 - DIM_OPACITY) * amount)
      })
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    reduceMotion.addEventListener("change", onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      reduceMotion.removeEventListener("change", onScroll)
    }
  }, [words.length])

  return (
    <section ref={sectionRef} aria-label="Why ChainSnip" className="relative h-[250vh] border-b border-border">
      <div className="sticky top-0 flex h-svh items-center">
        <div className="container mx-auto px-4">
          <p className="mx-auto max-w-6xl text-4xl sm:text-6xl lg:text-7xl text-foreground uppercase text-balance">
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                ref={(el) => {
                  wordRefs.current[i] = el
                }}
                className="transition-opacity duration-150 motion-reduce:transition-none"
                style={{ opacity: DIM_OPACITY }}
              >
                {word}
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  )
}
