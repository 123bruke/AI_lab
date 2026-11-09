import React, { useState } from 'react';
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
  Activity,
  Layers,
  Thermometer,
  Zap,
  CheckCircle,
  AlertTriangle,
  Play,
  Shield,
  Save,
  BookmarkCheck,
  Bot
} from 'lucide-react';
import { ExperimentState, CameraViewPreset, LabLightingState } from '../types';
import { CHEMICAL_PRESETS } from '../simulation/thermodynamics';
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

type FlyoutPanel = 'burner' | 'chemicals' | 'lights' | 'camera' | 'agent' | null;

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

  const handleSaveToDatabase = async () => {
    try {
      const res = await api.saveExperiment({
        title: `Observation: ${experiment.soluteName}`,
        temperature: experiment.temperature,
        volume_ml: experiment.liquidVolume,
        solute_name: experiment.soluteName,
        fire_power: experiment.firePower,
        water_state: experiment.waterState,
      });
      labAudio.playClick();
      setSavedToast(`Saved to SQLite (Record #${res.id || 'Local'})`);
      setTimeout(() => setSavedToast(null), 3000);
    } catch {
      setSavedToast('Saved to local journal');
      setTimeout(() => setSavedToast(null), 3000);
    }
  };

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

    setAgentHistory((prev) => [...prev, { role: 'user', text: q }]);
    setAgentPrompt('');
    setAgentLoading(true);

    try {
      const res: AgentResponse = await api.consultAgent({
        prompt: q,
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
      {/* 1. Top Minimalist Essential Telemetry Strip (Black & White standard) */}
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
            <span className="text-neutral-300">{experiment.soluteName}</span>
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

      {/* 2. Unified Black & White Vertical Sidebar Dock (Left) */}
      <aside className="absolute left-4 top-20 bottom-20 z-30 pointer-events-auto flex flex-col justify-center">
        <div className="p-2 rounded-2xl bg-black/90 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col items-center gap-2 text-white">
          {/* 1. AI Agent Button (Special Highlight) */}
          <button
            onClick={() => togglePanel('agent')}
            title="MOSEB AI Lab Copilot (Action Assistant)"
            className={`p-3 rounded-xl transition-all cursor-pointer relative ${activePanel === 'agent'
              ? 'bg-white text-black shadow-lg shadow-white/20'
              : 'hover:bg-neutral-800 text-cyan-400'
              }`}
          >
            <Sparkles size={20} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
          </button>

          <div className="w-6 h-[1px] bg-neutral-800 my-1" />

          {/* 2. Burner / Heat Control */}
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

          {/* 3. Chemical Reagents */}
          <button
            onClick={() => togglePanel('chemicals')}
            title="Chemical Solute Catalog"
            className={`p-3 rounded-xl transition-all cursor-pointer ${activePanel === 'chemicals'
              ? 'bg-white text-black'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
          >
            <FlaskConical size={20} />
          </button>

          {/* 4. Drop Cryogenic Ice */}
          <button
            onClick={() => {
              onAddIce();
              labAudio.playGlassClink();
            }}
            title="Drop Cryogenic Ice Block (-20°C Quench)"
            className="p-3 rounded-xl text-neutral-400 hover:text-cyan-300 hover:bg-neutral-800 transition-all cursor-pointer active:scale-95"
          >
            <Snowflake size={20} />
          </button>

          {/* 5. Refill Water */}
          <button
            onClick={() => {
              onRefillWater();
              labAudio.playGlassClink();
            }}
            title="Refill Pure Distilled Water (350 mL)"
            className="p-3 rounded-xl text-neutral-400 hover:text-sky-300 hover:bg-neutral-800 transition-all cursor-pointer active:scale-95"
          >
            <Droplets size={20} />
          </button>

          <div className="w-6 h-[1px] bg-neutral-800 my-1" />

          {/* 6. Cinema 4D Studio Lighting */}
          <button
            onClick={() => togglePanel('lights')}
            title="Cinema 4D Studio Lighting Rig"
            className={`p-3 rounded-xl transition-all cursor-pointer ${activePanel === 'lights'
              ? 'bg-white text-black'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
          >
            <Sun size={20} />
          </button>

          {/* 7. Camera Angles */}
          <button
            onClick={() => togglePanel('camera')}
            title="Camera Viewpoint Manager"
            className={`p-3 rounded-xl transition-all cursor-pointer ${activePanel === 'camera'
              ? 'bg-white text-black'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
          >
            <Eye size={20} />
          </button>

          {/* 8. Reset Experiment */}
          <button
            onClick={() => {
              onReset();
              labAudio.playClick();
            }}
            title="Reset Experiment to 22°C"
            className="p-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer active:rotate-180"
          >
            <RotateCcw size={20} />
          </button>

          {/* 9. Audio Mute */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </aside>

      {/* 3. Flyout Panels (Opened from the Sidebar buttons) */}
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

      {/* B. Chemical Solutes Flyout */}
      {activePanel === 'chemicals' && (
        <div className="absolute left-20 top-36 z-40 w-80 p-5 rounded-2xl bg-black/95 border border-white/20 backdrop-blur-2xl shadow-2xl text-white animate-in fade-in slide-in-from-left-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
            <div className="flex items-center gap-2">
              <FlaskConical size={18} className="text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Select Reagent</span>
            </div>
            <button onClick={() => setActivePanel(null)} className="text-neutral-400 hover:text-white cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {CHEMICAL_PRESETS.map((chem) => (
              <button
                key={chem.name}
                onClick={() => {
                  onSelectChemical(chem.color, chem.name);
                  setActivePanel(null);
                }}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${experiment.soluteName === chem.name
                  ? 'border-white bg-white/10 text-white'
                  : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 text-neutral-300'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: chem.color }}
                  />
                  <span className="text-xs font-medium">{chem.name}</span>
                </div>
                {experiment.soluteName === chem.name && <CheckCircle size={14} className="text-white" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* C. Cinema 4D Studio Lighting Flyout */}
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
              Cinema 4D Studio Rig (Full)
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

      {/* D. Camera Angles Flyout */}
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
            {[
              { id: 'experiment_focus', label: 'Reaction Vessel Focus' },
              { id: 'macro_beaker', label: 'Macro Optical Zoom' },
              { id: 'top_down', label: 'Orthographic Top-Down' },
              { id: 'overview', label: 'Full Laboratory Room' },
            ].map((cam) => (
              <button
                key={cam.id}
                onClick={() => {
                  onSetCameraPreset(cam.id as CameraViewPreset);
                  setActivePanel(null);
                }}
                className={`w-full py-2 px-3 rounded-lg border text-left transition-colors cursor-pointer ${cameraPreset === cam.id
                  ? 'border-white bg-white text-black font-semibold'
                  : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/40 text-neutral-300'
                  }`}
              >
                {cam.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* E. Dedicated AI LAB AGENT MODAL / COPILOT PANEL */}
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
          </div>

          {/* Chat / Diagnostic Conversation Stream */}
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
    </>
  );
};
