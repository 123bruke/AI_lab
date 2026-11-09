'use client'

import Navbar from "@/components/navbar"
import SlideEffect from "@/components/slide-effect";
import TextBlurEffect from "@/components/text-blur-effect";
import AIWorkspace from "@/components/ai-workspace"
import HeroBackgroundCarousel from "@/components/hero-background-carousel"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link";

const settings = {
  headline: 'AFRO AI',
  mainCTA: {
    content: 'Explore the workspace',
    href: '#features'
  },
  secondaryCTA: {
    content: 'Meet AFROLAB',
    href: '#testimonials'
  },
}

export default function Hero() {
  return (
    <div className="space-y-12 md:space-y-20 lg:space-y-28 z-50 relative">
      <Navbar />

      <section className="hero-content relative isolate flex flex-col gap-8 items-center text-center lg:gap-11">
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
            <Link href={settings.mainCTA.href} className="w-full">
              <Button size='lg' className="glass-hover capitalize w-full hidden lg:flex">
                {settings.mainCTA.content}
                <ArrowRight />
              </Button>

              <Button size='default' className="glass-hover capitalize w-full flex lg:hidden">
                {settings.mainCTA.content}
                <ArrowRight />
              </Button>
            </Link>

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

        <SlideEffect className="relative w-full" isSpring={false} duration={1.3}>
          <AIWorkspace />
        </SlideEffect>
      </section>
    </div>
  )
}