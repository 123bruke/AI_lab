'use client'

import { type FormEvent, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import * as motion from 'motion/react-m'
import { ArrowUp, X, FlaskConical, Bot } from 'lucide-react'

type Message = {
  id: number
  role: 'assistant' | 'user'
  text: string
}

function getReply(message: string) {
  const text = message.toLowerCase()
  if (text.includes('titrat') || text.includes('ph') || text.includes('acid') || text.includes('base')) {
    return 'For acid-base neutralization (HCl + NaOH → NaCl + H₂O), equivalence occurs at pH 7.00. Phenolphthalein transitions to vibrant magenta between pH 8.2 and 10.0.'
  }
  if (text.includes('temp') || text.includes('heat') || text.includes('calorimet') || text.includes('enthalpy')) {
    return 'Calorimetric calculation: q = m · C_s · ΔT. Neutralization of strong acid with strong base yields an exothermic enthalpy of ΔH_rxn = -57.1 kJ/mol.'
  }
  if (text.includes('spectro') || text.includes('absorb') || text.includes('beer') || text.includes('light')) {
    return 'Beer-Lambert Law: A = ε · b · c. For copper sulfate (CuSO₄), absorption peaks at λ_max = 810 nm. For permanganate, λ_max = 525 nm.'
  }
  if (text.includes('safe') || text.includes('hazard') || text.includes('msds') || text.includes('ghs')) {
    return 'The Safety Auditor Agent continuously monitors reaction chambers for thermal runaway, pressure spikes, and requires Level 4 PPE compliance.'
  }
  return 'I am monitoring the virtual chemistry and physics bench. Let me know if you would like me to balance a reaction, compute molar yields, or adjust burner temperature!'
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      text: 'Greetings, Scientist! I’m your AFRO Lab Research Assistant. Ask me about reaction stoichiometry, UV-Vis spectroscopy, calorimetry, or 3D apparatus setup!',
    },
  ])
  const nextId = useRef(2)
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
  }, [])

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = input.trim()
    if (!text || isTyping) return

    setMessages((current) => [...current, { id: nextId.current++, role: 'user', text }])
    setInput('')
    setIsTyping(true)
    typingTimeout.current = setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: nextId.current++, role: 'assistant', text: getReply(text) },
      ])
      setIsTyping(false)
      typingTimeout.current = null
    }, 600)
  }

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            aria-label="AFRO Lab AI research assistant"
            className="flex h-[min(520px,72vh)] w-[min(370px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#0c1613] text-white shadow-2xl backdrop-blur-xl"
          >
            <header className="flex items-center justify-between bg-[#11221b] border-b border-emerald-500/20 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-black">
                  <FlaskConical size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">AFRO Lab AI Assistant</p>
                  <p className="text-xs text-emerald-400">Virtual Chemistry &amp; Physics</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="rounded-full p-2 text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-[#08100d] p-4 text-xs" aria-live="polite">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <p
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-5 ${
                      message.role === 'user'
                        ? 'bg-emerald-500 text-black font-medium'
                        : 'bg-[#14261f] text-gray-200 border border-emerald-500/20'
                    }`}
                  >
                    {message.text}
                  </p>
                </div>
              ))}
              {isTyping && (
                <div
                  className="flex items-center gap-1 rounded-2xl bg-[#14261f] px-4 py-3 w-fit border border-emerald-500/20"
                  aria-label="Assistant is analyzing"
                >
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:240ms]" />
                </div>
              )}
            </div>

            <form
              onSubmit={sendMessage}
              className="flex items-center gap-2 border-t border-emerald-500/20 bg-[#0d1a15] p-3"
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about reactions, spectroscopy, or calorimetry..."
                aria-label="Type a laboratory question"
                className="min-w-0 flex-1 rounded-full bg-black/50 border border-emerald-500/20 px-4 py-2 text-xs text-white outline-none placeholder:text-gray-500 focus:border-emerald-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                <ArrowUp size={16} />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close AFRO Lab chat' : 'Open AFRO Lab chat'}
        aria-expanded={isOpen}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg shadow-emerald-950/40 transition-transform hover:scale-105"
      >
        <FlaskConical size={24} />
      </motion.button>
    </div>
  )
}
