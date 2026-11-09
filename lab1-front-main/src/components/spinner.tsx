'use client'

import * as motion from "motion/react-m"
import { Bot, BrainCircuit, Braces, Cpu, FlaskConical, Network, PlugZap, Sparkles, Zap } from "lucide-react"
import { cn } from '@/lib/utils'

interface SpinnerProps {
  labels: string[]
  className?: string
}

const providerIcons = [Bot, BrainCircuit, Network, Zap, Sparkles, PlugZap, FlaskConical, Braces, Cpu]

export default function Spinner({ labels, className }: SpinnerProps) {
  const size = 360
  const radius = 126
  const center = size / 2

  return (
    <div className={cn("relative mx-auto h-[360px] w-full max-w-[360px] flex-none", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      >
        <div className="absolute inset-[54px] rounded-full border border-dashed border-border" />
        {labels.map((label, index) => {
          const angle = (index * 360) / labels.length - 90
          const radians = (angle * Math.PI) / 180
          const x = center + radius * Math.cos(radians)
          const y = center + radius * Math.sin(radians)
          const Icon = providerIcons[index % providerIcons.length]

          return (
            <motion.div
              key={label}
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: x, top: y }}
            >
              <div className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-black shadow-md shadow-black/5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-black">
                  <Icon size={16} strokeWidth={2} aria-hidden="true" />
                </span>
                {label}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
      <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-secondary text-black">
        <FlaskConical size={30} strokeWidth={1.8} aria-label="AFROLAB" />
      </div>
    </div>
  )
}
