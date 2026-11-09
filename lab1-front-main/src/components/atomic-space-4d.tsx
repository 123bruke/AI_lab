'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface ElementPreset {
  name: string
  symbol: string
  protons: number
  neutrons: number
  electrons: number
  mass: string
  bindingEnergy: string
  coreColor: number
  ringColor: number
}

const ELEMENTS: ElementPreset[] = [
  {
    name: 'Quantum Carbon',
    symbol: '¹²C',
    protons: 6,
    neutrons: 6,
    electrons: 6,
    mass: '12.011 u',
    bindingEnergy: '7.68 MeV/A',
    coreColor: 0x10b981,
    ringColor: 0x38bdf8,
  },
  {
    name: 'Excited Copper',
    symbol: '⁶³Cu',
    protons: 29,
    neutrons: 34,
    electrons: 29,
    mass: '62.929 u',
    bindingEnergy: '8.75 MeV/A',
    coreColor: 0xf59e0b,
    ringColor: 0x06b6d4,
  },
  {
    name: 'Relativistic Gold',
    symbol: '¹⁹⁷Au',
    protons: 79,
    neutrons: 118,
    electrons: 79,
    mass: '196.966 u',
    bindingEnergy: '7.91 MeV/A',
    coreColor: 0xfbbf24,
    ringColor: 0xa855f7,
  },
  {
    name: 'Heavy Uranium',
    symbol: '²³⁸U',
    protons: 92,
    neutrons: 146,
    electrons: 92,
    mass: '238.028 u',
    bindingEnergy: '7.57 MeV/A',
    coreColor: 0xec4899,
    ringColor: 0x10b981,
  },
]

export default function AtomicSpace4D() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [selectedElement, setSelectedElement] = useState<ElementPreset>(ELEMENTS[0])
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0)
  const [is4DMode, setIs4DMode] = useState<boolean>(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()

    const width = container.clientWidth || 800
    const height = container.clientHeight || 520

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 2.5, 12)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // Blender-quality Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.8)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2)
    keyLight.position.set(8, 12, 10)
    scene.add(keyLight)

    const cyanRimLight = new THREE.DirectionalLight(0x06b6d4, 3.5)
    cyanRimLight.position.set(-10, -5, -8)
    scene.add(cyanRimLight)

    const emeraldFillLight = new THREE.DirectionalLight(0x10b981, 2.8)
    emeraldFillLight.position.set(6, -8, 6)
    scene.add(emeraldFillLight)

    const coreLight = new THREE.PointLight(selectedElement.coreColor, 4.5, 8, 2)
    coreLight.position.set(0, 0, 0)
    scene.add(coreLight)

    // Root Atomic System Object
    const atomGroup = new THREE.Group()
    scene.add(atomGroup)

    // 1. Central Nucleus Cluster (Protons & Neutrons with Blender metallic shaders)
    const nucleusGroup = new THREE.Group()
    atomGroup.add(nucleusGroup)

    const nucleonGeo = new THREE.SphereGeometry(0.24, 32, 32)

    const protonMat = new THREE.MeshStandardMaterial({
      color: selectedElement.coreColor,
      metalness: 0.88,
      roughness: 0.16,
      envMapIntensity: 2.0,
      emissive: selectedElement.coreColor,
      emissiveIntensity: 0.22,
    })

    const neutronMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.92,
      roughness: 0.12,
      envMapIntensity: 2.2,
      emissive: 0x475569,
      emissiveIntensity: 0.1,
    })

    // Generate tightly packed nucleus spheres
    const numNucleons = 18
    const nucleonPositions: THREE.Vector3[] = []
    const goldenRatio = (1 + Math.sqrt(5)) / 2

    for (let i = 0; i < numNucleons; i++) {
      const theta = 2 * Math.PI * i / goldenRatio
      const phi = Math.acos(1 - 2 * (i + 0.5) / numNucleons)
      const rad = 0.58 + (i % 3) * 0.08
      const x = rad * Math.cos(theta) * Math.sin(phi)
      const y = rad * Math.sin(theta) * Math.sin(phi)
      const z = rad * Math.cos(phi)

      const isProton = i % 2 === 0
      const mesh = new THREE.Mesh(nucleonGeo, isProton ? protonMat : neutronMat)
      mesh.position.set(x, y, z)
      mesh.scale.setScalar(0.9 + Math.random() * 0.2)
      nucleusGroup.add(mesh)
      nucleonPositions.push(mesh.position)
    }

    // 2. 4D Quantum Electron Orbital Rings
    const orbitalGroup = new THREE.Group()
    atomGroup.add(orbitalGroup)

    const ringConfigs = [
      { radius: 2.4, tube: 0.022, rotX: 1.1, rotY: 0.4, rotZ: 0.2, speed: 0.016, color: 0x38bdf8 },
      { radius: 3.3, tube: 0.024, rotX: 0.5, rotY: 1.3, rotZ: 0.8, speed: 0.012, color: 0x10b981 },
      { radius: 4.1, tube: 0.022, rotX: 0.9, rotY: 0.7, rotZ: 1.5, speed: 0.009, color: 0xa855f7 },
      { radius: 4.9, tube: 0.020, rotX: 1.4, rotY: 0.2, rotZ: 1.1, speed: 0.007, color: 0xf59e0b },
    ]

    const rings: {
      mesh: THREE.Mesh
      config: typeof ringConfigs[0]
      electron: THREE.Mesh
      angle: number
    }[] = []

    const electronGeo = new THREE.SphereGeometry(0.12, 24, 24)

    ringConfigs.forEach((cfg) => {
      const ringGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 32, 160)
      const ringMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.6,
        roughness: 0.25,
        metalness: 0.8,
        transparent: true,
        opacity: 0.85,
      })

      const ringMesh = new THREE.Mesh(ringGeo, ringMat)
      ringMesh.rotation.set(cfg.rotX, cfg.rotY, cfg.rotZ)
      orbitalGroup.add(ringMesh)

      // Orbiting electron with intense point glow
      const electronMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: cfg.color,
        emissiveIntensity: 2.0,
        roughness: 0.1,
        metalness: 0.9,
      })
      const electronMesh = new THREE.Mesh(electronGeo, electronMat)
      orbitalGroup.add(electronMesh)

      rings.push({
        mesh: ringMesh,
        config: cfg,
        electron: electronMesh,
        angle: Math.random() * Math.PI * 2,
      })
    })

    // 3. Volumetric Quantum Wavefunction Probability Cloud (800 particles)
    const particleCount = 750
    const particleGeo = new THREE.BufferGeometry()
    const particlePos = new Float32Array(particleCount * 3)
    const particleColors = new Float32Array(particleCount * 3)

    const pColor1 = new THREE.Color(selectedElement.coreColor)
    const pColor2 = new THREE.Color(selectedElement.ringColor)

    for (let i = 0; i < particleCount; i++) {
      // Gaussian spherical distribution
      const u = Math.random()
      const v = Math.random()
      const theta = u * 2.0 * Math.PI
      const phi = Math.acos(2.0 * v - 1.0)
      const r = Math.pow(Math.random(), 0.6) * 5.2

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      particlePos[i * 3] = x
      particlePos[i * 3 + 1] = y
      particlePos[i * 3 + 2] = z

      const mixed = pColor1.clone().lerp(pColor2, Math.random())
      particleColors[i * 3] = mixed.r
      particleColors[i * 3 + 1] = mixed.g
      particleColors[i * 3 + 2] = mixed.b
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    })

    const particleCloud = new THREE.Points(particleGeo, particleMat)
    atomGroup.add(particleCloud)

    // Interactive mouse rotation tracking
    let targetRotY = 0
    let targetRotX = 0
    let mouseX = 0
    let mouseY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseX = (e.clientX - rect.left) / width - 0.5
      mouseY = (e.clientY - rect.top) / height - 0.5
      targetRotY = mouseX * 1.5
      targetRotX = mouseY * 0.8
    }

    container.addEventListener('mousemove', handleMouseMove)

    // Animation Loop
    let animId: number
    let time4D = 0

    const animate = () => {
      time4D += 0.015 * rotationSpeed

      // Smooth camera/group tilt
      atomGroup.rotation.y += (targetRotY - atomGroup.rotation.y) * 0.05
      atomGroup.rotation.x += (targetRotX - atomGroup.rotation.x) * 0.05

      // Continuous autonomous 4D precession
      atomGroup.rotation.y += 0.003 * rotationSpeed
      nucleusGroup.rotation.y += 0.008 * rotationSpeed
      nucleusGroup.rotation.x += 0.004 * rotationSpeed

      // 4D breathing core pulsation
      const pulse = 1 + 0.04 * Math.sin(time4D * 3)
      nucleusGroup.scale.set(pulse, pulse, pulse)

      // Orbit electrons & precession
      rings.forEach((r, idx) => {
        r.angle += r.config.speed * rotationSpeed * 2

        if (is4DMode) {
          // 4D Hyperspatial coordinate rotation (4th dimension projection)
          const angleW = time4D * (idx % 2 === 0 ? 0.7 : -0.7)
          r.mesh.rotation.x = r.config.rotX + Math.sin(angleW) * 0.35
          r.mesh.rotation.y = r.config.rotY + Math.cos(angleW) * 0.35
          r.mesh.rotation.z = r.config.rotZ + Math.sin(angleW * 0.5) * 0.25
        }

        // Compute 3D position of electron along transformed ring
        const ex = Math.cos(r.angle) * r.config.radius
        const ez = Math.sin(r.angle) * r.config.radius
        const p = new THREE.Vector3(ex, 0, ez)
        p.applyEuler(r.mesh.rotation)
        r.electron.position.copy(p)
      })

      // Quantum Cloud slow drift
      particleCloud.rotation.y += 0.001 * rotationSpeed
      particleCloud.rotation.z += 0.0008 * rotationSpeed

      renderer.render(scene, camera)
      animId = requestAnimationFrame(animate)
    }

    animate()

    // Resize handler
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('mousemove', handleMouseMove)
      renderer.dispose()
    }
  }, [selectedElement, rotationSpeed, is4DMode])

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/70 shadow-2xl backdrop-blur-2xl transition-all dark:border-neutral-800 dark:bg-black/60">
      {/* Sleek Minimalist Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/70 bg-white/50 px-6 py-4 backdrop-blur-md dark:border-neutral-800 dark:bg-black/40">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            {/* Clean Google Material Style Atom Icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <circle cx="12" cy="12" r="3" />
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)" />
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)" />
            </svg>
          </span>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              4D Atomic Space &amp; Quantum Universe
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Photorealistic WebGL render with physically based metallic shaders
            </p>
          </div>
        </div>

        {/* 4D Mode & Speed Toggle */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setIs4DMode(!is4DMode)}
            className={`rounded-full px-3 py-1 font-medium transition-all ${
              is4DMode
                ? 'bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-black'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
          >
            {is4DMode ? '4D Hyperspace: Active' : '4D Mode: Off'}
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div className="relative h-[380px] sm:h-[440px] w-full bg-gradient-to-b from-neutral-50/50 via-white/20 to-neutral-100/30 dark:from-neutral-950 dark:via-black/40 dark:to-neutral-950">
        <div ref={containerRef} className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing" />

        {/* Top-Right Scientific Metrics Overlay */}
        <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 rounded-2xl border border-neutral-200/80 bg-white/80 p-3.5 text-left text-xs shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-black/80">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-200/60 pb-1.5 dark:border-neutral-800">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{selectedElement.name}</span>
            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {selectedElement.symbol}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
            <span>Atomic Mass:</span>
            <span className="text-right text-neutral-900 dark:text-neutral-200">{selectedElement.mass}</span>
            <span>Binding Energy:</span>
            <span className="text-right text-neutral-900 dark:text-neutral-200">{selectedElement.bindingEnergy}</span>
            <span>Quantum State:</span>
            <span className="text-right text-emerald-600 dark:text-emerald-400">n=3, ℓ=2, s=½</span>
          </div>
        </div>

        {/* Bottom Orbit Speed & Element Selection Tray */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-neutral-200/80 bg-white/80 p-2.5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-black/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Element:</span>
            {ELEMENTS.map((elem) => (
              <button
                key={elem.symbol}
                type="button"
                onClick={() => setSelectedElement(elem)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedElement.symbol === elem.symbol
                    ? 'bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-black'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                {elem.symbol} {elem.name.split(' ')[1]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Speed:</span>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
              className="h-1.5 w-20 accent-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
