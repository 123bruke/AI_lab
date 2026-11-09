'use client'

import React, { useEffect, useRef } from 'react'

interface Point3D {
  x: number
  y: number
  z: number
  baseX: number
  baseY: number
  baseZ: number
  radius: number
  color: string
}

interface Edge3D {
  p1: number
  p2: number
}

export default function ThreeDBackgroundDesign() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth)
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650)

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return
      width = canvas.width = canvas.parentElement.clientWidth
      height = canvas.height = canvas.parentElement.clientHeight
    }
    window.addEventListener('resize', handleResize)

    // Mouse parallax tracking
    let targetRotX = 0
    let targetRotY = 0
    let rotX = 0
    let rotY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left) / width - 0.5
      const my = (e.clientY - rect.top) / height - 0.5
      targetRotY = mx * 0.8
      targetRotX = -my * 0.6
    }
    window.addEventListener('mousemove', handleMouseMove)

    // 1. Generate 3D Molecular / Quantum Polyhedron Nodes
    const nodes: Point3D[] = []
    const edges: Edge3D[] = []

    // Primary central icosahedron / diamond cluster
    const clusterRadius = Math.min(width, height) * 0.28
    const numPoints = 24

    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints)
      const theta = Math.sqrt(numPoints * Math.PI) * phi

      const x = clusterRadius * Math.cos(theta) * Math.sin(phi)
      const y = clusterRadius * Math.sin(theta) * Math.sin(phi)
      const z = clusterRadius * Math.cos(phi)

      nodes.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        radius: 3 + (i % 4) * 1.5,
        color: i % 3 === 0 ? '#6ECE9D' : i % 3 === 1 ? '#38bdf8' : '#a78bfa',
      })
    }

    // Connect nearest nodes with 3D structural lattice edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].baseX - nodes[j].baseX
        const dy = nodes[i].baseY - nodes[j].baseY
        const dz = nodes[i].baseZ - nodes[j].baseZ
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < clusterRadius * 0.95) {
          edges.push({ p1: i, p2: j })
        }
      }
    }

    // 2. Ambient Floating 3D Quantum Particles
    const particlesCount = 45
    const particles: Array<{
      x: number
      y: number
      z: number
      vx: number
      vy: number
      vz: number
      size: number
      alpha: number
    }> = []

    for (let i = 0; i < particlesCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.2,
        y: (Math.random() - 0.5) * height * 1.2,
        z: (Math.random() - 0.5) * 500,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.5 + 0.2,
      })
    }

    // 3. Main Animation Loop
    let angle = 0
    const fov = 420

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Smooth camera interpolation
      rotX += (targetRotX - rotX) * 0.05
      rotY += (targetRotY - rotY) * 0.05
      angle += 0.005

      const cx = width / 2
      const cy = height * 0.42

      // Transform & Project 3D Nodes
      const currentRotX = rotX + Math.sin(angle * 0.8) * 0.15
      const currentRotY = rotY + angle

      const projected = nodes.map((node) => {
        // Rotate around Y
        let x1 = node.baseX * Math.cos(currentRotY) - node.baseZ * Math.sin(currentRotY)
        let z1 = node.baseX * Math.sin(currentRotY) + node.baseZ * Math.cos(currentRotY)

        // Rotate around X
        let y2 = node.baseY * Math.cos(currentRotX) - z1 * Math.sin(currentRotX)
        let z2 = node.baseY * Math.sin(currentRotX) + z1 * Math.cos(currentRotX)

        // Float breathing effect
        y2 += Math.sin(angle * 2 + node.baseX * 0.02) * 12

        // Perspective Projection
        const scale = fov / (fov + z2 + 200)
        const projX = cx + x1 * scale
        const projY = cy + y2 * scale

        return {
          x: projX,
          y: projY,
          scale: Math.max(0.1, scale),
          z: z2,
          radius: node.radius * scale,
          color: node.color,
        }
      })

      // Draw Floating Quantum Particles (Background layer)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.z += p.vz

        if (p.x < -width / 2) p.x = width / 2
        if (p.x > width / 2) p.x = -width / 2
        if (p.y < -height / 2) p.y = height / 2
        if (p.y > height / 2) p.y = -height / 2

        const pScale = fov / (fov + p.z + 300)
        const px = cx + p.x * pScale
        const py = cy + p.y * pScale

        ctx.beginPath()
        ctx.arc(px, py, p.size * pScale, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(110, 206, 157, ${p.alpha * pScale})`
        ctx.fill()
      })

      // Draw 3D Edges with depth-dependent opacity
      edges.forEach((edge) => {
        const p1 = projected[edge.p1]
        const p2 = projected[edge.p2]

        const avgZ = (p1.z + p2.z) / 2
        const edgeAlpha = Math.max(0.04, Math.min(0.45, (fov - avgZ) / (fov * 2)))

        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = `rgba(110, 206, 157, ${edgeAlpha * 0.6})`
        ctx.lineWidth = 1.2 * ((p1.scale + p2.scale) / 2)
        ctx.stroke()
      })

      // Draw Depth-sorted Nodes
      const sortedNodes = [...projected].sort((a, b) => b.z - a.z)

      sortedNodes.forEach((node) => {
        const nodeAlpha = Math.max(0.2, Math.min(0.9, (fov - node.z) / (fov * 1.5)))

        // Glow gradient
        const grad = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          node.radius * 2.2
        )
        grad.addColorStop(0, node.color)
        grad.addColorStop(0.4, node.color)
        grad.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(node.x, node.y, Math.max(1, node.radius * 2.2), 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.globalAlpha = nodeAlpha * 0.4
        ctx.fill()

        // Solid specular core
        ctx.beginPath()
        ctx.arc(node.x, node.y, Math.max(1, node.radius), 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.globalAlpha = nodeAlpha
        ctx.fill()
        ctx.globalAlpha = 1.0
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[-1] select-none opacity-85">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}
