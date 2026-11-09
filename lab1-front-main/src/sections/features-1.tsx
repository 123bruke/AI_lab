'use client'

import Badge from "@/components/badge"
import Card from "@/components/card"
import SlideEffect from "@/components/slide-effect"
import { CloudUpload, Code2, PlugZap } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Deploy your agent",
    content: "Take your AI from prototype to production with a clear, repeatable path to launch.",
    icon: CloudUpload,
    label: "READY TO SHIP",
  },
  {
    number: "02",
    title: "Write code with context",
    content: "Give your coding agent the project knowledge it needs to make useful, consistent changes.",
    icon: Code2,
    label: "CONTEXT-AWARE",
  },
  {
    number: "03",
    title: "Connect your tools",
    content: "Bring models, APIs, and everyday developer tools into one coordinated AI workflow.",
    icon: PlugZap,
    label: "TOOLS CONNECTED",
  },
]

export default function Features1() {
  return (
    <section id="features" className="space-y-6 sm:space-y-7 md:space-y-8 lg:space-y-10 text-center">
      <SlideEffect>
        <Badge number={1} text="FROM IDEA TO LAUNCH" />
      </SlideEffect>

      <SlideEffect>
        <h2 className="text-2xl font-medium leading-none capitalize text-transparent bg-clip-text bg-gradient-to-b from-black to-black/60 md:text-4xl lg:text-header">
          Build, deploy, and connect AI
        </h2>
      </SlideEffect>

      <SlideEffect className="mx-auto w-full px-2 text-sm sm:px-10 md:max-w-3/4 md:px-0 lg:text-base">
        AFROLAB brings the essential parts of agent development together: writing code, shipping reliable deployments, and integrating the tools your team already uses.
      </SlideEffect>

      <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-3">
        {steps.map(({ number, title, content, icon: Icon, label }, index) => (
          <SlideEffect key={number} direction="top" delay={index * 0.12} isSpring={false} className="h-full">
            <Card>
              <div className="flex w-full items-center justify-between">
                <span className="text-xs font-medium tracking-[0.16em] text-foreground">{number} / 03</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-black">
                  <Icon size={21} />
                </span>
              </div>
              <h3 className="text-xl font-medium text-black md:text-title">{title}</h3>
              <p className="min-h-20 text-sm leading-6">{content}</p>
              <div className="mt-auto flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-[11px] font-semibold tracking-wider text-black">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {label}
              </div>
            </Card>
          </SlideEffect>
        ))}
      </div>
    </section>
  )
}
