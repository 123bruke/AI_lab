'use client'

import Badge from "@/components/badge"
import Card from "@/components/card"
import SlideEffect from "@/components/slide-effect"
import { ArrowDown, ArrowUp, Blocks, Bot, BrainCircuit, Braces, Network, Sparkles, Zap } from "lucide-react"

const providers = [
  { name: "GPT", icon: Bot },
  { name: "Anthropic", icon: Sparkles },
  { name: "DeepSeek", icon: BrainCircuit },
  { name: "Grok", icon: Zap },
]

export default function Features3() {
  return (
    <section className="space-y-6 text-center sm:space-y-7 md:space-y-8 lg:space-y-10">
      <SlideEffect>
        <Badge number={3} text="ONE CONNECTED AI STACK" />
      </SlideEffect>

      <SlideEffect>
        <h2 className="text-2xl font-medium leading-normal capitalize text-transparent bg-clip-text bg-gradient-to-b from-black to-black/60 md:text-4xl lg:text-header">
          Connect the tools you already use
        </h2>
      </SlideEffect>

      <SlideEffect className="mx-auto w-full px-2 text-sm sm:px-10 md:max-w-3/4 md:px-0 lg:text-base">
        Bring leading AI models and your own tools into a single workflow, then route each task to the right capability.
      </SlideEffect>

      <div className="grid grid-cols-1 gap-6 text-left lg:grid-cols-3">
        <SlideEffect direction="top" className="h-full" isSpring={false}>
          <Card>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-black"><Blocks size={21} /></div>
            <h3 className="text-xl font-medium text-black md:text-title">Choose your models</h3>
            <p>Work with the AI providers that fit your project and switch models as needs change.</p>
            <div className="grid w-full grid-cols-2 gap-2 pt-2">
              {providers.map(({ name, icon: Icon }) => (
                <div key={name} className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-black">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-black"><Icon size={16} strokeWidth={2} aria-hidden="true" /></span>
                  {name}
                </div>
              ))}
            </div>
          </Card>
        </SlideEffect>

        <SlideEffect direction="top" delay={0.15} className="h-full" isSpring={false}>
          <Card>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-black"><Braces size={21} /></div>
            <h3 className="text-xl font-medium text-black md:text-title">Integrate your APIs</h3>
            <p>Give agents access to your services with clear, reusable tool connections.</p>
            <div className="w-full space-y-2 rounded-xl border border-border bg-[#101815] p-4 font-mono text-xs leading-6 text-[#bde8cb]">
              <p><span className="text-[#8aa394]">const</span> tools = [</p>
              <p className="pl-4">projectAPI,</p>
              <p className="pl-4">knowledgeBase,</p>
              <p className="pl-4">deploymentPipeline</p>
              <p>]</p>
            </div>
          </Card>
        </SlideEffect>

        <SlideEffect direction="top" delay={0.3} className="h-full" isSpring={false}>
          <Card>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-black"><Network size={21} /></div>
            <h3 className="text-xl font-medium text-black md:text-title">Orchestrate the workflow</h3>
            <p>Coordinate context, models, and tools so each step moves your project forward.</p>
            <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white p-4 text-xs font-medium text-black">
              <span className="rounded-lg bg-secondary px-3 py-2">Plan</span>
              <ArrowDown className="text-black sm:hidden" size={16} />
              <ArrowUp className="hidden rotate-90 text-black sm:block" size={16} />
              <span className="rounded-lg bg-primary/20 px-3 py-2">Build</span>
              <ArrowDown className="text-black sm:hidden" size={16} />
              <ArrowUp className="hidden rotate-90 text-black sm:block" size={16} />
              <span className="rounded-lg bg-secondary px-3 py-2">Ship</span>
            </div>
          </Card>
        </SlideEffect>
      </div>
    </section>
  )
}
