import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Flame,
  Atom,
  ArrowRight,
  Droplets,
  Layers,
  Moon,
  Sun,
  User as UserIcon,
  LogOut,
  ChevronDown,
  ChevronUp,
  X,
  ArrowUp,
  Play,
  RotateCw,
  Box,
  Compass
} from 'lucide-react';
import { Floating4DBackground } from './Floating4DBackground';
import { AuthModal } from './AuthModal';
import { api, User } from '../services/api';
import { CHEMICAL_PRESETS } from '../simulation/thermodynamics';

interface LandingPageProps {
  onEnterLab: (presetSolute?: { name: string; color: string }) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterLab,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('moseb_user');
        if (cached) return JSON.parse(cached);
      }
      if (typeof api !== 'undefined' && typeof api?.getUser === 'function') {
        return api.getUser();
      }
    } catch { }
    return null;
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ id: number; role: 'assistant' | 'user'; text: string; sources?: string[] }>>([
    {
      id: 1,
      role: 'assistant',
      text: 'Hello! I am your MOSEB 4D Lab Assistant. Ask me about our 3D apparatus, thermodynamic heating formulas, chemical solutes, or click "Enter 3D Lab" to launch!',
    },
  ]);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    try {
      if (typeof api !== 'undefined' && typeof api?.getUser === 'function') {
        setCurrentUser(api.getUser());
      }
    } catch { }
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogout = () => {
    try {
      if (typeof api?.logout === 'function') {
        api.logout();
      }
    } catch { }
    setCurrentUser(null);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = chatInput.trim();
    if (!query || chatLoading) return;

    const userMsgId = Date.now();
    setChatMessages((prev) => [...prev, { id: userMsgId, role: 'user', text: query }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await api.queryRagAssistant(query);
      setChatMessages((prev) => [
        ...prev,
        {
          id: userMsgId + 1,
          role: 'assistant',
          text: res.reply,
          sources: res.sources,
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: userMsgId + 1,
          role: 'assistant',
          text: 'Welcome to MOSEB 4D Lab. Click "Enter 3D Lab" in the top banner to launch the simulation!',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const faqs = [
    {
      q: 'How does the real-time thermodynamic simulation solve temperature?',
      a: 'MOSEB solves continuous convective energy transfer Q = m * c * ΔT at ~60Hz, integrating Bunsen flame power, ambient radiation loss, and enthalpy of fusion (334 J/g for ice) or vaporization (2260 kJ/kg for steam).',
    },
    {
      q: 'Can I test different chemical reaction solutes?',
      a: 'Yes! You can choose between Pure Deionized Water, Copper(II) Sulfate, Iron(III) Chloride, Phenolphthalein indicator, and Potassium Permanganate. Each chemical adjusts liquid color, viscosity, and thermal absorption.',
    },
    {
      q: 'How do I enter and control apparatus in the 3D space?',
      a: 'Click "Enter 3D Lab" anywhere on this page. Inside, you can click on any equipment (beaker, burner, thermometer) to inspect specifications, click "Rotate (R)" to spin apparatus, and drag the Bunsen burner power slider to ignite flame heating.',
    },
    {
      q: 'What is the role of the AI Lab Copilot?',
      a: 'Our autonomous agent monitors laboratory safety thresholds, conducts instant thermodynamic and stoichiometric audits, and advises on proper procedure before hazardous boiling or overheating occurs.',
    },
  ];

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#090d16] text-neutral-100' : 'bg-white text-neutral-900'}`}>
      {/* 1. Interactive 3D Floating Physics Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <Floating4DBackground />
      </div>

      {/* 2. Top Banner / Header Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors border-neutral-200/20 bg-neutral-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg shadow-white/10 font-bold">
              <FlaskConical size={22} className="text-black" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wider text-white">MOSEB LAB</span>
              <span className="text-[10px] block font-mono text-neutral-400 uppercase tracking-widest">4D Virtual Chemistry</span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
            <a href="#apparatus" className="hover:text-white transition-colors">Apparatus</a>
            <a href="#thermodynamics" className="hover:text-white transition-colors">Thermodynamics</a>
            <a href="#chemicals" className="hover:text-white transition-colors">Reagents</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* Right Action Banners */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Auth Buttons */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-mono flex items-center gap-2 border border-white/10">
                  <UserIcon size={14} className="text-emerald-400" />
                  <span className="font-semibold">{currentUser.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="px-3.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleOpenAuth('register')}
                  className="hidden sm:inline-block px-3.5 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl border border-white/10 transition-all cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Primary Action Button: Enter 3D Space */}
            <button
              onClick={() => onEnterLab()}
              className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-neutral-200 shadow-xl shadow-white/15 transition-all cursor-pointer"
            >
              <Box size={16} className="text-black" />
              <span>Enter 3D Lab</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Hero Section with 3D Visual Mockup */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 space-y-28">
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-neutral-200 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">CINEMA 4D STUDIO OPTICS & NUMERICAL SOLVER</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none text-white">
            MOSEB <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-300">4D LAB</span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Ultra-photorealistic 4D virtual chemistry simulation featuring Cinema 4D physical optics, real-time thermodynamic heat transfer, and autonomous AI copilot guidance.
          </p>

          {/* Hero Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onEnterLab()}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-neutral-200 shadow-2xl shadow-white/20 transition-all cursor-pointer"
            >
              <FlaskConical size={20} className="text-black" />
              <span>Launch 3D Simulation</span>
              <ArrowRight size={18} />
            </button>

            <a
              href="#apparatus"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 text-white font-bold text-sm border border-white/15 transition-all text-center"
            >
              Explore Laboratory Apparatus
            </a>
          </div>

          {/* Interactive Chemical Preset Launchers */}
          <div className="pt-8">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-3">
              Direct Chemical Quick-Start Presets (Click to Load):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 max-w-3xl mx-auto">
              {CHEMICAL_PRESETS.map((preset) => (
                <button
                  key={preset.formula}
                  onClick={() => onEnterLab({ name: preset.name, color: preset.color })}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 backdrop-blur-md transition-all text-left flex flex-col gap-1 cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span className="font-mono text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                      {preset.formula}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Section: Laboratory Apparatus Showcase */}
        <section id="apparatus" className="space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">PRECISION INSTRUMENTS</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Full 3D Interactive Equipment</h2>
            <p className="text-neutral-400 text-sm max-w-xl mx-auto">
              Every apparatus is modeled with accurate physical collision geometry, refractive optical shaders, and thermodynamic sensors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-4 hover:border-white/25 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <FlaskConical size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">500mL Borosilicate Glass Beaker</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Fabricated with Boro 3.3 glass rated to 500°C. Displays real-time volumetric meniscus, convective thermal currents, and dynamic boiling nucleation bubbles.
              </p>
              <div className="pt-2 text-xs font-mono text-neutral-500">
                <span>Thermal shock ΔT ≈ 150°C • High chemical resistance</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-4 hover:border-white/25 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Tirrill / Bunsen Gas Burner</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Stoichiometric gas burner with adjustable air collar. Generates authentic non-luminous blue inner cones with temperatures up to 1500°C for direct convective transfer.
              </p>
              <div className="pt-2 text-xs font-mono text-neutral-500">
                <span>Flame power 10%–100% • Acoustically calibrated roar</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-4 hover:border-white/25 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Atom size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Digital Thermodynamic Sensor</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                High-precision immersion thermocouple continuously logging liquid temperature, vaporization mass loss, and latent phase transitions.
              </p>
              <div className="pt-2 text-xs font-mono text-neutral-500">
                <span>Sub-0.1°C resolution • Real-time telemetry feed</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Section: Thermodynamic Solvers */}
        <section id="thermodynamics" className="p-8 sm:p-12 rounded-3xl bg-neutral-900/90 border border-white/10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold">PHYSICAL SIMULATION ENGINE</span>
              <h2 className="text-3xl font-bold text-white">First-Principles Numerical Solvers</h2>
              <p className="text-sm text-neutral-400">Continuous thermodynamic ODE calculations run at 60 FPS.</p>
            </div>
            <button
              onClick={() => onEnterLab()}
              className="px-6 py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all self-start md:self-auto cursor-pointer"
            >
              Test Thermodynamics Now
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
            <div className="p-5 rounded-2xl bg-black/60 border border-white/5 space-y-2">
              <span className="text-neutral-400 uppercase text-[10px]">Convective Heat Equation</span>
              <div className="text-base font-bold text-white">Q = m · c · ΔT</div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Specific heat capacity c = 4.184 J/g·°C for water. Accurately predicts heating rates based on fluid mass.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-white/5 space-y-2">
              <span className="text-neutral-400 uppercase text-[10px]">Enthalpy of Vaporization</span>
              <div className="text-base font-bold text-white">Lv = 2260 kJ/kg</div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Thermal plateau pinned at 100°C while liquid converts into volumetric convective steam.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-white/5 space-y-2">
              <span className="text-neutral-400 uppercase text-[10px]">Cryogenic Fusion</span>
              <div className="text-base font-bold text-white">ΔHfus = 334 J/g</div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Dropping ice cubes instantly absorbs thermal kinetic energy, cooling down toward 0.5°C.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-white/5 space-y-2">
              <span className="text-neutral-400 uppercase text-[10px]">Ambient Newton Cooling</span>
              <div className="text-base font-bold text-white">dT/dt = -k(T - Tamb)</div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Natural radiative dissipation gradually cools hot solution back toward room temperature (22°C).
              </p>
            </div>
          </div>
        </section>

        {/* 6. Section: About Page (Pure Text per user instructions: "edit the about apge ony edit text pls do not add any icons") */}
        <section id="about" className="space-y-6 max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-neutral-900/60 border border-white/10">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold">EDUCATIONAL & SCIENTIFIC ARCHITECTURE</span>
            <h2 className="text-3xl font-bold text-white">About MOSEB Student Laboratory</h2>
          </div>
          <div className="space-y-4 text-neutral-300 text-sm leading-relaxed">
            <p>
              MOSEB Student Lab is an interactive 4D virtual chemistry simulation designed to democratize high-level laboratory education. Traditional chemistry laboratories face significant real-world constraints: costly equipment breakage, chemical reagent waste, strict ventilation requirements, and safety hazards associated with high-temperature open flames and corrosive acids.
            </p>
            <p>
              By combining GPU-accelerated WebGL optics with rigorous first-principles thermodynamic solvers, MOSEB allows students and researchers to perform realistic calorimetry, titration, and reaction experiments from any modern web browser without physical danger.
            </p>
            <p>
              The system simulates physical contact shadows, borosilicate refraction, and gas stoichiometry with full mathematical accuracy. Furthermore, an integrated autonomous AI Copilot provides real-time safety auditing and procedure guidance, ensuring learners understand both the molecular mechanisms and proper laboratory standards.
            </p>
          </div>
        </section>

        {/* 7. Section: Interactive FAQ Accordion */}
        <section id="faq" className="space-y-8 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">KNOWLEDGE BASE</span>
            <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl bg-neutral-900/80 border border-white/10 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between text-white font-semibold text-sm cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} className="text-neutral-400" /> : <ChevronDown size={18} className="text-neutral-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-neutral-300 leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. Call to Action Banner */}
        <section className="p-10 sm:p-16 rounded-3xl bg-gradient-to-b from-neutral-900 to-black border border-white/15 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
            Ready to Begin Your Laboratory Session?
          </h2>
          <p className="text-neutral-300 text-sm max-w-xl mx-auto">
            Experience next-generation 4D virtual chemistry. Heat solutions, adjust gas flames, mix chemical reagents, and consult the AI copilot in real time.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => onEnterLab()}
              className="px-10 py-4 rounded-2xl bg-white text-black font-extrabold text-sm uppercase tracking-wider flex items-center gap-3 hover:bg-neutral-200 shadow-2xl shadow-white/20 transition-all cursor-pointer"
            >
              <Box size={20} className="text-black" />
              <span>Enter 3D Laboratory</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      {/* 9. Sleek Modern Footer */}
      <footer className="w-full border-t border-neutral-800 bg-neutral-950 py-12 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <FlaskConical size={18} className="text-white" />
            <span className="font-bold text-white">MOSEB STUDENT LAB</span>
            <span className="text-neutral-600">|</span>
            <span>4D Virtual Chemistry Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Thermodynamic Engine: ONLINE</span>
            </span>
            <span>© 2026 MOSEB LAB. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* 10. Floating RAG AI Assistant Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen ? (
          <div className="w-[360px] sm:w-[400px] h-[520px] rounded-3xl bg-neutral-950/95 border border-white/20 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100 animate-fade-in select-none">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold">
                  <FlaskConical size={16} className="text-black" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">MOSEB AI Lab Assistant</h4>
                  <span className="text-[10px] text-emerald-400 font-mono block">Website RAG Knowledge Engine</span>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-white text-black font-semibold'
                        : 'bg-neutral-900 border border-white/10 text-neutral-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="text-[9px] text-neutral-500 mt-1 pl-1">
                      Sources: {msg.sources.join(' • ')}
                    </div>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className="p-3 rounded-2xl bg-neutral-900 border border-white/10 text-neutral-400 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Synthesizing answer from website knowledge...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-white/10 flex items-center gap-2 bg-neutral-900/60">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about apparatus, boiling, chemicals..."
                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="p-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ArrowUp size={16} />
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="px-5 py-3.5 rounded-2xl bg-white text-black font-bold text-xs shadow-2xl shadow-white/20 flex items-center gap-2.5 hover:bg-neutral-200 transition-all cursor-pointer group"
          >
            <FlaskConical size={18} className="text-black group-hover:rotate-12 transition-transform" />
            <span>AI Lab Assistant</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        )}
      </div>

      {/* 11. Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
        }}
        initialMode={authMode}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
