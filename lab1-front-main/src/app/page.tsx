import CTA from "@/sections/cta";
import FAQ from "@/sections/faq";
import Features1 from "@/sections/features-1";
import Features2 from "@/sections/features-2";
import Features3 from "@/sections/features-3";
import Features4 from "@/sections/features-4";
import Footer from "@/sections/footer";
import Hero from "@/sections/hero";
import Pricing from "@/sections/pricing";
import Testimonials from "@/sections/testimonials";
import ChatAssistant from "@/components/chat-assistant";
import FourDBubbleBackground from "@/components/four-d-bubble-background";

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* 4D Volumetric Bubble Hyperspace Background */}
      <FourDBubbleBackground />

      {/* Frosted Glass Blur Separation Layer (Separates background and page with smooth 4D blur) */}
      <div className="fixed inset-0 pointer-events-none z-[1] backdrop-blur-[60px] md:backdrop-blur-[80px] bg-white/65 dark:bg-black/75 transition-colors duration-500" />

      {/* Foreground Content */}
      <div className="relative z-10 px-4 xl:px-0 max-w-5xl mx-auto space-y-20 sm:space-y-24 md:space-y-32 lg:space-y-40 scroll-smooth pt-2">
        <Hero />
        <Features1 />
        <Features2 />
        <Features3 />
        <Features4 />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
        <Footer />
        <ChatAssistant />
      </div>
    </div>
  )
}
