'use client'

import { useRef } from 'react'
import { useScroll, useTransform } from 'motion/react'
import * as motion from 'motion/react-m'
import { Check, Circle, Code2, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

const codeLines = [
  'const agent = createAgent({',
  '  goal: "ship a helpful AI assistant",',
  '  tools: [search, database, deploy],',
  '  context: await loadProjectContext(),',
  '})',
  '',
  'await agent.buildAndDeploy()',
]

const actions = ['Understand project context', 'Write and review code', 'Connect tools and APIs', 'Deploy agent workspace']
const codeText = codeLines.join('\n')

export default function AIWorkspace() {
  const workspaceRef = useRef<HTMLDivElement>(null)
  const [visibleCharacters, setVisibleCharacters] = useState(0)
  const { scrollYProgress } = useScroll({
    target: workspaceRef,
    offset: ['start 90%', 'end 10%'],
  })
  const scale = useTransform(scrollYProgress, [0, 0.45, 1], [0.9, 1, 0.96])
  const rotateX = useTransform(scrollYProgress, [0, 0.45, 1], [4, 0, 0])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setVisibleCharacters((current) => current >= codeText.length ? 0 : current + 1)
    }, visibleCharacters >= codeText.length ? 1400 : 34)

    return () => window.clearTimeout(timeout)
  }, [visibleCharacters])

  return (
    <motion.div
      ref={workspaceRef}
      style={{ scale, rotateX, transformPerspective: 1000 }}
      className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-white text-left shadow-2xl shadow-emerald-950/10"
    >
      <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 text-sm font-medium text-black">
          <Code2 size={16} className="text-black" />
          <span>AFROLAB</span>
          <span className="text-foreground">/ agent-workspace</span>
        </div>
      </div>

      <div className="grid md:grid-cols-[1.15fr_0.85fr]">
        <div className="min-h-64 bg-[#101815] p-5 font-mono text-xs leading-7 text-[#d7e7df] sm:p-7 sm:text-sm">
          <div className="mb-4 flex items-center gap-2 text-[#91a69b]">
            <Circle size={10} fill="#111" className="text-black" />
            <Circle size={10} fill="#111" className="text-black" />
            <Circle size={10} fill="#111" className="text-black" />
            <span className="ml-2">agent.ts</span>
          </div>
          {codeLines.map((line, index) => {
            const lineStart = codeLines.slice(0, index).reduce((total, previous) => total + previous.length + 1, 0)
            const charactersInLine = Math.max(0, Math.min(line.length, visibleCharacters - lineStart))
            const caretVisible = visibleCharacters >= lineStart && visibleCharacters <= lineStart + line.length

            return (
              <div key={`${line}-${index}`} className="flex min-h-7">
                <span className="mr-5 w-4 select-none text-right text-[#65766d]">{index + 1}</span>
                <span className="whitespace-pre text-[#bde8cb]">
                  {line.slice(0, charactersInLine)}
                </span>
                {caretVisible && <span className="code-caret ml-0.5 text-primary">|</span>}
              </div>
            )
          })}
        </div>

        <div className="flex flex-col justify-center gap-5 bg-secondary p-5 sm:p-7">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-black">
              <Sparkles size={16} className="text-black" />
              Agent progress
            </div>
            <p className="text-xs leading-5 text-foreground">From a clear brief to a working AI agent.</p>
          </div>
          <ol className="space-y-3">
            {actions.map((action, index) => (
              <motion.li
                key={action}
                initial={{ opacity: 0.35, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.55, duration: 0.45, repeat: Infinity, repeatDelay: 2.2 }}
                className="flex items-center gap-3 text-xs text-black sm:text-sm"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-black">
                  <Check size={14} />
                </span>
                {action}
              </motion.li>
            ))}
          </ol>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: ['12%', '100%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
