'use client'

import Navbar from "@/components/navbar"
import SlideEffect from "@/components/slide-effect"
import TextBlurEffect from "@/components/text-blur-effect"
import HeroBackgroundCarousel from "@/components/hero-background-carousel"
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
    <div className="space-y-12 md:space-y-16 lg:space-y-24 z-20 relative">
      <Navbar />

      <section className="hero-content relative isolate flex flex-col gap-8 items-center text-center lg:gap-10 pb-8 sm:pb-12">
        <HeroBackgroundCarousel />

        {/* Headline */}
        <h1 className="text-neutral-900 dark:text-white text-6xl md:text-8xl lg:text-9xl xl:text-[9.5rem] font-medium tracking-[-0.06em] leading-none xl:max-w-none">
          <TextBlurEffect className="text-neutral-900 dark:text-white">{settings.headline}</TextBlurEffect>
        </h1>

        {/* Clean Call To Action Buttons */}
        <SlideEffect
          className="flex flex-col gap-4 md:gap-3 items-center justify-center w-full md:w-fit"
        >
          <div className="flex flex-col md:flex-row items-center w-full justify-center gap-3 md:gap-4 mt-1">
            <Link href={settings.mainCTA.href} className="w-full">
              <Button size='lg' className="capitalize w-full hidden lg:flex bg-neutral-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-full px-8 shadow-sm">
                <span>{settings.mainCTA.content}</span>
              </Button>

              <Button size='default' className="capitalize w-full flex lg:hidden bg-neutral-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-full px-6 shadow-sm">
                <span>{settings.mainCTA.content}</span>
              </Button>
            </Link>

            <Link href={settings.secondaryCTA.href} className="w-full">
              <Button size='lg' className="capitalize w-full hidden lg:flex rounded-full px-8" variant='secondary'>
                {settings.secondaryCTA.content}
              </Button>

              <Button size='default' className="capitalize w-full flex lg:hidden rounded-full px-6" variant='secondary'>
                {settings.secondaryCTA.content}
              </Button>
            </Link>
          </div>
        </SlideEffect>
      </section>
    </div>
  )
}
