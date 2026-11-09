'use client'

import Image from "next/image"
import { useEffect, useState } from "react"

const slides = [
  { src: "/afrolab-laptop.svg", alt: "AI development workspace displayed on a laptop" },
  { src: "/afrolab-phone.svg", alt: "AI workspace displayed on a smartphone" },
  { src: "/afrolab-tablet.svg", alt: "AI workspace displayed on a tablet" },
]

export default function HeroBackgroundCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 2000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="hero-image-carousel" aria-hidden="true">
      {slides.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={index === 0}
          sizes="(max-width: 768px) 100vw, 1050px"
          className={index === activeIndex ? "is-active" : ""}
        />
      ))}
    </div>
  )
}
