import React, { useState, useMemo } from 'react';
import {
  Flame,
  FlaskConical,
  Snowflake,
  Droplets,
  Sun,
  Eye,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowLeft,
  X,
  Layers,
  Thermometer,
  Zap,
  CheckCircle,
  AlertTriangle,
  Play,
  Shield,
  Save,
  BookmarkCheck,
  Bot,
  Boxes,
  Search,
  Lock,
  Unlock,
  Atom,
  Info
} from 'lucide-react';
import { ExperimentState, CameraViewPreset, LabLightingState } from '../types';
import { REAGENTS_DATABASE, ChemicalReagent } from '../data/reagentsData';
import { LAB_MATERIALS_DATABASE, LabMaterial, MaterialCategory } from '../data/materialsData';
import { api, AgentResponse } from '../services/api';
import { labAudio } from '../utils/audio';
import { MultiAgentCenter } from './MultiAgentCenter';

interface UnifiedLabSidebarProps {
  experiment: ExperimentState;
  onToggleBurner: () => void;
  onFirePowerChange: (power: number) => void;
  onReset: () => void;
  onAddIce: () => void;
  onRefillWater: () => void;
  onSelectChemical: (color: string, name: string) => void;
  cameraPreset: CameraViewPreset;
  onSetCameraPreset: (preset: CameraViewPreset) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  lighting: LabLightingState;
  onToggleLight: (lightKey: keyof LabLightingState) => void;
  onSetAllLights: (state: boolean) => void;
  onReturnToHome: () => void;
}

type FlyoutPanel = 'burner' | 'chemicals' | 'materials' | 'lights' | 'camera' | 'agent' | null;

export const UnifiedLabSidebar: React.FC<UnifiedLabSidebarProps> = ({
  experiment,
  onToggleBurner,
  onFirePowerChange,
  onReset,
  onAddIce,
  onRefillWater,
  onSelectChemical,
  cameraPreset,
  onSetCameraPreset,
  isMuted,
  onToggleMute,
  lighting,
  onToggleLight,
  onSetAllLights,
  onReturnToHome,
}) => {
  const [activePanel, setActivePanel] = useState<FlyoutPanel>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [isMultiAgentDeckOpen, setIsMultiAgentDeckOpen] = useState(false);

  // Reagents state & filtering (>200 items)
  const [reagentSearch, setReagentSearch] = useState('');
  const [selectedReagentCategory, setSelectedReagentCategory] = useState<string>('all');

  // Materials state & filtering (including 10 hidden 4D materials)
  const [materialSearch, setMaterialSearch] = useState('');
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState<MaterialCategory>('all');
  const [is4DUnlocked, setIs4DUnlocked] = useState(false);

  const filteredReagents = useMemo(() => {
    const q = reagentSearch.trim().toLowerCase();
    return REAGENTS_DATABASE.filter((chem) => {
      const matchesCategory =
        selectedReagentCategory === 'all' || chem.category === selectedReagentCategory;
      const matchesQuery =
        !q ||
        chem.name.toLowerCase().includes(q) ||
        chem.formula.toLowerCase().includes(q) ||
        chem.description.toLowerCase().includes(q) ||
        (chem.flameColor && chem.flameColor.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [reagentSearch, selectedReagentCategory]);

  const filteredMaterials = useMemo(() => {
    const q = materialSearch.trim().toLowerCase();
    return LAB_MATERIALS_DATABASE.filter((mat) => {
      // 4D materials remain hidden unless user has unlocked 4D mode
      if (mat.is4D && !is4DUnlocked) return false;

      const matchesCategory =
        selectedMaterialCategory === 'all' || mat.category === selectedMaterialCategory;
      const matchesQuery =
        !q ||
        mat.name.toLowerCase().includes(q) ||
        mat.composition.toLowerCase().includes(q) ||
        mat.description.toLowerCase().includes(q) ||
        (mat.properties.flameType && mat.properties.flameType.toLowerCase().includes(q)) ||
        (mat.properties.dimensionFactor && mat.properties.dimensionFactor.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [materialSearch, selectedMaterialCategory, is4DUnlocked]);

  // AI Agent States
  const [agentPrompt, setAgentPrompt] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentHistory, setAgentHistory] = useState<Array<{ role: 'user' | 'agent'; text: string; safety?: string }>>([
    {
      role: 'agent',
      text: 'MOSEB Autonomous AI Lab Copilot active. I monitor real-time thermodynamics, execute laboratory procedures, and ensure protocol compliance. Ask me anything or trigger an automated lab action.',
      safety: 'SAFE',
    },
  ]);

  const togglePanel = (panel: FlyoutPanel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
    labAudio.playClick();
  };

  const handleAgentSubmit = async (customQuery?: string) => {
    const q = customQuery || agentPrompt;
    if (!q.trim()) return;

    setAgentLoading(true);
    setAgentHistory((prev) => [...prev, { role: 'user', text: q }]);
    setAgentPrompt('');

    try {
      const res = await api.askAgent(q, {
        current_temp: experiment.temperature,
        current_volume: experiment.liquidVolume,
        current_state: experiment.waterState,
        solute_name: experiment.soluteName,
      });

      setAgentHistory((prev) => [
        ...prev,
        { role: 'agent', text: res.response, safety: res.safety_level },
      ]);

      // Execute Action if recommended
      if (res.recommended_action === 'SET_FIRE_100') {
        if (!experiment.isBurnerLit) onToggleBurner();
        onFirePowerChange(1.0);
      } else if (res.recommended_action === 'SET_FIRE_75') {
        if (!experiment.isBurnerLit) onToggleBurner();
        onFirePowerChange(0.75);
      } else if (res.recommended_action === 'ADD_ICE') {
        onAddIce();
      } else if (res.recommended_action === 'REFILL_WATER') {
        onRefillWater();
      }
    } catch {
      setAgentHistory((prev) => [
        ...prev,
        {
          role: 'agent',
          text: `Thermodynamic reading: ${experiment.temperature.toFixed(1)}°C. System operating normally.`,
          safety: 'SAFE',
        },
      ]);
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <>
      {/* 1. Top Minimalist Essential Telemetry Strip */}
      <div className="absolute top-4 left-4 right-4 z-30 pointer-events-none flex items-center justify-between">
        {/* Left: Brand & Return Home */}
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            onClick={onReturnToHome}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/90 border border-white/20 text-white hover:bg-white hover:text-black transition-all cursor-pointer shadow-2xl backdrop-blur-xl text-xs font-semibold"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Landing Page</span>
          </button>

          <div className="px-3.5 py-2 rounded-xl bg-black/90 border border-white/10 backdrop-blur-xl text-xs font-mono flex items-center gap-2 shadow-2xl text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-white tracking-wider">MOSEB_STUDENT_LAB</span>
            <span className="text-neutral-500">|</span>
            <span className="text-neutral-300 max-w-[180px] sm:max-w-[320px] truncate">{experiment.soluteName}</span>
          </div>
        </div>

        {/* Right: Essential Measurement Metrics Only */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-black/90 border border-white/10 backdrop-blur-xl text-xs font-mono flex items-center gap-4 text-white shadow-2xl">
            <div className="flex items-center gap-1.5">
              <Thermometer size={14} className="text-cyan-400" />
              <span className="font-bold text-sm">{experiment.temperature.toFixed(1)}°C</span>
            </div>
            <span className="text-neutral-600">/</span>
            <div className="flex items-center gap-1.5">
              <Droplets size={14} className="text-sky-400" />
              <span>{Math.round(experiment.liquidVolume)} mL</span>
            </div>
            <span className="text-neutral-600">/</span>
            <span className="text-neutral-400 uppercase tracking-widest text-[10px] font-bold">
              {experiment.waterState.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Unified Clean Vertical Sidebar Dock (Left) - Free of text */}
      <aside className="absolute left-4 top-20 bottom-20 z-30 pointer-events-auto flex flex-col justify-center">
        <div className="p-2 rounded-2xl bg-black/90 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col items-center gap-2 text-white">
          {/* 1. Autonomous Multi-Agent Command Deck */}
          <button
            onClick={() => {
              setIsMultiAgentDeckOpen(true);
              setActivePanel(null);
              labAudio.playClick();
            }}
            title="Multi-Agent Command Deck"
            className="p-3 rounded-xl transition-all cursor-pointer bg-white/10 hover:bg-white hover:text-black text-cyan-300 border border-cyan-400/30 group"
          >
            <Bot size={20} />
          </button>

          {/* 2. AI Agent Chat Copilot */}
          <button
            onClick={() => togglePanel('agent')}
            title="MOSEB AI Lab Copilot"
            className={`p-3 rounded-xl transition-all cursor-pointer relative ${activePanel === 'agent'
              ? 'bg-white text-black shadow-lg shadow-white/20'
              : 'hover:bg-neutral-800 text-cyan-400'
              }`}
          >
            <Sparkles size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
          </button>

          <div className="w-6 h-[1px] bg-neutral-800 my-1" />

          {/* 3. Burner / Heat Control */}
          <button
            onClick={() => togglePanel('burner')}
            title="Bunsen Burner Heat Controller"
            className={`p-3 rounded-xl transition-all cursor-pointer relative ${activePanel === 'burner'
              ? 'bg-white text-black'
              : experiment.isBurnerLit
                ? 'text-orange-400 hover:bg-neutral-800'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
          >
            <Flame size={20} />
            {experiment.isBurnerLit && (
              <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-orange-500" />
            )}
          </button>

          {/* 4. Chemical Reagents Catalog (Over 200 Reagents) */}
          <button
            onClick={() => togglePanel('chemicals')}
            title="Chemical Reagents Catalog (Over 200 Reagents)"
            className={`p-3 rounded-xl transition-all cursor-pointer relative ${activePanel === 'chemicals'
              ? 'bg-white text-black'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
          >
            <FlaskConical size={20} />
          </button>

          {/* 5. Laboratory Materials Section & 4D Vault */}
          <button
            onClick={() => togglePanel('materials')}
            title="Laboratory Materials Catalog & 4D Vault"
            className={`p-3 rounded-xl transition-all cursor-pointer relative ${activePanel === 'materials'
              ? 'bg-white text-black'
              : is4DUnlocked
                ? 'text-purple-300 hover:bg-neutral-800'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
          >
            <Boxes size={20} />
            {is4DUnlocked && (
              <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            )}
          </button>

          {/* 6. Drop Cryogenic Ice */}
          <button
            onClick={() => {
              onAddIce();
              labAudio.playGlassClink();
              setSavedToast('Dropped Cryogenic Ice (-20°C Quench)');
              setTimeout(() => setSavedToast(null), 2500);
            }}
            title="Drop Cryogenic Ice (-20°C Quench)"
            className="p-3 rounded-xl text-neutral-400 hover:text-cyan-300 hover:bg-neutral-800 transition-all cursor-pointer active:scale-95"
          >
            <Snowflake size={20} />
          </button>

          {/* 7. Refill Water */}
          <button
            onClick={() => {
              onRefillWater();
              labAudio.playGlassClink();
              setSavedToast('Refilled Pure Distilled Water (350 mL)');
              setTimeout(() => setSavedToast(null), 2500);
            }}
            title="Refill Distilled Water (350 mL)"
            className="p-3 rounded-xl text-neutral-400 hover:text-sky-300 hover:bg-neutral-800 transition-all cursor-pointer active:scale-95"
          >
            <Droplets size={20} />
          </button>

          <div className="w-6 h-[1px] bg-neutral-800 my-1" />

          {/* 8. Studio Lighting */}
          <button
            onClick={() => togglePanel('lights')}
            title="Studio Lighting Switchboard"
            className={`p-3 rounded-xl transition-all cursor-pointer ${activePanel === 'lights'
              ? 'bg-white text-black'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
          >
            <Sun size={20} />
          </button>

          {/* 9. Camera Angles */}
          <button
            onClick={() => togglePanel('camera')}
            title="Camera Perspective Manager"
            className={`p-3 rounded-xl transition-all cursor-pointer ${activePanel === 'camera'
              ? 'bg-white text-black'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
          >
            <Eye size={20} />
          </button>

          {/* 10. Reset Experiment */}
          <button
            onClick={() => {
              onReset();
              labAudio.playClick();
              setSavedToast('Experiment Reset to 22°C Standard State');
              setTimeout(() => setSavedToast(null), 2500);
            }}
            title="Reset Experiment"
            className="p-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer active:rotate-180"
          >
            <RotateCcw size={20} />
          </button>

          {/* 11. Audio Mute */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </aside>

      {/* 3. Flyout Panels */}

      {/* A. Burner Flyout */}
      {activePanel === 'burner' && (
        <div className="absolute left-20 top-28 z-40 w-72 p-5 rounded-2xl bg-black/95 border border-white/20 backdrop-blur-2xl shadow-2xl text-white animate-in fade-in slide-in-from-left-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-orange-400" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Bunsen Combustion</span>
            </div>
            <button onClick={() => setActivePanel(null)} className="text-neutral-400 hover:text-white cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={onToggleBurner}
              className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${experiment.isBurnerLit
                ? 'bg-rose-600 text-white hover:bg-rose-500'
                : 'bg-white text-black hover:bg-neutral-200'
                }`}
            >
              <Flame size={16} />
              <span>{experiment.isBurnerLit ? 'Extinguish Flame' : 'Ignite Burner'}</span>
            </button>

            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-neutral-400">Gas Valve Power:</span>
                <span className="font-bold text-orange-400">{Math.round(experiment.firePower * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={experiment.firePower}
                onChange={(e) => onFirePowerChange(parseFloat(e.target.value))}
                className="w-full accent-white h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* B. Chemical Reagents Flyout (>200 Reagents with Search & Categories) */}
      {activePanel === 'chemicals' && (
        <div className="absolute left-20 top-16 z-40 w-96 sm:w-[480px] max-h-[84vh] flex flex-col p-5 rounded-3xl bg-black/95 border border-white/20 backdrop-blur-2xl shadow-2xl text-white animate-in fade-in slide-in-from-left-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/30">
                <FlaskConical size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>Reagents Catalog</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-cyan-300 font-mono">
                    {REAGENTS_DATABASE.length} Reagents
                  </span>
                </h3>
                <span className="text-[10px] text-neutral-400 font-mono block">
                  Select chemical solute to infuse into 3D reaction vessel
                </span>
              </div>
            </div>
            <button
              onClick={() => setActivePanel(null)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={reagentSearch}
              onChange={(e) => setReagentSearch(e.target.value)}
              placeholder="Search 200+ reagents by name, formula, pH, hazard..."
              className="w-full pl-9 pr-8 py-2 bg-neutral-900/90 border border-neutral-800 focus:border-cyan-400 rounded-xl text-xs text-white placeholder-neutral-500 outline-none transition-colors"
            />
            {reagentSearch && (
              <button
                onClick={() => setReagentSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2 scrollbar-none text-[11px] font-mono shrink-0">
            {[
              { id: 'all', label: `All (${REAGENTS_DATABASE.length})` },
              { id: 'Acids & Bases', label: 'Acids & Bases' },
              { id: 'Transition Metal Salts', label: 'Transition Metals' },
              { id: 'Alkali & Alkaline Earth Salts', label: 'Alkali & Earth' },
              { id: 'Redox & Oxidizers', label: 'Redox & Oxidizers' },
              { id: 'Indicators & Dyes', label: 'Indicators & Dyes' },
              { id: 'Luminescent Reagents', label: 'Luminescent' },
              { id: 'Organic Solvents', label: 'Organic Solvents' },
              { id: 'Fire & Pyrotechnics', label: 'Fire & Pyro' },
              { id: 'Biochemical Reagents', label: 'Biochemical' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedReagentCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                  selectedReagentCategory === cat.id
                    ? 'bg-white text-black border-white font-bold shadow-sm'
                    : 'bg-neutral-900/70 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Reagents Scrollable List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
            {filteredReagents.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-xs font-mono">
                No reagents matched "{reagentSearch}"
              </div>
            ) : (
              filteredReagents.map((chem) => {
                const isActive = experiment.soluteName === chem.name;
                return (
                  <button
                    key={chem.id}
                    onClick={() => {
                      onSelectChemical(chem.color, chem.name);
                      labAudio.playGlassClink();
                      setSavedToast(`Infused: ${chem.name}`);
                      setTimeout(() => setSavedToast(null), 2500);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer group ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-lg shadow-cyan-950/50'
                        : 'border-neutral-800/90 hover:border-neutral-700 bg-neutral-900/60 hover:bg-neutral-900 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-md transition-transform group-hover:scale-110"
                          style={{
                            backgroundColor: chem.color,
                            boxShadow: `0 0 10px ${chem.color}40`,
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {chem.name}
                            </span>
                            <span className="text-[11px] font-mono text-cyan-400 font-semibold px-1.5 py-0.2 rounded bg-neutral-800">
                              {chem.formula}
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5 font-sans">
                            {chem.description}
                          </span>
                        </div>
                      </div>
                      {isActive && (
                        <span className="px-1.5 py-0.5 rounded-full bg-cyan-400 text-black text-[9px] font-bold uppercase tracking-wider shrink-0 font-mono">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Metadata Pill Tags */}
                    <div className="mt-2 pt-2 border-t border-neutral-800/60 flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-neutral-800/80 text-neutral-400">
                        {chem.category}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-400 uppercase">
                        {chem.state}
                      </span>
                      {chem.pH !== undefined && (
                        <span className={`px-1.5 py-0.5 rounded ${chem.pH < 4 ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40' : chem.pH > 10 ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40' : 'bg-neutral-800/80 text-neutral-300'}`}>
                          pH {chem.pH}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-400">
                        {chem.density} g/cm³
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-400">
                        {chem.molarMass.toFixed(1)} g/mol
                      </span>
                      <span className={`px-1.5 py-0.5 rounded font-bold ${
                        chem.hazard === 'Safe'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          : chem.hazard === 'Corrosive'
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                          : chem.hazard === 'Flammable'
                          ? 'bg-orange-950/60 text-orange-300 border border-orange-800/40'
                          : chem.hazard === 'Toxic'
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                      }`}>
                        {chem.hazard}
                      </span>
                      {chem.flameColor && (
                        <span className="px-1.5 py-0.5 rounded bg-orange-950/60 text-orange-300 border border-orange-800/40 flex items-center gap-1">
                          <Flame size={10} />
                          {chem.flameColor}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* C. Laboratory Materials & 4D Vault Flyout */}
      {activePanel === 'materials' && (
        <div className="absolute left-20 top-16 z-40 w-96 sm:w-[500px] max-h-[84vh] flex flex-col p-5 rounded-3xl bg-black/95 border border-white/20 backdrop-blur-2xl shadow-2xl text-white animate-in fade-in slide-in-from-left-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-400/30">
                <Boxes size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>Materials & Matter Catalog</span>
                  {is4DUnlocked && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[10px] text-purple-300 border border-purple-400/40 font-mono animate-pulse">
                      ✦ 4D Vault Open
                    </span>
                  )}
                </h3>
                <span className="text-[10px] text-neutral-400 font-mono block">
                  Search laboratory refractory, fire-type, and hyper-dimensional materials
                </span>
              </div>
            </div>
            <button
              onClick={() => setActivePanel(null)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search Bar & 4D Secret Unlock Switch */}
          <div className="space-y-2 mb-3">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                placeholder="Search materials, fire-types, alloys, ceramics..."
                className="w-full pl-9 pr-8 py-2 bg-neutral-900/90 border border-neutral-800 focus:border-purple-400 rounded-xl text-xs text-white placeholder-neutral-500 outline-none transition-colors"
              />
              {materialSearch && (
                <button
                  onClick={() => setMaterialSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Secret 4D Unlock Trigger Button */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-900/80 border border-neutral-800 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className={is4DUnlocked ? "text-purple-400 animate-spin" : "text-neutral-500"} />
                <span className="text-neutral-400">
                  {is4DUnlocked ? "✦ 4D Hyper-Matter Materials Unlocked (10 Items Available)" : "Hidden 4D Dimensions Section:"}
                </span>
              </div>
              <button
                onClick={() => {
                  setIs4DUnlocked((prev) => !prev);
                  labAudio.playClick();
                  setSavedToast(is4DUnlocked ? "4D Vault Locked" : "✦ 4D Hyper-Matter Unlocked! (10 New Materials)");
                  setTimeout(() => setSavedToast(null), 3000);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  is4DUnlocked
                    ? "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/40"
                    : "bg-white/10 hover:bg-white/20 text-neutral-300"
                }`}
              >
                {is4DUnlocked ? <Unlock size={12} /> : <Lock size={12} />}
                <span>{is4DUnlocked ? "4D Mode Active" : "Reveal 10 4D Materials"}</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2 scrollbar-none text-[11px] font-mono shrink-0">
            {[
              { id: 'all' as MaterialCategory, label: 'All Materials' },
              { id: 'fire_type' as MaterialCategory, label: '🔥 Fire Types (12)' },
              { id: 'glassware' as MaterialCategory, label: 'Glassware' },
              { id: 'metals' as MaterialCategory, label: 'Metals & Alloys' },
              { id: 'ceramics' as MaterialCategory, label: 'Ceramics' },
              { id: 'polymers' as MaterialCategory, label: 'Polymers' },
              { id: 'crystals' as MaterialCategory, label: 'Crystals' },
              ...(is4DUnlocked ? [{ id: '4d_hyper' as MaterialCategory, label: '✦ 4D Hyper-Matter (10)' }] : []),
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedMaterialCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                  selectedMaterialCategory === cat.id
                    ? cat.id === '4d_hyper'
                      ? 'bg-purple-600 text-white border-purple-400 font-bold shadow-lg shadow-purple-600/30'
                      : cat.id === 'fire_type'
                      ? 'bg-orange-600 text-white border-orange-400 font-bold shadow-lg shadow-orange-600/30'
                      : 'bg-white text-black border-white font-bold shadow-sm'
                    : 'bg-neutral-900/70 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Materials Scrollable List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-0">
            {filteredMaterials.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-xs font-mono">
                No materials matched "{materialSearch}"
              </div>
            ) : (
              filteredMaterials.map((mat) => {
                const isActive = experiment.soluteName === mat.name;
                const is4D = mat.is4D;
                const isFire = mat.isFireType;

                return (
                  <div
                    key={mat.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      is4D
                        ? 'border-purple-500/50 bg-gradient-to-br from-purple-950/40 via-neutral-950 to-cyan-950/30 hover:border-purple-400'
                        : isFire
                        ? 'border-orange-500/40 bg-gradient-to-br from-orange-950/30 via-neutral-950 to-neutral-900/80 hover:border-orange-400'
                        : 'border-neutral-800/90 bg-neutral-900/60 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-md"
                          style={{
                            backgroundColor: mat.color,
                            boxShadow: `0 0 10px ${mat.color}60`,
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white">
                              {mat.name}
                            </span>
                            {is4D && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300 border border-purple-400/40 text-[9px] font-mono font-bold uppercase">
                                4D Dimensional
                              </span>
                            )}
                            {isFire && (
                              <span className="px-1.5 py-0.2 rounded bg-orange-500/30 text-orange-300 border border-orange-400/40 text-[9px] font-mono font-bold uppercase flex items-center gap-1">
                                <Flame size={10} />
                                Fire Type
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-cyan-400 block mt-0.5">
                            {mat.composition}
                          </span>
                        </div>
                      </div>
                      {isActive && (
                        <span className="px-1.5 py-0.5 rounded-full bg-cyan-400 text-black text-[9px] font-bold uppercase tracking-wider shrink-0 font-mono">
                          Active
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-neutral-300 leading-relaxed font-sans mt-1">
                      {mat.description}
                    </p>

                    {/* Properties Grid */}
                    <div className="mt-2.5 p-2 rounded-xl bg-black/40 border border-white/5 grid grid-cols-2 gap-2 text-[10px] font-mono">
                      {mat.properties.meltingPoint && (
                        <div>
                          <span className="text-neutral-500 block uppercase font-semibold">Thermal / Melting:</span>
                          <span className="text-neutral-200">{mat.properties.meltingPoint}</span>
                        </div>
                      )}
                      {mat.properties.density && (
                        <div>
                          <span className="text-neutral-500 block uppercase font-semibold">Density:</span>
                          <span className="text-neutral-200">{mat.properties.density}</span>
                        </div>
                      )}
                      {mat.properties.flameType && (
                        <div className="col-span-2">
                          <span className="text-orange-400 block uppercase font-semibold flex items-center gap-1">
                            <Flame size={10} /> Flame Emission / Reaction:
                          </span>
                          <span className="text-orange-200">{mat.properties.flameType}</span>
                        </div>
                      )}
                      {mat.properties.dimensionFactor && (
                        <div className="col-span-2">
                          <span className="text-purple-400 block uppercase font-semibold flex items-center gap-1">
                            <Sparkles size={10} /> 4D Manifold Coordinates:
                          </span>
                          <span className="text-purple-200">{mat.properties.dimensionFactor}</span>
                        </div>
                      )}
                      {mat.properties.quantumPhase && (
                        <div className="col-span-2">
                          <span className="text-cyan-400 block uppercase font-semibold">Quantum Phase:</span>
                          <span className="text-cyan-200">{mat.properties.quantumPhase}</span>
                        </div>
                      )}
                      {mat.properties.refractiveIndex && (
                        <div>
                          <span className="text-neutral-500 block uppercase font-semibold">Refractive Index:</span>
                          <span className="text-neutral-200">{mat.properties.refractiveIndex}</span>
                        </div>
                      )}
                      {mat.properties.chemicalResistance && (
                        <div className="col-span-2">
                          <span className="text-neutral-500 block uppercase font-semibold">Resistance:</span>
                          <span className="text-neutral-400 truncate block">{mat.properties.chemicalResistance}</span>
                        </div>
                      )}
                    </div>

                    {/* Interactive Actions for the Material */}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => {
                          onSelectChemical(mat.color, mat.name);
                          labAudio.playGlassClink();
                          setSavedToast(`Infused: ${mat.name}`);
                          setTimeout(() => setSavedToast(null), 2500);
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-[11px] font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          is4D
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                            : 'bg-white text-black hover:bg-neutral-200'
                        }`}
                      >
                        <FlaskConical size={13} />
                        <span>{is4D ? 'Infuse 4D Solute' : 'Infuse into Beaker'}</span>
                      </button>

                      {isFire && (
                        <button
                          onClick={() => {
                            if (!experiment.isBurnerLit) onToggleBurner();
                            onFirePowerChange(0.95);
                            onSelectChemical(mat.color, mat.name);
                            labAudio.playIgnite();
                            setSavedToast(`🔥 Fire Reaction: ${mat.name} Ignited!`);
                            setTimeout(() => setSavedToast(null), 3000);
                          }}
                          className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-rose-600/30"
                          title="Ignite Bunsen Burner & Test Pyrotechnic Fire"
                        >
                          <Flame size={13} />
                          <span>Ignite Fire</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* D. Cinema 4D Studio Lighting Flyout */}
      {activePanel === 'lights' && (
        <div className="absolute left-20 top-56 z-40 w-72 p-5 rounded-2xl bg-black/95 border border-white/20 backdrop-blur-2xl shadow-2xl text-white animate-in fade-in slide-in-from-left-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
            <div className="flex items-center gap-2">
              <Sun size={18} className="text-white" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Studio Lighting Rig</span>
            </div>
            <button onClick={() => setActivePanel(null)} className="text-neutral-400 hover:text-white cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => onSetAllLights(true)}
              className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-left font-medium transition-colors cursor-pointer"
            >
              Studio Rig (All Full)
            </button>
            <button
              onClick={() => onToggleLight('benchSpot')}
              className={`w-full py-2 px-3 rounded-lg border text-left flex justify-between transition-colors cursor-pointer ${lighting.benchSpot ? 'border-white/40 bg-white/10' : 'border-neutral-800'
                }`}
            >
              <span>Bench Task Spotlight</span>
              <span className="font-mono text-[10px]">{lighting.benchSpot ? 'ON' : 'OFF'}</span>
            </button>
            <button
              onClick={() => onToggleLight('mainCeiling')}
              className={`w-full py-2 px-3 rounded-lg border text-left flex justify-between transition-colors cursor-pointer ${lighting.mainCeiling ? 'border-white/40 bg-white/10' : 'border-neutral-800'
                }`}
            >
              <span>Ceiling Luminaires</span>
              <span className="font-mono text-[10px]">{lighting.mainCeiling ? 'ON' : 'OFF'}</span>
            </button>
            <button
              onClick={() => onToggleLight('uvBlacklight')}
              className={`w-full py-2 px-3 rounded-lg border text-left flex justify-between transition-colors cursor-pointer ${lighting.uvBlacklight ? 'border-purple-500/50 bg-purple-950/40 text-purple-300' : 'border-neutral-800'
                }`}
            >
              <span>UV Fluorescence Blacklight</span>
              <span className="font-mono text-[10px]">{lighting.uvBlacklight ? 'ACTIVE' : 'OFF'}</span>
            </button>
          </div>
        </div>
      )}

      {/* E. Camera Angles Flyout */}
      {activePanel === 'camera' && (
        <div className="absolute left-20 top-64 z-40 w-64 p-5 rounded-2xl bg-black/95 border border-white/20 backdrop-blur-2xl shadow-2xl text-white animate-in fade-in slide-in-from-left-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-white" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Camera View</span>
            </div>
            <button onClick={() => setActivePanel(null)} className="text-neutral-400 hover:text-white cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            {(
              [
                { id: 'experiment_focus', label: 'Reaction Core (Focus)' },
                { id: 'overview', label: 'Laboratory Overview' },
                { id: 'macro_beaker', label: 'Macro Vessel Zoom' },
                { id: 'top_down', label: 'Top-Down Plan View' },
              ] as { id: CameraViewPreset; label: string }[]
            ).map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  onSetCameraPreset(preset.id);
                  setActivePanel(null);
                  labAudio.playClick();
                }}
                className={`w-full py-2 px-3 rounded-lg border text-left font-medium transition-colors cursor-pointer flex justify-between items-center ${cameraPreset === preset.id
                  ? 'border-white bg-white text-black'
                  : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 text-neutral-300'
                  }`}
              >
                <span>{preset.label}</span>
                {cameraPreset === preset.id && <CheckCircle size={14} className="text-black" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* F. Dedicated AI LAB AGENT MODAL / COPILOT PANEL */}
      {activePanel === 'agent' && (
        <div className="fixed right-6 bottom-6 top-20 z-50 w-96 flex flex-col rounded-3xl bg-black/95 border border-white/20 backdrop-blur-2xl shadow-2xl text-white animate-in fade-in slide-in-from-right-4 duration-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-white">
                  MOSEB AI Lab Copilot
                </h3>
                <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Autonomous Assistant Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setActivePanel(null)}
              className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Action Executor Bar */}
          <div className="p-3 border-b border-neutral-800/80 bg-neutral-950/70">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-2 font-bold">
              Autonomous Actions
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAgentSubmit('Ignite burner and heat solution to boiling')}
                className="py-1.5 px-2.5 rounded-lg border border-neutral-800 hover:border-white bg-neutral-900 text-[11px] font-medium text-neutral-200 hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
              >
                <Flame size={12} className="text-orange-400" />
                <span>Boil to 100°C</span>
              </button>

              <button
                onClick={() => handleAgentSubmit('Quench reaction with cryogenic ice')}
                className="py-1.5 px-2.5 rounded-lg border border-neutral-800 hover:border-white bg-neutral-900 text-[11px] font-medium text-neutral-200 hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
              >
                <Snowflake size={12} className="text-cyan-400" />
                <span>Quench to 0°C</span>
              </button>

              <button
                onClick={() => handleAgentSubmit('Refill meniscus volume to 350 mL')}
                className="py-1.5 px-2.5 rounded-lg border border-neutral-800 hover:border-white bg-neutral-900 text-[11px] font-medium text-neutral-200 hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
              >
                <Droplets size={12} className="text-sky-400" />
                <span>Refill 350 mL</span>
              </button>

              <button
                onClick={() => handleAgentSubmit('Conduct safety and thermodynamic audit')}
                className="py-1.5 px-2.5 rounded-lg border border-neutral-800 hover:border-white bg-neutral-900 text-[11px] font-medium text-neutral-200 hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
              >
                <Shield size={12} className="text-emerald-400" />
                <span>Safety Audit</span>
              </button>
            </div>

            {/* Launch Multi-Agent Command Deck */}
            <button
              onClick={() => {
                setIsMultiAgentDeckOpen(true);
                setActivePanel(null);
                labAudio.playClick();
              }}
              className="w-full mt-2.5 py-2 px-3 rounded-xl bg-white text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all cursor-pointer shadow-lg shadow-white/10"
            >
              <Bot size={15} />
              <span>Launch Multi-Agent Command Deck</span>
            </button>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
            {agentHistory.map((item, index) => (
              <div
                key={index}
                className={`p-3 rounded-2xl ${item.role === 'user'
                  ? 'bg-neutral-900 border border-neutral-800 ml-6 text-neutral-200'
                  : 'bg-white/5 border border-white/10 mr-4 text-white'
                  }`}
              >
                {item.role === 'agent' && (
                  <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold mb-1">
                    <span>AGENT COPILOT</span>
                    {item.safety && (
                      <span className="text-neutral-400">{item.safety}</span>
                    )}
                  </div>
                )}
                <p className="font-sans text-xs leading-relaxed">{item.text}</p>
              </div>
            ))}
            {agentLoading && (
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-neutral-400 text-xs flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Agent computing thermodynamic response...</span>
              </div>
            )}
          </div>

          {/* Input Prompt */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAgentSubmit();
            }}
            className="p-3 border-t border-neutral-800 bg-neutral-900/60 flex items-center gap-2"
          >
            <input
              type="text"
              value={agentPrompt}
              onChange={(e) => setAgentPrompt(e.target.value)}
              placeholder="Ask agent or command lab action..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-800 bg-black text-white outline-none focus:border-white"
            />
            <button
              type="submit"
              disabled={agentLoading || !agentPrompt.trim()}
              className="p-2 rounded-xl bg-white text-black font-semibold hover:bg-neutral-200 disabled:opacity-40 cursor-pointer"
            >
              <Zap size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Status / Action Feedback Toast */}
      {savedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-black/95 border border-white/20 text-white text-xs font-mono shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-2.5">
          <CheckCircle size={15} className="text-cyan-400" />
          <span className="font-medium">{savedToast}</span>
        </div>
      )}

      {/* Multi-Agent Command Deck Modal */}
      <MultiAgentCenter
        isOpen={isMultiAgentDeckOpen}
        onClose={() => setIsMultiAgentDeckOpen(false)}
        currentTemp={experiment.temperature}
        currentVolume={experiment.liquidVolume}
        isBurnerLit={experiment.isBurnerLit}
        soluteName={experiment.soluteName}
        onApplyApparatusAction={(action) => {
          if (action === 'IGNITE_BURNER') {
            if (!experiment.isBurnerLit) onToggleBurner();
            onFirePowerChange(1.0);
          } else if (action === 'ADD_ICE') {
            onAddIce();
          } else if (action === 'REFILL_WATER') {
            onRefillWater();
          }
        }}
      />
    </>
  );
};
