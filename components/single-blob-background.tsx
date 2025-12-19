"use client"

import { useEffect, useRef } from "react"

interface Beam {
  x: number
  y: number
  length: number
  angle: number
  speed: number
  width: number
  opacity: number
  hue: number
  delay: number
}

export default function SingleBlobBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const beamsRef = useRef<Beam[]>([])
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Colors matching the zinc-950 aesthetic
    const colors = {
      bg: "#09090b",
      primary: { r: 0, g: 121, b: 218 }, // #0079da
      accent: { r: 16, g: 185, b: 129 }, // emerald
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initBeams()
    }

    const initBeams = () => {
      const beams: Beam[] = []
      const beamCount = 12

      for (let i = 0; i < beamCount; i++) {
        beams.push(createBeam(i, beamCount))
      }
      beamsRef.current = beams
    }

    const createBeam = (index: number, total: number): Beam => {
      const isFromTop = index % 2 === 0
      const spreadX = canvas.width * 1.5
      const startX = -canvas.width * 0.25 + (spreadX / total) * index + Math.random() * 100 - 50

      return {
        x: startX,
        y: isFromTop ? -100 : canvas.height + 100,
        length: canvas.height * (0.6 + Math.random() * 0.5),
        angle: isFromTop
          ? Math.PI / 2 + (Math.random() - 0.5) * 0.4 // Downward with slight variation
          : -Math.PI / 2 + (Math.random() - 0.5) * 0.4, // Upward with slight variation
        speed: 0.3 + Math.random() * 0.4,
        width: 80 + Math.random() * 120,
        opacity: 0.03 + Math.random() * 0.04,
        hue: Math.random() > 0.7 ? 1 : 0, // 0 = primary blue, 1 = emerald
        delay: index * 400 + Math.random() * 600,
      }
    }

    const drawBackground = () => {
      // Solid dark background
      ctx.fillStyle = colors.bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Subtle radial gradient overlay
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.8,
      )
      gradient.addColorStop(0, "rgba(0, 121, 218, 0.03)")
      gradient.addColorStop(0.5, "rgba(0, 121, 218, 0.01)")
      gradient.addColorStop(1, "transparent")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const drawBeam = (beam: Beam, time: number) => {
      // Check if beam should be active based on delay
      const activeTime = time - beam.delay
      if (activeTime < 0) return

      // Calculate animated position along beam path
      const cycleTime = 8000 // Time for one full cycle
      const progress = (activeTime % cycleTime) / cycleTime

      // Ease in-out for smooth movement
      const easedProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

      const moveDistance = beam.length * 2
      const currentOffset = easedProgress * moveDistance - beam.length

      // Calculate beam position
      const dx = Math.cos(beam.angle)
      const dy = Math.sin(beam.angle)

      const startX = beam.x + dx * currentOffset
      const startY = beam.y + dy * currentOffset
      const endX = startX + dx * beam.length
      const endY = startY + dy * beam.length

      // Create gradient along beam
      const gradient = ctx.createLinearGradient(startX, startY, endX, endY)

      const color = beam.hue === 0 ? colors.primary : colors.accent
      const baseOpacity = beam.opacity * (0.7 + Math.sin(time * 0.001 + beam.delay) * 0.3)

      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)
      gradient.addColorStop(0.2, `rgba(${color.r}, ${color.g}, ${color.b}, ${baseOpacity * 0.5})`)
      gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${baseOpacity})`)
      gradient.addColorStop(0.8, `rgba(${color.r}, ${color.g}, ${color.b}, ${baseOpacity * 0.5})`)
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)

      // Draw beam with blur effect
      ctx.save()
      ctx.globalCompositeOperation = "screen"

      // Draw multiple passes for glow effect
      for (let i = 3; i >= 0; i--) {
        const width = beam.width * (1 + i * 0.5)
        const alpha = i === 0 ? 1 : 0.3

        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.moveTo(startX - (dy * width) / 2, startY + (dx * width) / 2)
        ctx.lineTo(endX - (dy * width) / 2, endY + (dx * width) / 2)
        ctx.lineTo(endX + (dy * width) / 2, endY - (dx * width) / 2)
        ctx.lineTo(startX + (dy * width) / 2, startY - (dx * width) / 2)
        ctx.closePath()
        ctx.fillStyle = gradient
        ctx.fill()
      }

      ctx.restore()
    }

    const drawGrid = (time: number) => {
      ctx.save()
      ctx.globalAlpha = 0.03

      // Horizontal lines
      const lineSpacing = 80
      const offset = (time * 0.02) % lineSpacing

      ctx.strokeStyle = `rgba(${colors.primary.r}, ${colors.primary.g}, ${colors.primary.b}, 0.3)`
      ctx.lineWidth = 1

      for (let y = -lineSpacing + offset; y < canvas.height + lineSpacing; y += lineSpacing) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Vertical lines (slower movement)
      const vOffset = (time * 0.01) % lineSpacing

      for (let x = -lineSpacing + vOffset; x < canvas.width + lineSpacing; x += lineSpacing) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      ctx.restore()
    }

    const drawParticles = (time: number) => {
      ctx.save()

      // Floating particles along beam paths
      const particleCount = 30
      for (let i = 0; i < particleCount; i++) {
        const seed = i * 12345.6789
        const x = (seed + time * 0.02) % canvas.width
        const y = (seed * 1.5 + time * 0.015) % canvas.height
        const size = 1 + (Math.sin(seed) + 1) * 1.5
        const opacity = 0.1 + (Math.sin(time * 0.002 + seed) + 1) * 0.15

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
        gradient.addColorStop(0, `rgba(${colors.primary.r}, ${colors.primary.g}, ${colors.primary.b}, ${opacity})`)
        gradient.addColorStop(
          0.5,
          `rgba(${colors.primary.r}, ${colors.primary.g}, ${colors.primary.b}, ${opacity * 0.3})`,
        )
        gradient.addColorStop(1, "transparent")

        ctx.beginPath()
        ctx.arc(x, y, size * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      ctx.restore()
    }

    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const time = currentTime - startTime

      drawBackground()
      drawGrid(time)

      // Draw beams
      beamsRef.current.forEach((beam) => {
        drawBeam(beam, time)
      })

      drawParticles(time)

      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10">
      <canvas ref={canvasRef} className="h-full w-full" style={{ display: "block" }} />
    </div>
  )
}
