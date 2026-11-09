'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FlaskConical,
  Flame,
  Droplet,
  RotateCcw,
  Sparkles,
  Check,
  ShieldCheck,
  Thermometer,
  Activity,
  Maximize2,
  Atom,
  Beaker,
  ChevronRight,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react'

const labProcessSteps = [
  { title: 'Reagent Preparation', desc: 'Dispensing 0.10M HCl & 0.10M NaOH into titration cell' },
  { title: 'Meniscus & Volume Tracking', desc: 'Digital optical tracking of burette fluid level at 25.0 mL' },
  { title: 'Calorimetric Exothermic Monitoring', desc: 'Enthalpy calculated at ΔH_rxn = -57.1 kJ/mol' },
  { title: 'Spectroscopic Absorption Peak', desc: 'Beer-Lambert analysis: λ_max = 525nm, A = 0.842 AU' },
]

interface AIWorkspaceProps {
  isFlippedExternal?: boolean
  onToggleFlip?: () => void
}

export default function AIWorkspace({ isFlippedExternal, onToggleFlip }: AIWorkspaceProps) {
  const [internalFlipped, setInternalFlipped] = useState(false)
  const isFlipped = isFlippedExternal !== undefined ? isFlippedExternal : internalFlipped

  const toggleFlip = () => {
    if (onToggleFlip) {
      onToggleFlip()
    } else {
      setInternalFlipped(!internalFlipped)
    }
  }

  // Live Laboratory Reaction Simulation State
  const [temperature, setTemperature] = useState(25.0)
  const [targetTemp, setTargetTemp] = useState(48.5)
  const [isHeating, setIsHeating] = useState(true)
  const [isStirring, setIsStirring] = useState(true)
  const [reagentDrops, setReagentDrops] = useState(6)
  const [phLevel, setPhLevel] = useState(7.0)
  const [activeStep, setActiveStep] = useState(0)

  // 3D Canvas Reference for the Back Side Lab
  const canvas3DRef = useRef<HTMLCanvasElement | null>(null)

  // Reaction Animation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature((curr) => {
        const diff = targetTemp - curr
        if (Math.abs(diff) < 0.2) {
          // Naturally oscillate slightly around target
          return Number((targetTemp + (Math.random() - 0.5) * 0.4).toFixed(1))
        }
        return Number((curr + diff * 0.08).toFixed(1))
      })
    }, 200)

    return () => clearInterval(interval)
  }, [targetTemp])

  // Step progression cycle
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % labProcessSteps.length)
    }, 3800)

    return () => clearInterval(stepInterval)
  }, [])

  // Interactive controls
  const handleHeatBurner = () => {
    setIsHeating(true)
    setTargetTemp((prev) => Math.min(95, prev + 12))
  }

  const handleCoolDown = () => {
    setIsHeating(false)
    setTargetTemp((prev) => Math.max(18, prev - 14))
  }

  const handleAddDroplet = () => {
    setReagentDrops((prev) => prev + 1)
    setPhLevel((prev) => Number(Math.min(13.5, prev + 0.6).toFixed(2)))
  }

  const handleResetReagents = () => {
    setTemperature(25.0)
    setTargetTemp(25.0)
    setPhLevel(7.0)
    setReagentDrops(0)
    setIsHeating(false)
  }

  // Render 3D Molecular / Apparatus simulation on back canvas
  useEffect(() => {
    if (!isFlipped) return
    const canvas = canvas3DRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let angleX = 0
    let angleY = 0

    const renderLab = () => {
      const w = (canvas.width = canvas.parentElement?.clientWidth || 700)
      const h = (canvas.height = canvas.parentElement?.clientHeight || 450)
      ctx.clearRect(0, 0, w, h)

      angleX += 0.012
      angleY += 0.008

      const cx = w / 2
      const cy = h / 2

      // Draw 3D Molecule (Benzene / Tetrahedral Complex)
      const nodes = [
        { x: -70, y: -70, z: 40, color: '#38bdf8', r: 12, label: 'C1' },
        { x: 70, y: -70, z: -40, color: '#6ECE9D', r: 14, label: 'N2' },
        { x: 70, y: 70, z: 40, color: '#ec4899', r: 13, label: 'O3' },
        { x: -70, y: 70, z: -40, color: '#a78bfa', r: 11, label: 'H4' },
        { x: 0, y: 0, z: 0, color: '#f59e0b', r: 18, label: 'Fe' },
        { x: 0, y: -110, z: 0, color: '#38bdf8', r: 9, label: 'H' },
        { x: 0, y: 110, z: 0, color: '#38bdf8', r: 9, label: 'H' },
      ]

      const proj = nodes.map((n) => {
        // Rot Y
        let x1 = n.x * Math.cos(angleY) - n.z * Math.sin(angleY)
        let z1 = n.x * Math.sin(angleY) + n.z * Math.cos(angleY)
        // Rot X
        let y2 = n.y * Math.cos(angleX) - z1 * Math.sin(angleX)
        let z2 = n.y * Math.sin(angleX) + z1 * Math.cos(angleX)

        const scale = 300 / (300 + z2 + 100)
        return {
          x: cx + x1 * scale,
          y: cy + y2 * scale,
          z: z2,
          r: n.r * scale,
          color: n.color,
          label: n.label,
        }
      })

      // Bonds
      for (let i = 0; i < proj.length; i++) {
        for (let j = i + 1; j < proj.length; j++) {
          if (i === 4 || j === 4 || (i < 4 && j < 4)) {
            ctx.beginPath()
            ctx.moveTo(proj[i].x, proj[i].y)
            ctx.lineTo(proj[j].x, proj[j].y)
            ctx.strokeStyle = 'rgba(110, 206, 157, 0.45)'
            ctx.lineWidth = 2.5
            ctx.stroke()
          }
        }
      }

      // Nodes
      proj.sort((a, b) => b.z - a.z).forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(3, p.r), 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 15
        ctx.fill()
        ctx.shadowBlur = 0

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 9px monospace'
        ctx.fillText(p.label, p.x - 6, p.y + 3)
      })

      animId = requestAnimationFrame(renderLab)
    }

    renderLab()
    return () => cancelAnimationFrame(animId)
  }, [isFlipped])

  return (
    <div id="lab-workspace" className="relative mx-auto w-full max-w-4xl [perspective:1400px]">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full rounded-3xl border border-border bg-white text-left shadow-2xl shadow-emerald-950/20 [transform-style:preserve-3d]"
      >
        {/* ========================================================= */}
        {/* FRONT SIDE: LABORATORY PROCESS SIMULATION & REACTION CHAMBER */}
        {/* ========================================================= */}
        <div
          className={`w-full overflow-hidden rounded-3xl transition-opacity duration-300 ${
            isFlipped ? 'invisible pointer-events-none absolute inset-0' : 'visible relative'
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-border bg-secondary/80 px-4 py-3 sm:px-6 backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-black">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600">
                <FlaskConical size={16} />
              </span>
              <span>AFRO LAB</span>
              <span className="text-gray-400">/</span>
              <span className="text-emerald-600 font-mono text-xs">reaction-chamber-sim</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 border border-emerald-500/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                LIVE SIMULATION
              </span>
            </div>

            {/* Flip to Full 3D Lab Button */}
            <button
              type="button"
              onClick={toggleFlip}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500 hover:text-black transition-all shadow-sm"
              title="Click to view the full 3D Virtual Laboratory workbench"
            >
              <span>Explore Full 3D Lab</span>
              <RotateCcw size={13} className="transition-transform group-hover:rotate-180" />
            </button>
          </div>

          {/* Main Visual Chamber Grid */}
          <div className="grid md:grid-cols-[1.2fr_0.8fr]">
            {/* Left: Dynamic Chemical Reaction Apparatus Simulation */}
            <div className="relative min-h-[380px] bg-[#0c1613] p-6 text-white flex flex-col justify-between overflow-hidden">
              {/* Background reaction blueprint glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent pointer-events-none" />

              {/* Live Telemetry HUD at top */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Thermometer size={16} className={temperature > 60 ? 'text-rose-400' : 'text-emerald-400'} />
                  <span>
                    Temp: <strong className="text-white text-sm">{temperature}°C</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-cyan-400" />
                  <span>
                    pH: <strong className="text-cyan-300 text-sm">{phLevel}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Droplet size={16} className="text-sky-400" />
                  <span>
                    Drops: <strong className="text-white">{reagentDrops}</strong>
                  </span>
                </div>
              </div>

              {/* Central Apparatus Animated Graphic */}
              <div className="relative my-4 flex items-center justify-center h-48">
                {/* Burette Tube (Top) with Dispensing Droplet */}
                <div className="absolute top-0 flex flex-col items-center">
                  <div className="w-4 h-16 rounded-t-sm border border-cyan-400/40 bg-cyan-500/10 relative overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-cyan-400/50" style={{ height: '65%' }} />
                  </div>
                  {/* Burette Nozzle */}
                  <div className="w-1.5 h-3 bg-gray-400" />
                  {/* Animated dripping droplet */}
                  <motion.div
                    animate={{ y: [0, 45], opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeIn' }}
                    className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50"
                  />
                </div>

                {/* Main Reaction Flask */}
                <div className="relative mt-16 flex flex-col items-center">
                  {/* Flask Body */}
                  <div className="relative w-32 h-28 border-2 border-emerald-400/50 rounded-b-3xl rounded-t-lg bg-emerald-950/20 backdrop-blur-sm overflow-hidden flex flex-col justify-end shadow-lg shadow-emerald-500/10">
                    {/* Liquid fill with dynamic bubbling */}
                    <div
                      className="w-full transition-all duration-700 relative overflow-hidden"
                      style={{
                        height: `${Math.min(85, 35 + reagentDrops * 4)}%`,
                        background:
                          phLevel > 8.5
                            ? 'linear-gradient(to top, #db2777, #ec4899)'
                            : 'linear-gradient(to top, #059669, #34d399)',
                      }}
                    >
                      {/* Fluid Meniscus wave */}
                      <div className="absolute -top-2 left-0 right-0 h-4 bg-white/20 rounded-full blur-[1px] animate-pulse" />

                      {/* Rising Reaction Bubbles */}
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            y: [30, -35],
                            x: [0, (i % 2 === 0 ? 8 : -8)],
                            opacity: [0, 0.9, 0],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: isHeating ? 1.0 + i * 0.2 : 2.2 + i * 0.3,
                            delay: i * 0.25,
                            ease: 'easeOut',
                          }}
                          className="absolute w-2 h-2 rounded-full bg-white/80 shadow-sm"
                          style={{ left: `${15 + i * 14}%`, bottom: 4 }}
                        />
                      ))}

                      {/* Magnetic Stirrer Bar */}
                      {isStirring && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
                          className="absolute bottom-2 left-1/2 -ml-3.5 w-7 h-2 rounded-full bg-white/90 shadow"
                        />
                      )}
                    </div>
                  </div>

                  {/* Bunsen Burner underneath */}
                  <div className="relative mt-2 flex flex-col items-center">
                    {/* Flame */}
                    {isHeating && (
                      <motion.div
                        animate={{ scale: [0.9, 1.15, 0.95], y: [-1, 2, -1] }}
                        transition={{ repeat: Infinity, duration: 0.4 }}
                        className="w-6 h-8 -mt-2 bg-gradient-to-t from-blue-600 via-cyan-400 to-amber-200 rounded-full blur-[1px] shadow-lg shadow-cyan-400/50"
                      />
                    )}
                    {/* Burner Stand */}
                    <div className="w-10 h-3 bg-gray-600 rounded-t-sm" />
                    <div className="w-16 h-2 bg-gray-700 rounded-sm" />
                  </div>
                </div>
              </div>

              {/* Quick Chemical Action Buttons */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-emerald-500/20 pt-3">
                <button
                  type="button"
                  onClick={handleHeatBurner}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300 hover:bg-amber-500/20 transition-colors"
                >
                  <Flame size={13} className="text-amber-400" />
                  <span>Heat Flame</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddDroplet}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                >
                  <Droplet size={13} className="text-cyan-400" />
                  <span>Titrate 1mL</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsStirring(!isStirring)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                >
                  <RotateCcw size={13} className={isStirring ? 'animate-spin' : ''} />
                  <span>{isStirring ? 'Stirring' : 'Stir Off'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCoolDown}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs text-sky-300 hover:bg-sky-500/20 transition-colors"
                >
                  <span>Cool Down</span>
                </button>
              </div>
            </div>

            {/* Right: Step-by-Step Laboratory Process Pipeline */}
            <div className="flex flex-col justify-between bg-secondary/50 p-6 sm:p-7">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-black">
                    <Sparkles size={16} className="text-emerald-600" />
                    <span>Laboratory Process Workflow</span>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Step {activeStep + 1} of 4
                  </span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  Real-time protocol execution supervised by autonomous laboratory agents.
                </p>

                {/* Process Steps */}
                <ol className="mt-5 space-y-3.5">
                  {labProcessSteps.map((step, idx) => {
                    const isDone = idx < activeStep
                    const isCurrent = idx === activeStep
                    return (
                      <motion.li
                        key={step.title}
                        initial={false}
                        animate={{
                          opacity: isCurrent ? 1 : isDone ? 0.8 : 0.45,
                          x: isCurrent ? 4 : 0,
                        }}
                        className={`flex items-start gap-3 rounded-xl p-2.5 transition-colors ${
                          isCurrent
                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                            : 'hover:bg-muted/40'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-emerald-500 text-black shadow-sm'
                              : 'bg-muted text-gray-500'
                          }`}
                        >
                          {isDone ? <Check size={13} /> : idx + 1}
                        </span>
                        <div>
                          <h5 className="text-xs font-semibold text-black">{step.title}</h5>
                          <p className="text-[11px] text-gray-600 leading-snug mt-0.5">{step.desc}</p>
                        </div>
                      </motion.li>
                    )
                  })}
                </ol>
              </div>

              {/* Bottom Safety & Calibration Badge */}
              <div className="mt-6 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span className="font-medium">Safety Auditor Verified</span>
                </div>
                <span className="font-mono text-[11px]">GHS 07 Pass</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* REVERSE SIDE: FULL 3D VIRTUAL LABORATORY WORKBENCH */}
        {/* ========================================================= */}
        <div
          className={`w-full overflow-hidden rounded-3xl bg-[#08100d] text-white transition-opacity duration-300 [transform:rotateY(180deg)] ${
            !isFlipped ? 'invisible pointer-events-none absolute inset-0' : 'visible relative'
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-emerald-500/20 bg-[#0e1a16] px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <Atom size={18} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>AFRO 3D Interactive Virtual Laboratory</span>
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-mono text-emerald-300">
                    4D Cinema View
                  </span>
                </h4>
              </div>
            </div>

            {/* Flip Back Button */}
            <button
              type="button"
              onClick={toggleFlip}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500 hover:text-black transition-all"
            >
              <RotateCcw size={13} />
              <span>Back to Process</span>
            </button>
          </div>

          {/* Workbench Body */}
          <div className="p-6 grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
            {/* Left: 3D Molecule & Interactive Canvas */}
            <div className="relative min-h-[340px] rounded-2xl border border-emerald-500/20 bg-black/40 overflow-hidden flex flex-col justify-between p-4">
              <canvas ref={canvas3DRef} className="absolute inset-0 w-full h-full block" />

              {/* Floating Workbench Badges */}
              <div className="relative z-10 flex items-center justify-between text-xs">
                <span className="rounded-full border border-emerald-500/30 bg-black/60 px-3 py-1 text-emerald-300 font-mono">
                  Active Molecule: Fe-Complex [C4H4NO3]
                </span>
                <span className="rounded-full border border-cyan-500/30 bg-black/60 px-3 py-1 text-cyan-300 font-mono">
                  3D Coordinates Active
                </span>
              </div>

              {/* Bottom Interactive Controls */}
              <div className="relative z-10 flex flex-wrap items-center gap-2 text-xs font-medium">
                <span className="text-gray-400 mr-1">Reagents:</span>
                <button
                  onClick={() => handleAddDroplet()}
                  className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-emerald-300 hover:bg-emerald-500 hover:text-black transition-all"
                >
                  + HCl (0.1M)
                </button>
                <button
                  onClick={() => handleAddDroplet()}
                  className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-1 text-cyan-300 hover:bg-cyan-500 hover:text-black transition-all"
                >
                  + NaOH (0.1M)
                </button>
                <button
                  onClick={() => handleAddDroplet()}
                  className="rounded-lg bg-pink-500/20 border border-pink-500/40 px-2.5 py-1 text-pink-300 hover:bg-pink-500 hover:text-black transition-all"
                >
                  + CuSO4
                </button>
                <button
                  onClick={handleResetReagents}
                  className="rounded-lg bg-gray-800 border border-gray-600 px-2 py-1 text-gray-300 hover:bg-gray-700 transition-all ml-auto"
                >
                  Clear Flask
                </button>
              </div>
            </div>

            {/* Right: Lab Telemetry & Agents Panel */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4">
                <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity size={14} />
                  <span>Physical State Telemetry</span>
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="rounded-lg bg-black/40 p-2 border border-emerald-500/10">
                    <span className="text-gray-400 block text-[10px]">Temperature</span>
                    <span className="text-emerald-300 font-bold">{temperature} °C</span>
                  </div>
                  <div className="rounded-lg bg-black/40 p-2 border border-emerald-500/10">
                    <span className="text-gray-400 block text-[10px]">pH Reading</span>
                    <span className="text-cyan-300 font-bold">{phLevel}</span>
                  </div>
                  <div className="rounded-lg bg-black/40 p-2 border border-emerald-500/10">
                    <span className="text-gray-400 block text-[10px]">Enthalpy ΔH</span>
                    <span className="text-pink-300 font-bold">-57.1 kJ</span>
                  </div>
                  <div className="rounded-lg bg-black/40 p-2 border border-emerald-500/10">
                    <span className="text-gray-400 block text-[10px]">Absorbance</span>
                    <span className="text-yellow-300 font-bold">0.842 AU</span>
                  </div>
                </div>
              </div>

              {/* Autonomous Agents Status */}
              <div className="rounded-2xl border border-emerald-500/20 bg-black/30 p-4 text-xs space-y-2">
                <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block">
                  Active Multi-Agent Observers (10)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-emerald-500/15 text-emerald-300 px-2 py-0.5 text-[10px]">
                    ✓ Diagram Agent
                  </span>
                  <span className="rounded-md bg-emerald-500/15 text-emerald-300 px-2 py-0.5 text-[10px]">
                    ✓ Safety Auditor
                  </span>
                  <span className="rounded-md bg-emerald-500/15 text-emerald-300 px-2 py-0.5 text-[10px]">
                    ✓ Report Agent
                  </span>
                  <span className="rounded-md bg-emerald-500/15 text-emerald-300 px-2 py-0.5 text-[10px]">
                    ✓ Vision YOLOv8
                  </span>
                </div>
              </div>

              {/* Action: Open Full Standalone Laboratory */}
              <a
                href="/"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
              >
                <Maximize2 size={15} />
                <span>Open Full 4D Laboratory View</span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
