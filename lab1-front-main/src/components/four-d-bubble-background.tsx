'use client'

import React, { useEffect, useRef } from 'react'

interface Bubble4D {
  x: number
  y: number
  z: number
  w: number
  baseRadius: number
  colorStop1: string
  colorStop2: string
  vx: number
  vy: number
  vz: number
  vw: number
  phase: number
}

export default function FourDBubbleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Palette of vibrant, bioluminescent 4D bubble colors
    const bubbleColors = [
      { stop1: 'rgba(16, 185, 129, 0.75)', stop2: 'rgba(6, 95, 70, 0.05)' },     // Emerald
      { stop1: 'rgba(6, 182, 212, 0.70)', stop2: 'rgba(8, 51, 68, 0.05)' },      // Cyan
      { stop1: 'rgba(139, 92, 246, 0.65)', stop2: 'rgba(46, 16, 101, 0.05)' },    // Violet
      { stop1: 'rgba(236, 72, 153, 0.55)', stop2: 'rgba(131, 24, 67, 0.05)' },    // Pink
      { stop1: 'rgba(56, 189, 248, 0.65)', stop2: 'rgba(12, 74, 110, 0.05)' },    // Sky blue
      { stop1: 'rgba(245, 158, 11, 0.50)', stop2: 'rgba(120, 53, 15, 0.05)' },    // Warm Amber
    ]

    // Create 4D Hypersphere Bubbles
    const bubbles: Bubble4D[] = []
    const count = 14

    for (let i = 0; i < count; i++) {
      const c = bubbleColors[i % bubbleColors.length]
      bubbles.push({
        x: (Math.random() - 0.5) * width * 1.3,
        y: (Math.random() - 0.5) * height * 1.3,
        z: (Math.random() - 0.5) * 400,
        w: (Math.random() - 0.5) * 400,
        baseRadius: Math.random() * 110 + 130, // Large volumetric bubbles
        colorStop1: c.stop1,
        colorStop2: c.stop2,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        vz: (Math.random() - 0.5) * 0.35,
        vw: (Math.random() - 0.5) * 0.008,
        phase: Math.random() * Math.PI * 2,
      })
    }

    let angle4D = 0

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      angle4D += 0.006
      const cx = width / 2
      const cy = height / 2

      // Project each 4D Bubble into 3D and then 2D space
      bubbles.forEach((b) => {
        // Move in 4D
        b.x += b.vx
        b.y += b.vy
        b.z += b.vz
        b.w += b.vw
        b.phase += 0.01

        // Wrap around boundaries
        if (b.x < -width * 0.7) b.x = width * 0.7
        if (b.x > width * 0.7) b.x = -width * 0.7
        if (b.y < -height * 0.7) b.y = height * 0.7
        if (b.y > height * 0.7) b.y = -height * 0.7

        // 4D Rotation in XW and ZW planes
        const rotXW = b.x * Math.cos(angle4D) - b.w * Math.sin(angle4D)
        const rotW1 = b.x * Math.sin(angle4D) + b.w * Math.cos(angle4D)

        const rotZW = b.z * Math.cos(angle4D * 0.7) - rotW1 * Math.sin(angle4D * 0.7)
        const rotW2 = b.z * Math.sin(angle4D * 0.7) + rotW1 * Math.cos(angle4D * 0.7)

        // 4D stereographic scale factor (bubbles swell & shrink organically through 4th dimension)
        const distance4D = 480
        const scale4D = distance4D / (distance4D + rotW2 + 200)

        // 3D perspective projection onto 2D screen
        const distance3D = 600
        const scale3D = distance3D / (distance3D + rotZW + 300)

        const finalScale = Math.max(0.35, Math.min(2.2, scale4D * scale3D))
        const screenX = cx + rotXW * scale3D
        const screenY = cy + b.y * scale3D
        const radius = b.baseRadius * finalScale * (1 + 0.12 * Math.sin(b.phase))

        // Volumetric 4D Bubble Radial Gradient
        const grad = ctx.createRadialGradient(
          screenX - radius * 0.3,
          screenY - radius * 0.3,
          radius * 0.05,
          screenX,
          screenY,
          radius
        )

        grad.addColorStop(0, b.colorStop1)
        grad.addColorStop(0.55, b.colorStop1.replace(/[\d.]+\)$/, '0.35)'))
        grad.addColorStop(1, b.colorStop2)

        ctx.beginPath()
        ctx.arc(screenX, screenY, Math.max(10, radius), 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // 4D Iridescent Specular Highlight ring
        ctx.beginPath()
        ctx.arc(
          screenX - radius * 0.25,
          screenY - radius * 0.25,
          radius * 0.55,
          0,
          Math.PI * 2
        )
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)'
        ctx.lineWidth = 2.5 * finalScale
        ctx.stroke()
      })

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}
