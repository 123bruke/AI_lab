'use client'

import Badge from "@/components/badge"
import Card from "@/components/card"
import SlideEffect from "@/components/slide-effect"
import { FlaskConical, Atom, Database } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Virtual Laboratory Simulation",
    content: "Interact with 3D chemistry apparatus, Bunsen burners, spectrophotometers, and real-time physical reaction chambers.",
    icon: FlaskConical,
    label: "3D SIMULATION",
  },
  {
    number: "02",
    title: "10 Autonomous AI Agents",
    content: "Specialized scientific agents handle stoichiometry balancing, safety audits, Beer-Lambert optics, and academic report writing.",
    icon: Atom,
    label: "MULTI-AGENT AI",
  },
  {
    number: "03",
    title: "ChromaDB Hybrid Search",
    content: "Combine dense scientific embeddings with BM25 keyword matching across MSDS protocols, chemical libraries, and lab archives.",
    icon: Database,
    label: "HYBRID VECTOR DB",
  },
]

export default function Features1() {
  return (
    <section id="features" className="space-y-6 sm:space-y-7 md:space-y-8 lg:space-y-10 text-center">
      <SlideEffect>
        <Badge number={1} text="DISCOVERY & SIMULATION" />
      </SlideEffect>

      <SlideEffect>
        <h2 className="text-2xl font-medium leading-none capitalize text-transparent bg-clip-text bg-gradient-to-b from-black to-black/60 md:text-4xl lg:text-header">
          Simulate, Analyze, and Discover with AFRO Lab
        </h2>
      </SlideEffect>

      <SlideEffect className="mx-auto w-full px-2 text-sm sm:px-10 md:max-w-3/4 md:px-0 lg:text-base">
        AFRO Lab brings the essential parts of modern virtual experimentation together: real-time 3D apparatus mechanics, autonomous multi-agent guidance, and deep scientific database telemetry.
      </SlideEffect>

      <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-3">
        {steps.map(({ number, title, content, icon: Icon, label }, index) => (
          <SlideEffect key={number} direction="top" delay={index * 0.12} isSpring={false} className="h-full">
            <Card>
              <div className="flex w-full items-center justify-between">
                <span className="text-xs font-medium tracking-[0.16em] text-foreground">{number} / 03</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
              </div>

              <div className="space-y-2 mt-2">
                <span className="text-[11px] font-medium tracking-wider text-neutral-500 uppercase">{label}</span>
                <h3 className="text-base font-semibold text-black dark:text-white">{title}</h3>
                <p className="text-xs leading-relaxed text-foreground">{content}</p>
              </div>
            </Card>
          </SlideEffect>
        ))}
      </div>
    </section>
  )
}
