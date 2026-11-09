'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

interface WaterDrop4DTextProps {
  text?: string
  className?: string
}

interface SplashParticle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  maxLife: number
  life: number
  color: string
}

interface RippleRing {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
  speed: number
  color: string
}

interface FallingDrop {
  x: number
  y: number
  targetY: number
  vy: number
  radius: number
  length: number
  targetCharIndex: number
  wPhase: number
}

interface TrickleDrop {
  x: number
  y: number
  startY: number
  endY: number
  vy: number
  radius: number
  wobblePhase: number
  charIndex: number
}

interface PerchedDrop {
  charIndex: number
  relX: number // 0 to 1 across character
  relY: number // 0 to 1 across character
  baseRadius: number
  phaseOffset: number
  freq: number
}

export default function WaterDrop4DText({
  text = 'AFROLAB',
  className = '',
}: WaterDrop4DTextProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const charRefs = useRef<(HTMLSpanElement | null)[]>([])

  const [activeBounce, setActiveBounce] = useState<{ [index: number]: number }>({})

  // Handle letter bounce trigger
  const triggerLetterBounce = useCallback((charIndex: number) => {
    setActiveBounce(prev => ({
      ...prev,
      [charIndex]: Date.now(),
    }))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let width = 0
    let height = 0
    let dpr = 1

    const resize = () => {
      if (!container || !canvas) return
      const rect = container.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }

    resize()
    window.addEventListener('resize', resize)

    // Physics state
    const splashes: SplashParticle[] = []
    const ripples: RippleRing[] = []
    const fallingDrops: FallingDrop[] = []
    const trickles: TrickleDrop[] = []

    // Pre-configured perched condensation droplets on "AFROLAB"
    const perchedDrops: PerchedDrop[] = [
      { charIndex: 0, relX: 0.5, relY: 0.02, baseRadius: 5.5, phaseOffset: 0.2, freq: 3.2 },   // Top of A
      { charIndex: 0, relX: 0.22, relY: 0.52, baseRadius: 3.8, phaseOffset: 1.1, freq: 2.8 },  // Crossbar A
      { charIndex: 1, relX: 0.72, relY: 0.04, baseRadius: 4.8, phaseOffset: 2.4, freq: 3.5 },  // Top arm F
      { charIndex: 1, relX: 0.55, relY: 0.48, baseRadius: 3.5, phaseOffset: 0.9, freq: 2.6 },  // Mid arm F
      { charIndex: 2, relX: 0.68, relY: 0.12, baseRadius: 5.2, phaseOffset: 3.1, freq: 3.0 },  // Curve R
      { charIndex: 2, relX: 0.82, relY: 0.92, baseRadius: 4.2, phaseOffset: 4.5, freq: 2.9 },  // Leg R
      { charIndex: 3, relX: 0.5, relY: 0.02, baseRadius: 6.0, phaseOffset: 1.8, freq: 3.6 },   // Top apex O
      { charIndex: 3, relX: 0.88, relY: 0.5, baseRadius: 4.5, phaseOffset: 2.9, freq: 3.1 },   // Side curve O
      { charIndex: 4, relX: 0.24, relY: 0.06, baseRadius: 4.2, phaseOffset: 0.7, freq: 2.7 },  // Top L
      { charIndex: 4, relX: 0.75, relY: 0.94, baseRadius: 5.0, phaseOffset: 3.8, freq: 3.4 },  // Base L
      { charIndex: 5, relX: 0.5, relY: 0.02, baseRadius: 5.8, phaseOffset: 2.1, freq: 3.3 },   // Top of 2nd A
      { charIndex: 5, relX: 0.78, relY: 0.54, baseRadius: 3.6, phaseOffset: 4.2, freq: 2.5 },  // Leg 2nd A
      { charIndex: 6, relX: 0.65, relY: 0.05, baseRadius: 5.4, phaseOffset: 1.4, freq: 3.7 },  // Top loop B
      { charIndex: 6, relX: 0.70, relY: 0.52, baseRadius: 4.0, phaseOffset: 2.8, freq: 2.9 },  // Mid waist B
      { charIndex: 6, relX: 0.62, relY: 0.95, baseRadius: 4.6, phaseOffset: 0.5, freq: 3.1 },  // Bottom B
    ]

    // Create a 4D water splash at (x, y)
    const createSplash = (x: number, y: number, intensity = 1, charIdx = -1) => {
      // 1. Ripple shockwave
      ripples.push({
        x,
        y,
        radius: 3,
        maxRadius: Math.min(width * 0.25, 45 * intensity),
        alpha: 0.85,
        speed: 1.8 * intensity,
        color: 'rgba(56, 189, 248, ',
      })

      // Secondary delay ripple
      setTimeout(() => {
        ripples.push({
          x,
          y,
          radius: 2,
          maxRadius: Math.min(width * 0.2, 32 * intensity),
          alpha: 0.7,
          speed: 1.3 * intensity,
          color: 'rgba(16, 185, 129, ',
        })
      }, 70)

      // 2. Micro water splash droplets (physics burst)
      const count = Math.floor(6 * intensity) + 4
      for (let i = 0; i < count; i++) {
        const angle = Math.PI * 1.05 + Math.random() * Math.PI * 0.9 // upward bias
        const speed = (2.2 + Math.random() * 3.8) * intensity
        splashes.push({
          x,
          y: y - 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: (1.2 + Math.random() * 2.2) * Math.sqrt(intensity),
          alpha: 0.95,
          maxLife: 28 + Math.random() * 18,
          life: 0,
          color: i % 2 === 0 ? '#38bdf8' : '#6ee7b7',
        })
      }

      // 3. Elastic bounce on character
      if (charIdx >= 0) {
        triggerLetterBounce(charIdx)
      }
    }

    // Helper to get character box relative to container
    const getCharBox = (charIdx: number) => {
      const el = charRefs.current[charIdx]
      if (!el || !container) return null
      const cRect = container.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      return {
        left: elRect.left - cRect.left,
        top: elRect.top - cRect.top,
        width: elRect.width,
        height: elRect.height,
        right: elRect.right - cRect.left,
        bottom: elRect.bottom - cRect.top,
      }
    }

    // Spawn a natural falling 4D water drop
    const spawnFallingDrop = () => {
      const charCount = text.length
      if (charCount === 0) return
      const targetChar = Math.floor(Math.random() * charCount)
      const box = getCharBox(targetChar)
      if (!box) return

      const dropX = box.left + box.width * (0.2 + Math.random() * 0.6)
      const dropY = -20 - Math.random() * 30
      // Impact target is the top area of the letter
      const targetY = box.top + box.height * (0.05 + Math.random() * 0.25)

      fallingDrops.push({
        x: dropX,
        y: dropY,
        targetY,
        vy: 2.8 + Math.random() * 2.5,
        radius: 3.5 + Math.random() * 2.5,
        length: 8 + Math.random() * 6,
        targetCharIndex: targetChar,
        wPhase: Math.random() * Math.PI * 2,
      })
    }

    // Spawn natural trickling drip down a letter
    const spawnTrickle = () => {
      const charCount = text.length
      if (charCount === 0) return
      const charIdx = Math.floor(Math.random() * charCount)
      const box = getCharBox(charIdx)
      if (!box) return

      const startX = box.left + box.width * (0.3 + Math.random() * 0.4)
      const startY = box.top + box.height * 0.15
      const endY = box.bottom + 8

      trickles.push({
        x: startX,
        y: startY,
        startY,
        endY,
        vy: 0.65 + Math.random() * 0.6,
        radius: 2.8 + Math.random() * 1.8,
        wobblePhase: Math.random() * Math.PI * 2,
        charIndex: charIdx,
      })
    }

    let lastSpawnTime = 0
    let lastTrickleTime = 0
    let startTime = performance.now()

    // 4D Water Drop Render Loop
    const render = (time: number) => {
      const elapsed = (time - startTime) * 0.001
      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, width, height)

      // Time-controlled autonomous drop cadence
      if (time - lastSpawnTime > 1600 + Math.random() * 900) {
        spawnFallingDrop()
        lastSpawnTime = time
      }

      if (time - lastTrickleTime > 3400 + Math.random() * 2000) {
        spawnTrickle()
        lastTrickleTime = time
      }

      // 4D Hyperspace Coordinate w(t)
      const w4D = Math.sin(elapsed * 1.4) * 40

      // =========================================================================
      // 1. RENDER PERCHED CONDENSATION DROPLETS ON THE LETTERS
      // =========================================================================
      perchedDrops.forEach((pd) => {
        const box = getCharBox(pd.charIndex)
        if (!box) return

        const px = box.left + box.width * pd.relX
        const py = box.top + box.height * pd.relY

        // 4D Harmonic Oscillation (Surface tension wobble across 4 dimensions)
        const tVal = elapsed * pd.freq + pd.phaseOffset
        const wFactor = Math.cos(elapsed * 1.1 + pd.phaseOffset)
        const wobbleX = 1 + 0.16 * Math.sin(tVal) * (1 + 0.2 * wFactor)
        const wobbleY = 1 - 0.16 * Math.sin(tVal) * (1 + 0.2 * wFactor)

        const rX = pd.baseRadius * wobbleX
        const rY = pd.baseRadius * wobbleY

        // Water drop shadow
        ctx.beginPath()
        ctx.ellipse(px + 1.2, py + rY * 0.7, rX * 0.9, rY * 0.45, 0, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(6, 182, 212, 0.18)'
        ctx.fill()

        // Water drop translucent body (Refractive cyan-emerald liquid)
        const bodyGrad = ctx.createRadialGradient(
          px - rX * 0.28,
          py - rY * 0.32,
          rX * 0.1,
          px,
          py,
          rX
        )
        bodyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)')
        bodyGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.65)')
        bodyGrad.addColorStop(0.75, 'rgba(16, 185, 129, 0.45)')
        bodyGrad.addColorStop(1, 'rgba(6, 95, 70, 0.25)')

        ctx.beginPath()
        ctx.ellipse(px, py, rX, rY, 0, 0, Math.PI * 2)
        ctx.fillStyle = bodyGrad
        ctx.fill()

        // 4D Meniscus rim highlight
        ctx.lineWidth = 0.9
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)'
        ctx.stroke()

        // Crisp specular reflection glint (sunlight gleam on curved water droplet)
        ctx.beginPath()
        ctx.ellipse(
          px - rX * 0.32,
          py - rY * 0.35,
          rX * 0.35,
          rY * 0.22,
          -Math.PI / 5,
          0,
          Math.PI * 2
        )
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
        ctx.fill()

        // Secondary bottom caustic glint
        ctx.beginPath()
        ctx.arc(px + rX * 0.22, py + rY * 0.35, rX * 0.18, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(167, 243, 208, 0.7)'
        ctx.fill()
      })

      // =========================================================================
      // 2. RENDER TRICKLING WATER DRIPS (SLIDING DOWN LETTERS)
      // =========================================================================
      for (let i = trickles.length - 1; i >= 0; i--) {
        const tr = trickles[i]
        tr.y += tr.vy
        tr.vy += 0.035 // slight acceleration
        tr.wobblePhase += 0.12

        // Wobble stretch as it slides
        const stretch = 1 + (tr.vy * 0.25)
        const rx = tr.radius / Math.sqrt(stretch)
        const ry = tr.radius * stretch

        // Draw moist water trail
        ctx.beginPath()
        ctx.moveTo(tr.x, tr.startY)
        ctx.lineTo(tr.x, tr.y - ry)
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)'
        ctx.lineWidth = tr.radius * 0.65
        ctx.lineCap = 'round'
        ctx.stroke()

        // Draw trickling teardrop head
        ctx.beginPath()
        ctx.ellipse(tr.x, tr.y, rx, ry, 0, 0, Math.PI * 2)
        const trGrad = ctx.createRadialGradient(
          tr.x - rx * 0.2,
          tr.y - ry * 0.3,
          rx * 0.1,
          tr.x,
          tr.y,
          rx
        )
        trGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
        trGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.6)')
        trGrad.addColorStop(1, 'rgba(16, 185, 129, 0.35)')
        ctx.fillStyle = trGrad
        ctx.fill()

        // Specular glint
        ctx.beginPath()
        ctx.arc(tr.x - rx * 0.25, tr.y - ry * 0.28, rx * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()

        // Detach / Drip splash when reaching bottom
        if (tr.y >= tr.endY) {
          createSplash(tr.x, tr.y, 0.85, tr.charIndex)
          trickles.splice(i, 1)
        }
      }

      // =========================================================================
      // 3. RENDER FALLING 4D WATER DROPS (ACCELERATING UNDER GRAVITY)
      // =========================================================================
      for (let i = fallingDrops.length - 1; i >= 0; i--) {
        const fd = fallingDrops[i]
        fd.y += fd.vy
        fd.vy += 0.28 // gravity

        // Check impact with target letter
        if (fd.y >= fd.targetY) {
          createSplash(fd.x, fd.targetY, 1.15, fd.targetCharIndex)
          fallingDrops.splice(i, 1)
          continue
        }

        // 4D Teardrop shape with velocity stretch
        const length = fd.length * (fd.vy * 0.28 + 0.8)
        const r = fd.radius

        ctx.save()
        ctx.translate(fd.x, fd.y)

        // Drop shadow
        ctx.beginPath()
        ctx.ellipse(0, 0, r * 0.8, length * 0.8, 0, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(6, 182, 212, 0.15)'
        ctx.fill()

        // Teardrop path (pointed top, rounded bottom)
        ctx.beginPath()
        ctx.moveTo(0, -length * 0.6)
        ctx.bezierCurveTo(r * 1.1, -length * 0.2, r * 1.3, length * 0.3, 0, length * 0.5)
        ctx.bezierCurveTo(-r * 1.3, length * 0.3, -r * 1.1, -length * 0.2, 0, -length * 0.6)
        ctx.closePath()

        const dropGrad = ctx.createLinearGradient(0, -length * 0.6, 0, length * 0.5)
        dropGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
        dropGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.75)')
        dropGrad.addColorStop(0.85, 'rgba(16, 185, 129, 0.65)')
        dropGrad.addColorStop(1, 'rgba(6, 95, 70, 0.4)')
        ctx.fillStyle = dropGrad
        ctx.fill()

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.lineWidth = 0.8
        ctx.stroke()

        // Bright specular glint streak
        ctx.beginPath()
        ctx.moveTo(-r * 0.3, -length * 0.2)
        ctx.lineTo(-r * 0.3, length * 0.2)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.lineWidth = 1.4
        ctx.stroke()

        ctx.restore()
      }

      // =========================================================================
      // 4. RENDER RIPPLE RINGS (EXPANDING CONCENTRIC WATER WAVES)
      // =========================================================================
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]
        rp.radius += rp.speed
        rp.alpha -= 0.016

        if (rp.alpha <= 0 || rp.radius >= rp.maxRadius) {
          ripples.splice(i, 1)
          continue
        }

        ctx.beginPath()
        // 4D elliptical perspective ripple
        ctx.ellipse(rp.x, rp.y, rp.radius, rp.radius * 0.45, 0, 0, Math.PI * 2)
        ctx.strokeStyle = `${rp.color}${Math.max(0, rp.alpha)})`
        ctx.lineWidth = Math.max(0.5, 2.4 * (1 - rp.radius / rp.maxRadius))
        ctx.stroke()

        // Inner harmonic wave crest
        if (rp.radius > 8) {
          ctx.beginPath()
          ctx.ellipse(rp.x, rp.y, rp.radius * 0.65, rp.radius * 0.28, 0, 0, Math.PI * 2)
          ctx.strokeStyle = `${rp.color}${Math.max(0, rp.alpha * 0.5)})`
          ctx.lineWidth = 1.0
          ctx.stroke()
        }
      }

      // =========================================================================
      // 5. RENDER SPLASH PARTICLES (MICRO WATER DROPLETS BOUNCING UPWARDS)
      // =========================================================================
      for (let i = splashes.length - 1; i >= 0; i--) {
        const sp = splashes[i]
        sp.x += sp.vx
        sp.y += sp.vy
        sp.vy += 0.22 // gravity
        sp.life++
        sp.alpha = Math.max(0, 1 - sp.life / sp.maxLife)

        if (sp.life >= sp.maxLife) {
          splashes.splice(i, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(sp.x, sp.y, Math.max(0.6, sp.radius * sp.alpha), 0, Math.PI * 2)
        ctx.fillStyle = sp.color
        ctx.globalAlpha = sp.alpha
        ctx.fill()

        // Specular particle highlight
        ctx.beginPath()
        ctx.arc(sp.x - 0.4, sp.y - 0.4, Math.max(0.3, sp.radius * 0.35), 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.globalAlpha = 1.0
      }

      // =========================================================================
      // 6. 4D CAUSTIC LIGHT SHIMMER (PRISMATIC WATER REFLECTION DRIFT)
      // =========================================================================
      const causticX = (Math.sin(elapsed * 0.8) * 0.45 + 0.5) * width
      const causticGrad = ctx.createRadialGradient(
        causticX,
        height * 0.45,
        10,
        causticX,
        height * 0.45,
        width * 0.4
      )
      causticGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)')
      causticGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.06)')
      causticGrad.addColorStop(1, 'transparent')

      ctx.fillStyle = causticGrad
      ctx.fillRect(0, 0, width, height)

      ctx.restore()
      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    // =========================================================================
    // INTERACTIVITY: MOUSE / TOUCH WATER RIPPLES & IMPACTS
    // =========================================================================
    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return
      const rect = container.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      // Spawn gentle interactive water ripples along mouse track
      if (Math.random() < 0.35) {
        ripples.push({
          x: mx,
          y: my,
          radius: 2,
          maxRadius: 28,
          alpha: 0.6,
          speed: 1.4,
          color: 'rgba(56, 189, 248, ',
        })
      }
    }

    const handleClick = (e: MouseEvent) => {
      if (!container) return
      const rect = container.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      // Dramatic splash burst on click!
      createSplash(mx, my, 2.2)

      // Find closest character and trigger bounce
      charRefs.current.forEach((el, idx) => {
        if (!el) return
        const b = el.getBoundingClientRect()
        const elMidX = b.left - rect.left + b.width * 0.5
        if (Math.abs(mx - elMidX) < b.width * 0.8) {
          triggerLetterBounce(idx)
        }
      })
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('click', handleClick)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('click', handleClick)
    }
  }, [text, triggerLetterBounce])

  const characters = text.split('')

  return (
    <div
      ref={containerRef}
      className={`relative inline-block cursor-pointer select-none group py-4 px-2 ${className}`}
      title="AFROLAB • Interactive 4D Water Droplet Simulation (Click or hover to create ripples)"
    >
      {/* 4D Water Physics Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-20 overflow-visible"
      />

      {/* 4D Liquid Text Glyph Body */}
      <div className="relative z-10 flex items-center justify-center tracking-[-0.04em]">
        {characters.map((char, index) => {
          const bounceTimestamp = activeBounce[index]
          const isBouncing = bounceTimestamp && Date.now() - bounceTimestamp < 650

          return (
            <span
              key={`${char}-${index}`}
              ref={(el) => {
                charRefs.current[index] = el
              }}
              className={`relative inline-block transition-transform duration-300 ${
                isBouncing ? 'animate-water-bounce' : ''
              }`}
            >
              {/* Main Liquid Glass Character Face with Gradient & Specular Reflections */}
              <span
                className="relative inline-block text-transparent bg-clip-text font-black"
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(186,230,253,0.95) 28%, rgba(56,189,248,0.92) 55%, rgba(16,185,129,0.90) 82%, rgba(6,95,70,0.85) 100%)',
                  filter:
                    'drop-shadow(0 4px 10px rgba(56, 189, 248, 0.4)) drop-shadow(0 14px 28px rgba(16, 185, 129, 0.35))',
                }}
              >
                {char}
              </span>

              {/* Liquid Meniscus Curved Surface Highlight (Glossy Water Droplet Sheen) */}
              <span
                aria-hidden="true"
                className="absolute inset-0 text-transparent bg-clip-text font-black pointer-events-none opacity-85 mix-blend-overlay"
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.6) 24%, transparent 50%)',
                }}
              >
                {char}
              </span>

              {/* 4D Internal Prismatic Water Refraction Glint */}
              <span
                aria-hidden="true"
                className="absolute inset-0 text-transparent bg-clip-text font-black pointer-events-none opacity-40 dark:opacity-60"
                style={{
                  backgroundImage:
                    'radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.9) 0%, rgba(56,189,248,0.5) 45%, transparent 75%)',
                }}
              >
                {char}
              </span>
            </span>
          )
        })}
      </div>

      {/* Bottom Liquid Water Puddle Refraction Glow */}
      <div
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4/5 h-6 rounded-full pointer-events-none blur-md opacity-60 dark:opacity-75 transition-opacity"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.45) 0%, rgba(16, 185, 129, 0.3) 50%, transparent 80%)',
        }}
      />
    </div>
  )
}
