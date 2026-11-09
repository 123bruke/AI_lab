'use client'

import SlideEffect from "@/components/slide-effect"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const settings = {
  title: 'Frequently asked questions',
  faqs: [
    {
      question: 'What is AFRO AI Context Manager?',
      answer: 'AFRO AI Context Manager is an AI workspace for bringing project context, coding agents, and connected tools together.',
    },
    {
      question: 'Can I use different AI models?',
      answer: 'The workspace is designed to connect AI providers and tools so you can coordinate the capabilities that fit your project.',
    },
    {
      question: 'Can AFROLAB help with deployment?',
      answer: 'Yes. Use the agent workflow to move from planning and code generation through checks and deployment.',
    },
    {
      question: 'How do I get started?',
      answer: 'Describe what you want to build, add the project context and tools your agent needs, then iterate on the result.',
    },
  ]
}

export default function FAQ() {
  return (
    <div id='faq' className="space-y-6 sm:space-y-7 md:space-y-8 lg:space-y-10 mx-auto text-center">
      {/* Title */}
      <SlideEffect>
        <h2 className="text-2xl md:text-4xl lg:text-header capitalize text-transparent bg-clip-text bg-gradient-to-b from-black to-black/60 font-medium leading-normale">{settings.title}</h2>
      </SlideEffect>

      {/* Accordion */}
      <SlideEffect>
        <Accordion type="single" collapsible className="max-w-2xl mx-auto text-base text-black">
          {settings.faqs.map((faq, index) => (
            <AccordionItem key={index} value={index + '-item'}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SlideEffect>
    </div>
  )
}