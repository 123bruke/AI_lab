'use client'

import { useState } from 'react'
import Navbar from "@/components/navbar"
import SlideEffect from "@/components/slide-effect"
import TextBlurEffect from "@/components/text-blur-effect"
import AIWorkspace from "@/components/ai-workspace"
import HeroBackgroundCarousel from "@/components/hero-background-carousel"
import ThreeDBackgroundDesign from "@/components/three-d-background"
import { Button } from "@/components/ui/button"
import { ArrowRight, RotateCcw, FlaskConical } from "lucide-react"
import Link from "next/link"

const settings = {
  headline: 'AFRO Lab',
  mainCTA: {
    content: 'Explore the workspace',
    href: '#lab-workspace'
  },
  secondaryCTA: {
    content: 'Meet AFROLAB',
    href: '#testimonials'
  },
}

export default function Hero() {
  const [isLabFlipped, setIsLabFlipped] = useState(false)

  const handleExploreClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Flip to display the 3D Virtual Laboratory side
    setIsLabFlipped(true)
    const target = document.getElementById('lab-workspace')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="space-y-12 md:space-y-20 lg:space-y-28 z-50 relative">
      <Navbar />

      <section className="hero-content relative isolate flex flex-col gap-8 items-center text-center lg:gap-11">
        <ThreeDBackgroundDesign />
        <HeroBackgroundCarousel />

        {/* Headline */}
        <h1 className="text-black text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] font-medium tracking-[-0.06em] leading-none xl:max-w-none">
          <TextBlurEffect className="text-black">{settings.headline}</TextBlurEffect>
        </h1>

        {/* CTA */}
        <SlideEffect
          className="flex flex-col gap-4 md:gap-3 items-center justify-center w-full md:w-fit"
        >
          {/* Buttons */}
          <div className="flex flex-col md:flex-row items-center w-full justify-center gap-3 md:gap-4 mt-1">
            <button
              type="button"
              onClick={handleExploreClick}
              className="w-full"
              title="Click to flip the front section and display the full 3D Virtual Laboratory"
            >
              <Button size='lg' className="glass-hover capitalize w-full hidden lg:flex items-center gap-2">
                <span>{isLabFlipped ? '3D Laboratory Active (View)' : settings.mainCTA.content}</span>
                {isLabFlipped ? <FlaskConical size={18} /> : <ArrowRight size={18} />}
              </Button>

              <Button size='default' className="glass-hover capitalize w-full flex lg:hidden items-center gap-2">
                <span>{isLabFlipped ? '3D Lab Active' : settings.mainCTA.content}</span>
                {isLabFlipped ? <FlaskConical size={16} /> : <ArrowRight size={16} />}
              </Button>
            </button>

            <Link href={settings.secondaryCTA.href} className="w-full">
              <Button size='lg' className="glass-hover capitalize w-full hidden lg:flex" variant='secondary'>
                {settings.secondaryCTA.content}
              </Button>

              <Button size='default' className="glass-hover capitalize w-full flex lg:hidden" variant='secondary'>
                {settings.secondaryCTA.content}
              </Button>
            </Link>
          </div>
        </SlideEffect>

        {/* Two-Sided Laboratory Process & 3D Workbench */}
        <SlideEffect className="relative w-full" isSpring={false} duration={1.3}>
          <AIWorkspace
            isFlippedExternal={isLabFlipped}
            onToggleFlip={() => setIsLabFlipped(!isLabFlipped)}
          />
        </SlideEffect>
      </section>
    </div>
  )
}
