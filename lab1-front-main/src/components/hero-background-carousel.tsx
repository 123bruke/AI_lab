'use client'

import Image from "next/image"
import { useEffect, useState } from "react"

const slides = [
  {
    src: "/lab-chemistry-bench.svg",
    title: "Chemistry Synthesis & Calorimetry Laboratory",
    alt: "Chemistry laboratory with distillation apparatus, Bunsen burner, and chemical reagents",
    badge: "Chemistry Lab"
  },
  {
    src: "/lab-physics-optics.svg",
    title: "Quantum Optics & Laser Physics Laboratory",
    alt: "Physics laboratory with laser beam splitters, prism diffraction, and oscilloscope telemetry",
    badge: "Physics Lab"
  },
  {
    src: "/lab-biochem-analytics.svg",
    title: "Analytical Spectrophotometry & Titration Workstation",
    alt: "Analytical chemistry laboratory with UV-Vis spectrophotometer and precision auto-burette",
    badge: "Biochemistry Lab"
  },
]

export default function HeroBackgroundCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 4500)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="hero-image-carousel relative overflow-hidden rounded-3xl border border-emerald-500/20 shadow-2xl shadow-emerald-950/20" aria-hidden="true">
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="(max-width: 768px) 100vw, 1050px"
            className="object-cover object-center"
          />
          {/* Subtle laboratory ambient gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Laboratory badge indicator */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-black/60 px-3.5 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{slide.title}</span>
          </div>
        </div>
      ))}

      {/* Slide dots indicator */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-label={`Jump to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? "w-6 bg-emerald-400" : "w-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
