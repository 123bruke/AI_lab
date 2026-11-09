'use client'

import Card from "@/components/card"
import SlideEffect from "@/components/slide-effect"
import { Button } from "@/components/ui/button"
import { CircleCheck } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Explore AI context tools and start building your first agent.",
    features: [
      "One personal workspace",
      "Get started with AI agents",
      "Explore code and integrations",
      "Community support",
    ],
  },
  {
    name: "Builder",
    price: "$30",
    period: "per month",
    description: "For independent builders creating and shipping with AI.",
    features: [
      "Everything in Free",
      "More agent workflows",
      "Project context and code tools",
      "Connect your APIs",
    ],
    popular: true,
  },
  {
    name: "Studio",
    price: "$100",
    period: "per month",
    description: "For teams coordinating AI projects and integrations.",
    features: [
      "Everything in Builder",
      "Shared team workspace",
      "Expanded integrations",
      "Priority team support",
    ],
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="mx-auto space-y-6 text-center sm:space-y-7 md:space-y-8 lg:space-y-10">
      <SlideEffect>
        <h2 className="text-2xl font-medium leading-normal capitalize text-transparent bg-clip-text bg-gradient-to-b from-black to-black/60 md:text-4xl lg:text-header">
          Simple plans for every build
        </h2>
      </SlideEffect>

      <SlideEffect className="mx-auto w-full px-2 text-sm sm:px-10 md:max-w-3/4 md:px-0 lg:text-base">
        Start for free, then choose the plan that fits your AI development workflow.
      </SlideEffect>

      <div className="grid grid-cols-1 gap-6 text-left lg:grid-cols-3">
        {plans.map((plan, index) => (
          <SlideEffect key={plan.name} isSpring={false} delay={index * 0.1} className="h-full text-base">
            <Card className={`relative ${plan.popular ? "bg-secondary ring-1 ring-primary" : "bg-white"}`}>
              {plan.popular && (
                <span className="absolute right-6 top-6 rounded-full bg-accent px-3 py-1 text-xs font-medium text-black">
                  Most popular
                </span>
              )}
              <div className="text-xl font-medium text-black">{plan.name}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-black">{plan.price}</span>
                <span className="text-sm">{plan.period}</span>
              </div>
              <p className="min-h-12 text-sm text-black">{plan.description}</p>
              <Button className="w-full" variant={plan.popular ? "default" : "secondary"} asChild>
                <a href="#features">{plan.name === "Free" ? "Get started free" : `Choose ${plan.name}`}</a>
              </Button>
              <div className="w-full space-y-4 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">What&apos;s included</p>
                <ul className="flex flex-col items-start gap-4 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CircleCheck className="shrink-0 text-black" size={17} aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </SlideEffect>
        ))}
      </div>
      <p className="text-xs">Prices shown in USD. Paid plans are billed monthly.</p>
    </section>
  )
}
