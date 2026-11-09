'use client'

import Navbar from "@/components/navbar"
import SlideEffect from "@/components/slide-effect"
import TextBlurEffect from "@/components/text-blur-effect"
import UltraCinemaAtom4D from "@/components/ultra-cinema-atom-4d"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const settings = {
  headline: 'AFRO Lab',
  mainCTA: {
    content: 'Launch Virtual Lab',
    href: '/'
  },
  secondaryCTA: {
    content: 'Explore Features',
    href: '#features'
  },
}

export default function Hero() {
  return (
    <div className="relative min-h-[82vh] md:min-h-[88vh] flex flex-col justify-between z-20 pb-12 sm:pb-16 overflow-hidden">
      {/* 4D Ultra Cinema Atomic Universe Background (Large, Moving Protons, Neutrons & Electrons) */}
      <UltraCinemaAtom4D />

      {/* Top Navbar */}
      <Navbar />

      {/* Center Content floating over the 4D Ultra Cinema Atom */}
      <section className="hero-content relative z-10 flex flex-col gap-7 md:gap-9 items-center text-center my-auto py-8 sm:py-12">
        {/* Cinema Sub-badge */}
        <SlideEffect>
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white/70 px-4 py-1.5 text-xs font-medium text-neutral-800 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-black/60 dark:text-neutral-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>4D Ultra Cinema • Quantum Molecular Environment</span>
          </div>
        </SlideEffect>

        {/* Headline */}
        <h1 className="text-neutral-900 dark:text-white text-6xl md:text-8xl lg:text-9xl xl:text-[9.5rem] font-medium tracking-[-0.06em] leading-none xl:max-w-none drop-shadow-sm select-none">
          <TextBlurEffect className="text-neutral-900 dark:text-white">{settings.headline}</TextBlurEffect>
        </h1>

        {/* Clean Call To Action Buttons */}
        <SlideEffect
          className="flex flex-col gap-4 md:gap-3 items-center justify-center w-full md:w-fit"
        >
          <div className="flex flex-col md:flex-row items-center w-full justify-center gap-3 md:gap-4 mt-2">
            <Link href={settings.mainCTA.href} className="w-full">
              <Button size='lg' className="capitalize w-full hidden lg:flex bg-neutral-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-full px-8 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all">
                <span>{settings.mainCTA.content}</span>
              </Button>

              <Button size='default' className="capitalize w-full flex lg:hidden bg-neutral-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-full px-6 shadow-md">
                <span>{settings.mainCTA.content}</span>
              </Button>
            </Link>

            <Link href={settings.secondaryCTA.href} className="w-full">
              <Button size='lg' className="capitalize w-full hidden lg:flex rounded-full px-8 backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800" variant='secondary'>
                {settings.secondaryCTA.content}
              </Button>

              <Button size='default' className="capitalize w-full flex lg:hidden rounded-full px-6 backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800" variant='secondary'>
                {settings.secondaryCTA.content}
              </Button>
            </Link>
          </div>
        </SlideEffect>
      </section>

      {/* Subtle bottom spacing to transition smoothly to next section */}
      <div className="h-6" />
    </div>
  )
}
