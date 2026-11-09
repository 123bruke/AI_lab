'use client'

import Badge from "@/components/badge"
import Card from "@/components/card"
import SlideEffect from "@/components/slide-effect"
import { Activity, ArrowUpRight, BrainCircuit, Check, Clock3, Sparkles } from "lucide-react"

const activity = [
  "Reading project context",
  "Planning implementation",
  "Writing a code change",
  "Running quality checks",
]

export default function Features2() {
  return (
    <section className="space-y-6 text-center sm:space-y-7 md:space-y-8 lg:space-y-10">
      <SlideEffect>
        <Badge number={2} text="UNLOCK KEY INSIGHTS" />
      </SlideEffect>

      <SlideEffect>
        <h2 className="text-2xl font-medium leading-normal capitalize text-transparent bg-clip-text bg-gradient-to-b from-black to-black/60 md:text-4xl lg:text-header">
          Unlock Key Insights
        </h2>
      </SlideEffect>

      <SlideEffect className="mx-auto w-full px-2 text-sm sm:px-10 md:max-w-3/4 md:px-0 lg:text-base">
        Follow the work as your AI understands a task, writes code, checks its results, and prepares the next step.
      </SlideEffect>

      <div className="grid grid-cols-1 gap-6 text-left lg:grid-cols-2">
        <SlideEffect direction="right" className="h-full" isSpring={false}>
          <Card>
            <div className="flex w-full items-center justify-between">
              <h3 className="text-xl font-medium text-black md:text-title">Agent activity</h3>
              <span className="flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-black">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> LIVE
              </span>
            </div>
            <p>Understand the steps behind each result and see what your agent is working on now.</p>
            <div className="w-full space-y-3 rounded-xl border border-border bg-white p-4">
              {activity.map((item, index) => (
                <div key={item} className="flex items-center gap-3 text-sm text-black">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-black">
                    {index < 3 ? <Check size={15} /> : <Clock3 size={15} />}
                  </span>
                  <span className="flex-1">{item}</span>
                  {index === 2 && <span className="text-xs text-black">in progress</span>}
                </div>
              ))}
            </div>
          </Card>
        </SlideEffect>

        <SlideEffect direction="left" duration={1.1} className="h-full" isSpring={false}>
          <Card>
            <div className="flex w-full items-center justify-between">
              <h3 className="text-xl font-medium text-black md:text-title">Context that compounds</h3>
              <BrainCircuit className="text-black" size={23} />
            </div>
            <p>Keep your project knowledge, connected tools, and agent tasks working together.</p>
            <div className="relative flex min-h-56 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-5">
              <div className="absolute h-36 w-36 rounded-full bg-primary/15 blur-2xl" />
              <div className="relative grid w-full max-w-sm grid-cols-2 gap-3">
                {[
                  { label: "Project context", icon: BrainCircuit },
                  { label: "AI agent", icon: Sparkles },
                  { label: "Connected tools", icon: Activity },
                  { label: "Useful outcomes", icon: ArrowUpRight },
                ].map(({ label, icon: Icon }, index) => (
                  <div key={label} className={`flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-3 text-xs font-medium text-black ${index === 1 ? "ring-1 ring-primary" : ""}`}>
                    <Icon size={15} className="shrink-0 text-black" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </SlideEffect>
      </div>
    </section>
  )
}
