'use client'

import * as motion from "motion/react-m"

export default function TextBlurEffect({ children, className }: { children: string; className?: string }) {
  const words = children.split(' ')

  return (
    words.map((word, wordIndex) => (
      <span
        key={`${word}-${wordIndex}`}
        className="inline-block whitespace-nowrap"
        style={{ marginRight: wordIndex < words.length - 1 ? '0.24em' : undefined }}
      >
        {word.split('').map((char, charIndex) => (
          <motion.span
            style={{ display: 'inline-block' }}
            key={`${char}-${charIndex}`}
            initial={{ opacity: 0, filter: 'blur(32px)', scale: 0.9, y: 20 }}
            animate={{ opacity: 1, filter: 'blur(0)', scale: 1, y: 0 }}
            transition={{ delay: (wordIndex * 5 + charIndex) * 0.035, ease: [1, 0, 0, 1], duration: 0.7 }}
            className={className}
          >
            {char}
          </motion.span>
        ))}
      </span>
    ))
  )
}