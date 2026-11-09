'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function UltraCinemaAtom4D() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene & Camera
    const scene = new THREE.Scene()
    let width = container.clientWidth || window.innerWidth
    let height = container.clientHeight || 750

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000)
    // Position camera to view the large cinema atom in full majestic scale
    camera.position.set(0, 0, 14.5)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.35
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // Ultra Cinema Studio 4-Point Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x0a1612, 1.6)
    scene.add(ambientLight)

    // Key Light (Sharp specular highlight on metallic protons)
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.8)
    keyLight.position.set(10, 14, 12)
    scene.add(keyLight)

    // Electric Cyan Rim Light (Hollywood-style atmospheric silhouette)
    const cyanRimLight = new THREE.DirectionalLight(0x06b6d4, 4.2)
    cyanRimLight.position.set(-12, -6, -8)
    scene.add(cyanRimLight)

    // Emerald Fill Light
    const emeraldFillLight = new THREE.DirectionalLight(0x10b981, 3.0)
    emeraldFillLight.position.set(8, -10, 6)
    scene.add(emeraldFillLight)

    // Pulsing Core PointLight inside the nucleus
    const corePointLight = new THREE.PointLight(0x38bdf8, 5.0, 12, 2)
    corePointLight.position.set(0, 0, 0)
    scene.add(corePointLight)

    // Master Atom Group
    const atomMasterGroup = new THREE.Group()
    scene.add(atomMasterGroup)

    // =========================================================================
    // 1. DENSE CENTRAL NUCLEUS (PROTONS & NEUTRONS) - LARGE & METALLIC
    // =========================================================================
    const nucleusGroup = new THREE.Group()
    atomMasterGroup.add(nucleusGroup)

    // High-poly nucleon sphere geometry
    const nucleonGeo = new THREE.SphereGeometry(0.36, 32, 32)

    // Metallic Proton Material (Vibrant ruby-emerald PBR metallic)
    const protonMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.88,
      roughness: 0.14,
      emissive: 0x059669,
      emissiveIntensity: 0.35,
    })

    // Polished Mirror Chrome Neutron Material
    const neutronMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.94,
      roughness: 0.1,
      emissive: 0x334155,
      emissiveIntensity: 0.15,
    })

    // Cluster of 28 nucleons arranged in natural spherical packing
    const numNucleons = 28
    const nucleons: { mesh: THREE.Mesh; basePos: THREE.Vector3; freq: number }[] = []
    const goldenRatio = (1 + Math.sqrt(5)) / 2

    for (let i = 0; i < numNucleons; i++) {
      const theta = 2 * Math.PI * i / goldenRatio
      const phi = Math.acos(1 - 2 * (i + 0.5) / numNucleons)
      const rad = 0.95 + (i % 4) * 0.12 // Large, prominent nucleus cluster

      const x = rad * Math.cos(theta) * Math.sin(phi)
      const y = rad * Math.sin(theta) * Math.sin(phi)
      const z = rad * Math.cos(phi)

      const isProton = i % 2 === 0
      const mesh = new THREE.Mesh(nucleonGeo, isProton ? protonMat : neutronMat)
      mesh.position.set(x, y, z)
      mesh.scale.setScalar(0.92 + Math.random() * 0.18)
      nucleusGroup.add(mesh)

      nucleons.push({
        mesh,
        basePos: new THREE.Vector3(x, y, z),
        freq: Math.random() * 5 + 3,
      })
    }

    // =========================================================================
    // 2. 4D QUANTUM ELECTRON ORBITAL RINGS & RELATIVISTIC ELECTRONS
    // =========================================================================
    const orbitalGroup = new THREE.Group()
    atomMasterGroup.add(orbitalGroup)

    // Orbital configuration (nested 4D Euler planes)
    const ringConfigs = [
      { radius: 3.2, tube: 0.026, rotX: 1.15, rotY: 0.35, rotZ: 0.2, speed: 0.024, color: 0x38bdf8, electrons: 2 },
      { radius: 4.6, tube: 0.028, rotX: 0.45, rotY: 1.25, rotZ: 0.85, speed: 0.018, color: 0x10b981, electrons: 3 },
      { radius: 6.0, tube: 0.026, rotX: 0.95, rotY: 0.65, rotZ: 1.45, speed: 0.014, color: 0xa855f7, electrons: 3 },
      { radius: 7.4, tube: 0.024, rotX: 1.40, rotY: 0.25, rotZ: 1.10, speed: 0.011, color: 0x06b6d4, electrons: 4 },
    ]

    const electronGeo = new THREE.SphereGeometry(0.16, 24, 24)

    const ringsData: {
      mesh: THREE.Mesh
      config: typeof ringConfigs[0]
      electrons: { mesh: THREE.Mesh; angleOffset: number }[]
    }[] = []

    ringConfigs.forEach((cfg) => {
      const ringGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 32, 160)
      const ringMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.75,
        roughness: 0.2,
        metalness: 0.85,
        transparent: true,
        opacity: 0.8,
      })

      const ringMesh = new THREE.Mesh(ringGeo, ringMat)
      ringMesh.rotation.set(cfg.rotX, cfg.rotY, cfg.rotZ)
      orbitalGroup.add(ringMesh)

      // Orbiting high-speed electrons with luminous aura
      const electronMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: cfg.color,
        emissiveIntensity: 3.5,
        roughness: 0.08,
        metalness: 0.95,
      })

      const ringElectrons: { mesh: THREE.Mesh; angleOffset: number }[] = []
      for (let e = 0; e < cfg.electrons; e++) {
        const electronMesh = new THREE.Mesh(electronGeo, electronMat)
        orbitalGroup.add(electronMesh)
        ringElectrons.push({
          mesh: electronMesh,
          angleOffset: (Math.PI * 2 * e) / cfg.electrons,
        })
      }

      ringsData.push({
        mesh: ringMesh,
        config: cfg,
        electrons: ringElectrons,
      })
    })

    // =========================================================================
    // 3. VOLUMETRIC QUANTUM FIELD (WAVEFUNCTION PROBABILITY PARTICLES)
    // =========================================================================
    const particleCount = 1100
    const particleGeo = new THREE.BufferGeometry()
    const particlePos = new Float32Array(particleCount * 3)
    const particleColors = new Float32Array(particleCount * 3)

    const c1 = new THREE.Color(0x10b981)
    const c2 = new THREE.Color(0x38bdf8)
    const c3 = new THREE.Color(0xa855f7)

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random()
      const v = Math.random()
      const theta = u * 2.0 * Math.PI
      const phi = Math.acos(2.0 * v - 1.0)
      const r = Math.pow(Math.random(), 0.6) * 8.5 // Extends across the cinema space

      particlePos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      particlePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      particlePos[i * 3 + 2] = r * Math.cos(phi)

      const mixed = (i % 3 === 0 ? c1 : i % 3 === 1 ? c2 : c3).clone()
      particleColors[i * 3] = mixed.r
      particleColors[i * 3 + 1] = mixed.g
      particleColors[i * 3 + 2] = mixed.b
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))

    const particleMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    })

    const particleCloud = new THREE.Points(particleGeo, particleMat)
    atomMasterGroup.add(particleCloud)

    // =========================================================================
    // 4. MOUSE PARALLAX CAMERA DYNAMICS
    // =========================================================================
    let targetCameraX = 0
    let targetCameraY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const mx = (e.clientX / window.innerWidth) - 0.5
      const my = (e.clientY / window.innerHeight) - 0.5
      targetCameraX = mx * 2.2
      targetCameraY = -my * 1.6
    }
    window.addEventListener('mousemove', handleMouseMove)

    // =========================================================================
    // 5. 60 FPS ULTRA CINEMA ANIMATION LOOP
    // =========================================================================
    let animId: number
    let clockTime = 0

    const animate = () => {
      clockTime += 0.016

      // Camera smooth damping towards target
      camera.position.x += (targetCameraX - camera.position.x) * 0.04
      camera.position.y += (targetCameraY - camera.position.y) * 0.04
      camera.lookAt(0, 0, 0)

      // Continuous 4D Atom Precession
      atomMasterGroup.rotation.y += 0.003
      nucleusGroup.rotation.y += 0.007
      nucleusGroup.rotation.x += 0.0035

      // Nuclear breathing vibration (strong force simulation)
      nucleons.forEach((n, idx) => {
        const vib = 1 + 0.03 * Math.sin(clockTime * n.freq + idx)
        n.mesh.position.set(
          n.basePos.x * vib,
          n.basePos.y * vib,
          n.basePos.z * vib
        )
      })

      // Orbit electrons along 4D precessing rings
      ringsData.forEach((r, idx) => {
        // 4D Hyperspace rotation on rings
        const angleW = clockTime * (idx % 2 === 0 ? 0.6 : -0.6)
        r.mesh.rotation.x = r.config.rotX + Math.sin(angleW) * 0.28
        r.mesh.rotation.y = r.config.rotY + Math.cos(angleW) * 0.28
        r.mesh.rotation.z = r.config.rotZ + Math.sin(angleW * 0.5) * 0.2

        // Move electrons
        r.electrons.forEach((el) => {
          const currentAngle = clockTime * r.config.speed * 8 + el.angleOffset
          const ex = Math.cos(currentAngle) * r.config.radius
          const ez = Math.sin(currentAngle) * r.config.radius
          const p = new THREE.Vector3(ex, 0, ez)
          p.applyEuler(r.mesh.rotation)
          el.mesh.position.copy(p)
        })
      })

      // Quantum Cloud slow drift
      particleCloud.rotation.y += 0.0012
      particleCloud.rotation.z += 0.0008

      renderer.render(scene, camera)
      animId = requestAnimationFrame(animate)
    }

    animate()

    // Resize handling
    const handleResize = () => {
      if (!container) return
      width = container.clientWidth || window.innerWidth
      height = container.clientHeight || 750
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden w-full h-full"
      style={{ opacity: 0.92 }}
    />
  )
}
