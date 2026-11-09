import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FlaskConical,
  Flame,
  Atom,
  ArrowRight,
  Shield,
  Layers,
  Cpu,
  Users,
  Compass,
  Play,
  Moon,
  Sun,
  User as UserIcon,
  LogOut,
  Mail,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Activity,
  Award
} from 'lucide-react';
import { Floating4DBackground } from './Floating4DBackground';
import { AuthModal } from './AuthModal';
import { api, User } from '../services/api';

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
  const [currentUser, setCurrentUser] = useState<User | null>(api.getUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    setCurrentUser(api.getUser());
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  const curriculumModules = [
    {
      id: 'thermo-boil',
      title: 'Water Phase Transitions & Boiling',
      solute: 'Pure Distilled Water',
      color: '#38bdf8',
      desc: 'Investigate sensible heat transfer, nucleation sites, and the latent heat of vaporization up to 100°C.',
      tag: 'Thermodynamics',
    },
    {
      id: 'copper-sulfate',
      title: 'Copper(II) Sulfate Dissociation',
      solute: 'Copper(II) Sulfate',
      color: '#0284c7',
      desc: 'Observe azure octahedral coordination complexes [Cu(H2O)6]2+ and ion-dipole thermal stability.',
      tag: 'Inorganic Chemistry',
    },
    {
      id: 'cobalt-chloride',
      title: 'Cobalt(II) Chloride Equilibrium',
      solute: 'Cobalt(II) Chloride',
      color: '#ec4899',
      desc: 'Thermodynamic Le Chatelier shift between pink hexaaqua and deep blue tetrachloro complexes.',
      tag: 'Coordination Chemistry',
    },
    {
      id: 'potassium-permanganate',
      title: 'Potassium Permanganate Kinetics',
      solute: 'Potassium Permanganate',
      color: '#9333ea',
      desc: 'High extinction coefficient deep-violet diffusion kinetics and redox potential observation.',
      tag: 'Physical Chemistry',
    },
    {
      id: 'nickel-sulfate',
      title: 'Nickel(II) Sulfate Hydration',
      solute: 'Nickel(II) Sulfate',
      color: '#10b981',
      desc: 'Hexahydrate crystalline transitions in aqueous equilibrium with thermal convection currents.',
      tag: 'Materials Science',
    },
    {
      id: 'cryo-quench',
      title: 'Cryogenic Ice Quench Dynamics',
      solute: 'Cryogenic Aqueous Slush',
      color: '#06b6d4',
      desc: 'Measure the enthalpy of fusion (334 J/g) by introducing ice blocks into near-boiling solutions.',
      tag: 'Cryo-Physics',
    },
  ];

  return (
    <div
      className={`min-h-screen w-full relative transition-colors duration-500 overflow-y-auto overflow-x-hidden ${isDarkMode ? 'bg-neutral-950 text-neutral-100' : 'bg-slate-50 text-neutral-900'
        }`}
    >
      {/* 1. 4D Interactive Refractive Balls Background with Frosted Blur Separator */}
      <Floating4DBackground isDarkMode={isDarkMode} />

      {/* Foreground Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <header
          className={`sticky top-0 z-40 w-full px-6 py-4 border-b backdrop-blur-xl transition-all ${isDarkMode
              ? 'bg-neutral-950/80 border-neutral-800/80'
              : 'bg-white/80 border-neutral-200/80'
            }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold shadow-lg shadow-white/5">
                <Atom size={22} className="text-black" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-wider block">
                  MOSEB_STUDENT_LAB
                </span>
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 block -mt-1 uppercase">
                  4D Cinema Optical Lab
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
              <a href="#home" className="hover:text-white transition-colors">Home</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#curriculum" className="hover:text-white transition-colors">Curriculum</a>
              <a href="#features" className="hover:text-white transition-colors">4D Optics</a>
              <a href="#community" className="hover:text-white transition-colors">Community</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </nav>

            {/* Right Controls: Theme + Auth + Launch Lab CTA */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={onToggleDarkMode}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode
                    ? 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:text-black'
                  }`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* User Account Controls */}
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${isDarkMode
                        ? 'border-neutral-800 bg-neutral-900 text-neutral-200'
                        : 'border-neutral-200 bg-white text-neutral-800'
                      }`}
                  >
                    <UserIcon size={14} className="text-cyan-400" />
                    <span>{currentUser.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg hover:underline transition-all cursor-pointer text-neutral-300"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className={`hidden sm:inline-flex px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${isDarkMode
                        ? 'border-neutral-700 hover:border-neutral-500 text-white'
                        : 'border-neutral-300 hover:border-neutral-400 text-black'
                      }`}
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Launch 4D Lab Primary Button */}
              <button
                onClick={() => onEnterLab()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs tracking-wide shadow-lg hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
              >
                <Play size={14} fill="currentColor" />
                <span>Enter 4D Lab</span>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section id="home" className="max-w-7xl mx-auto px-6 pt-20 pb-28 flex flex-col items-center text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neutral-800 bg-black/60 text-xs font-mono tracking-wider text-neutral-300 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>MOSEB STUDENT LAB • ULTRA 4D PHYSICAL ENGINE</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
            The Next-Generation <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
              4D Virtual Chemistry Laboratory
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-xl text-neutral-400 max-w-2xl font-normal mb-10 leading-relaxed">
            Perform quantum-accurate thermodynamic experiments with Cinema 4D-grade physical lighting,
            dynamic fluid convection, volumetric steam, and an autonomous AI Lab Agent.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              onClick={() => onEnterLab()}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-bold text-sm tracking-wide shadow-2xl hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer group"
            >
              <Play size={18} fill="currentColor" />
              <span>Launch Virtual Lab</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#curriculum"
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl border font-semibold text-sm transition-all cursor-pointer ${isDarkMode
                  ? 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-200'
                  : 'border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800'
                }`}
            >
              <FlaskConical size={18} className="text-cyan-400" />
              <span>Explore Curriculum</span>
            </a>
          </div>

          {/* Real-time Feature Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl">
            {[
              { label: 'Thermodynamic Accuracy', val: '0.01°C' },
              { label: 'Cinema 4D Shaders', val: 'Ray-PBR' },
              { label: 'Safety & Hazard Rating', val: '100% Zero-Risk' },
              { label: 'Autonomous Guidance', val: 'AI Mentor' },
            ].map((metric, i) => (
              <div
                key={i}
                className={`p-5 rounded-2xl border backdrop-blur-xl text-left transition-all ${isDarkMode
                    ? 'border-neutral-800/80 bg-black/40 hover:border-neutral-700'
                    : 'border-neutral-200/90 bg-white/70 hover:border-neutral-300'
                  }`}
              >
                <div className="text-xl md:text-2xl font-bold font-mono tracking-tight text-white">
                  {metric.val}
                </div>
                <div className="text-xs text-neutral-400 font-medium mt-1">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: About Platform */}
        <section id="about" className="max-w-7xl mx-auto px-6 py-20 w-full border-t border-neutral-800/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase mb-3">
                Architectural Vision
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">
                Bridging Theoretical Chemistry with Hyper-Realistic Physical Immersion
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                MOSEB STUDENT LAB was engineered to democratize access to world-class scientific laboratory apparatus.
                Traditional laboratories face high chemical procurement costs, glassware breakage, and safety hazards.
              </p>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Our platform delivers 60+ FPS real-time thermodynamic numerical solvers, dynamic convection wave propagation,
                and spectral glass transmission models calibrated to borosilicate 3.3 specifications.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Hazard-Free</h4>
                    <p className="text-xs text-neutral-400 mt-1">Unlimited trials with hazardous thermal reactions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Cpu size={20} className="text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">AI Copilot</h4>
                    <p className="text-xs text-neutral-400 mt-1">Context-aware thermodynamic guidance and action executor.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Glass Showcase Card */}
            <div
              className={`p-8 rounded-3xl border backdrop-blur-2xl relative overflow-hidden ${isDarkMode
                  ? 'border-neutral-800 bg-neutral-900/40 text-neutral-100 shadow-2xl'
                  : 'border-neutral-200 bg-white/80 text-neutral-900 shadow-lg'
                }`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-cyan-400" />
                  <span className="text-xs font-mono tracking-wider font-bold uppercase">Live Physical Solver Engine</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="flex justify-between py-2 border-b border-neutral-800/40">
                  <span className="text-neutral-400">Numerical Model:</span>
                  <span className="text-white">Runge-Kutta 4th-Order Heat Solver</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-800/40">
                  <span className="text-neutral-400">Glass Specularity:</span>
                  <span className="text-white">Index of Refraction (IOR 1.52)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-800/40">
                  <span className="text-neutral-400">Fluid Mechanics:</span>
                  <span className="text-white">Convective Navier-Stokes Harmonic Ripple</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-800/40">
                  <span className="text-neutral-400">REST API Backend:</span>
                  <span className="text-white">FastAPI + SQLite Relational Database</span>
                </div>
              </div>

              <button
                onClick={() => onEnterLab()}
                className="w-full mt-6 py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Launch Interactive Benchmark</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Curriculum & Lab Experiments */}
        <section id="curriculum" className="max-w-7xl mx-auto px-6 py-20 w-full border-t border-neutral-800/60">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase mb-3">
              Experimental Modules
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Curriculum & Experiment Catalog
            </h2>
            <p className="text-sm text-neutral-400">
              Select any pre-configured experiment module below to load the apparatus directly into the 4D laboratory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curriculumModules.map((item) => (
              <div
                key={item.id}
                className={`p-6 rounded-2xl border backdrop-blur-xl flex flex-col justify-between transition-all duration-300 group hover:translate-y-[-2px] ${isDarkMode
                    ? 'border-neutral-800/80 bg-neutral-900/30 hover:border-neutral-700 hover:bg-neutral-900/50'
                    : 'border-neutral-200 bg-white/70 hover:border-neutral-300'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full border border-neutral-700 bg-black/40 text-neutral-300">
                      {item.tag}
                    </span>
                    <div
                      className="w-4 h-4 rounded-full border border-white/20 shadow-md"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <button
                  onClick={() => onEnterLab({ name: item.solute, color: item.color })}
                  className="w-full py-2.5 px-4 rounded-xl border border-neutral-700 hover:border-white hover:bg-white hover:text-black text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Launch This Experiment</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: 4D Cinema Optics Showcase */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20 w-full border-t border-neutral-800/60">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase mb-3">
              Visual Realism
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Cinema 4D Optical Rendering Features
            </h2>
            <p className="text-sm text-neutral-400">
              Every section of the laboratory is modeled with photorealistic PBR physics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Layers,
                title: 'Photorealistic Glass Refraction',
                desc: 'Pyrex borosilicate glass modeled with transmission (0.95), IOR (1.52), thickness caustics, and specular clearcoat.',
              },
              {
                icon: Flame,
                title: 'Volumetric Bunsen Ignition',
                desc: 'Multi-layer inner and outer cones simulating natural gas combustion temperatures from 200°C to 1100°C.',
              },
              {
                icon: Atom,
                title: 'Real-Time Contact Shadows',
                desc: 'Ambient occlusion contact shadows underneath all apparatus, glassware, stands, and tools on phenolic resin bench.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border backdrop-blur-xl ${isDarkMode ? 'border-neutral-800/80 bg-neutral-900/30' : 'border-neutral-200 bg-white/70'
                  }`}
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-800 text-cyan-400 flex items-center justify-center mb-4">
                  <feature.icon size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Community & Collaboration */}
        <section id="community" className="max-w-7xl mx-auto px-6 py-20 w-full border-t border-neutral-800/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase mb-3">
                Research Community
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">
                Connected Student Researchers Across 140+ Institutions
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Collaborate in real-time, share experimental temperature and volume telemetry datasets,
                and publish scientific observations directly to your institutional lab notebook.
              </p>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center gap-3 text-neutral-300">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span>Real-time SQLite database synchronization</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-300">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span>Export standardized lab reports in JSON & CSV</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-300">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span>Instructor verification and grading rubrics</span>
                </div>
              </div>
            </div>

            <div
              className={`p-6 rounded-2xl border backdrop-blur-2xl ${isDarkMode ? 'border-neutral-800 bg-black/50' : 'border-neutral-200 bg-white'
                }`}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
                <span className="text-xs font-mono font-bold uppercase text-neutral-400">Community Activity</span>
                <span className="text-xs font-mono text-cyan-400">25,840 Active Sessions</span>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  { user: 'scholar_elena', action: 'completed Copper Sulfate thermal dissociation', time: '2m ago' },
                  { user: 'prof_dawit', action: 'reviewed 14 student calorimetry notebooks', time: '8m ago' },
                  { user: 'chem_alex', action: 'calibrated Bunsen burner enthalpy curve', time: '14m ago' },
                ].map((act, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-neutral-800/40">
                    <span className="text-neutral-300">
                      <strong className="text-white">@{act.user}</strong> {act.action}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Contact & Inquiries */}
        <section id="contact" className="max-w-7xl mx-auto px-6 py-20 w-full border-t border-neutral-800/60">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <div className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase mb-3">
              Get In Touch
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">
              Contact MOSEB STUDENT LAB Team
            </h2>
            <p className="text-xs text-neutral-400">
              Have questions regarding university adoption, curriculum modules, or API access?
            </p>
          </div>

          <div
            className={`max-w-xl mx-auto p-8 rounded-3xl border backdrop-blur-2xl ${isDarkMode ? 'border-neutral-800 bg-neutral-900/40' : 'border-neutral-200 bg-white'
              }`}
          >
            {contactSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white mb-1">Message Transmitted</h4>
                <p className="text-xs text-neutral-400">
                  Thank you for reaching out. The MOSEB academic support team will reply promptly.
                </p>
                <button
                  onClick={() => setContactSubmitted(false)}
                  className="mt-4 text-xs font-mono text-cyan-400 hover:underline cursor-pointer"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSubmitted(true);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-medium mb-1 text-neutral-400">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Biruk Ahmye"
                    className={`w-full px-3 py-2.5 rounded-lg border outline-none ${isDarkMode
                        ? 'bg-neutral-900 border-neutral-800 focus:border-cyan-500 text-white'
                        : 'bg-neutral-50 border-neutral-200 text-black'
                      }`}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-neutral-400">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="researcher@university.edu"
                    className={`w-full px-3 py-2.5 rounded-lg border outline-none ${isDarkMode
                        ? 'bg-neutral-900 border-neutral-800 focus:border-cyan-500 text-white'
                        : 'bg-neutral-50 border-neutral-200 text-black'
                      }`}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-neutral-400">Message / Inquiry</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Inquiry regarding 4D virtual laboratory deployment..."
                    className={`w-full px-3 py-2.5 rounded-lg border outline-none resize-none ${isDarkMode
                        ? 'bg-neutral-900 border-neutral-800 focus:border-cyan-500 text-white'
                        : 'bg-neutral-50 border-neutral-200 text-black'
                      }`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer"
                >
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-neutral-800/80 py-8 px-6 text-xs text-neutral-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
            <div>
              © 2026 MOSEB_STUDENT_LAB. Built with Cinema 4D PBR Optics, FastAPI & SQLite.
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/123bruke/AI_lab"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>GitHub Repository</span>
                <ExternalLink size={12} />
              </a>
              <button onClick={() => onEnterLab()} className="hover:text-white transition-colors cursor-pointer">
                Enter 4D Lab
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Auth Modal (Sign In / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onAuthSuccess={(user) => setCurrentUser(user)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

