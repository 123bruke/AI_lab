import React, { useState } from 'react';
import { ExperimentState, CameraViewPreset, WaterState, LabLightingState } from '../types';
import { CHEMICAL_PRESETS } from '../simulation/thermodynamics';
import {
  Flame,
  FlameKindling,
  Play,
  Square,
  RotateCcw,
  Volume2,
  VolumeX,
  Eye,
  Snowflake,
  Droplets,
  Maximize2,
  Minimize2,
  Lightbulb,
  FlaskConical,
  Activity,
  X,
  Thermometer as ThermometerIcon,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { labAudio } from '../utils/audio';

interface ExperimentUIProps {
  experiment: ExperimentState;
  onToggleExperiment: () => void;
  onToggleBurner: () => void;
  onFirePowerChange: (power: number) => void;
  onSpeedChange: (speed: number) => void;
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
}

type ActivePanel = 'flame' | 'telemetry' | 'lights' | 'chemicals' | 'camera' | null;

const WATER_STATE_CONFIG: Record<
  WaterState,
  { label: string; color: string; badgeBg: string; border: string }
> = {
  ice: {
    label: 'Cryogenic Ice / Slush',
    color: 'text-cyan-300',
    badgeBg: 'bg-cyan-950/80',
    border: 'border-cyan-500/40',
  },
  liquid: {
    label: 'Calm Aqueous Liquid',
    color: 'text-sky-300',
    badgeBg: 'bg-sky-950/80',
    border: 'border-sky-500/30',
  },
  heating: {
    label: 'Heating / Nucleation',
    color: 'text-amber-300',
    badgeBg: 'bg-amber-950/80',
    border: 'border-amber-500/30',
  },
  near_boiling: {
    label: 'Near-Boiling Convective',
    color: 'text-orange-400',
    badgeBg: 'bg-orange-950/80',
    border: 'border-orange-500/40',
  },
  boiling: {
    label: 'Vigorous Rolling Boil',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/80',
    border: 'border-rose-500/50',
  },
};

const CAMERA_PRESET_LABELS: Record<CameraViewPreset, string> = {
  experiment_focus: 'Reaction Bench Focus',
  overview: 'Full Lab Room Overview',
  macro_beaker: 'Macro Vessel Optics',
  top_down: 'Orthographic Top-Down',
};

export const ExperimentUI: React.FC<ExperimentUIProps> = ({
  experiment,
  onToggleExperiment,
  onToggleBurner,
  onFirePowerChange,
  onSpeedChange,
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
}) => {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const togglePanel = (panel: ActivePanel) => {
    labAudio.playClick();
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const handleToggleFullscreen = () => {
    labAudio.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const stateCfg = WATER_STATE_CONFIG[experiment.waterState];
  const activeLightCount = Object.values(lighting).filter(Boolean).length;
  const tempF = (experiment.temperature * 9) / 5 + 32;

  // Format elapsed time MM:SS
  const mins = Math.floor(experiment.elapsedSeconds / 60);
  const secs = Math.floor(experiment.elapsedSeconds % 60);
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Qualitative flame heating description
  const getFlameSpeedNote = () => {
    if (!experiment.isBurnerLit) return 'Burner extinguished (ambient thermal cooling)';
    if (experiment.firePower >= 75) {
      return 'Fierce stoichiometric flame: Rapid boiling (~15-25 sec)';
    }
    if (experiment.firePower >= 45) {
      return 'Medium thermal cone: Moderate boiling (~45-75 sec)';
    }
    return 'Low simmer: Very slow heating (approaches heat loss equilibrium)';
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 md:p-5 select-none font-sans">
      {/* 1. TOP HEADER & SLEEK FLOATING CONTROL DOCK */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
        {/* Left: Compact Lab Title & Live Status Indicator */}
        <div className="pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  experiment.isBurnerLit ? 'bg-amber-400' : 'bg-cyan-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  experiment.isBurnerLit ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
              />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-neutral-100 uppercase">
              Virtual Chemistry Lab
            </span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 border-l border-white/10 pl-2">
            {timeStr}
          </span>
        </div>

        {/* Center: Sleek, Minimalist Control Buttons Dock */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-white/10 shadow-2xl">
          {/* 1. Fire / Flame Controller Toggle Button */}
          <button
            id="btn-toggle-flame-panel"
            onClick={() => togglePanel('flame')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
              activePanel === 'flame'
                ? 'bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-500/20'
                : experiment.isBurnerLit
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-white/5 text-neutral-300 border-transparent hover:bg-white/10'
            }`}
            title="Fire & Heat Controller"
          >
            <Flame
              className={`w-3.5 h-3.5 ${
                experiment.isBurnerLit ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-neutral-400'
              }`}
            />
            <span className="font-mono text-[11px]">
              {experiment.isBurnerLit ? `${experiment.firePower}%` : 'Burner'}
            </span>
          </button>

          {/* 2. Temperature & Telemetry Toggle Button */}
          <button
            id="btn-toggle-telemetry-panel"
            onClick={() => togglePanel('telemetry')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
              activePanel === 'telemetry'
                ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
                : 'bg-white/5 text-neutral-300 border-transparent hover:bg-white/10'
            }`}
            title="Thermodynamics Telemetry"
          >
            <ThermometerIcon
              className={`w-3.5 h-3.5 ${
                experiment.temperature > 80 ? 'text-rose-400' : 'text-sky-400'
              }`}
            />
            <span className="font-mono font-bold text-[11px] text-white">
              {experiment.temperature.toFixed(1)}°C
            </span>
            {experiment.heatingRate > 0.05 ? (
              <TrendingUp className="w-3 h-3 text-rose-400" />
            ) : experiment.heatingRate < -0.05 ? (
              <TrendingDown className="w-3 h-3 text-cyan-400" />
            ) : (
              <Minus className="w-3 h-3 text-neutral-500" />
            )}
          </button>

          {/* 3. Lab Lights Toggle Button */}
          <button
            id="btn-toggle-lights-panel"
            onClick={() => togglePanel('lights')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
              activePanel === 'lights'
                ? 'bg-yellow-500 text-slate-950 font-bold border-yellow-400 shadow-md shadow-yellow-500/20'
                : activeLightCount > 0
                ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/25'
                : 'bg-white/5 text-neutral-400 border-transparent hover:bg-white/10'
            }`}
            title="Laboratory Lighting Switchboard"
          >
            <Lightbulb
              className={`w-3.5 h-3.5 ${
                activeLightCount > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-400'
              }`}
            />
            <span className="font-mono text-[11px]">Lights ({activeLightCount}/4)</span>
          </button>

          {/* 4. Chemical Solute Toggle Button */}
          <button
            id="btn-toggle-chemicals-panel"
            onClick={() => togglePanel('chemicals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
              activePanel === 'chemicals'
                ? 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                : 'bg-white/5 text-neutral-300 border-transparent hover:bg-white/10'
            }`}
            title="Chemical Reagents"
          >
            <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: experiment.liquidColor }}
            />
            <span className="font-mono text-[11px] hidden md:inline">Solute</span>
          </button>

          {/* 5. Camera Perspective Toggle Button */}
          <button
            id="btn-toggle-camera-panel"
            onClick={() => togglePanel('camera')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
              activePanel === 'camera'
                ? 'bg-slate-700 text-white border-slate-500'
                : 'bg-white/5 text-neutral-300 border-transparent hover:bg-white/10'
            }`}
            title="Camera Perspective"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-300" />
            <span className="font-mono text-[11px] hidden lg:inline">Camera</span>
          </button>

          {/* Separator */}
          <div className="w-px h-4 bg-white/10 mx-0.5" />

          {/* Quick Simulation Start / Pause Button */}
          <button
            id="btn-quick-play-sim"
            onClick={() => {
              labAudio.playClick();
              onToggleExperiment();
            }}
            className={`p-1.5 rounded-xl border transition-all ${
              experiment.isSimulating
                ? 'bg-rose-600/30 text-rose-300 border-rose-500/50 hover:bg-rose-600/40'
                : 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/40'
            }`}
            title={experiment.isSimulating ? 'Pause Simulation' : 'Start Simulation'}
          >
            {experiment.isSimulating ? (
              <Square className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            )}
          </button>

          {/* Quick Reset Button */}
          <button
            id="btn-quick-reset"
            onClick={onReset}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-transparent transition-colors"
            title="Reset Experiment (22°C)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Audio Mute Button */}
          <button
            id="btn-quick-mute"
            onClick={onToggleMute}
            className={`p-1.5 rounded-xl border transition-colors ${
              isMuted
                ? 'bg-rose-950/60 text-rose-400 border-rose-500/30'
                : 'bg-white/5 text-neutral-300 hover:text-white border-transparent'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            id="btn-quick-fullscreen"
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-transparent transition-colors"
            title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. COMPACT FLOATING CONTROLLER PANELS (Opened upon button click) */}
      <div className="pointer-events-auto flex justify-center w-full my-auto z-20">
        {/* PANEL 1: FLAME & THERMAL CONTROLLER */}
        {activePanel === 'flame' && (
          <div className="w-80 glass-panel rounded-2xl p-4 text-white shadow-2xl border border-white/10 animate-fade-in space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-amber-300">
                  Combustion & Fire Control
                </h3>
              </div>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Ignite / Extinguish Toggle */}
            <button
              onClick={() => {
                labAudio.playClick();
                onToggleBurner();
              }}
              className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border transition-all ${
                experiment.isBurnerLit
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                  : 'bg-slate-800/80 text-neutral-300 border-white/10 hover:bg-slate-700'
              }`}
            >
              {experiment.isBurnerLit ? (
                <>
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                  <span>Extinguish Burner</span>
                </>
              ) : (
                <>
                  <FlameKindling className="w-4 h-4 text-neutral-400" />
                  <span>Ignite Bunsen Burner</span>
                </>
              )}
            </button>

            {/* Fire Power Adjustment Slider */}
            <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-white/5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-neutral-400">Thermal Output:</span>
                <span className="text-amber-400 font-bold">{experiment.firePower}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="100"
                value={experiment.firePower}
                onChange={(e) => onFirePowerChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg cursor-pointer accent-amber-500"
              />
              <p className="text-[10px] font-mono text-neutral-400 leading-tight pt-1">
                {getFlameSpeedNote()}
              </p>
            </div>

            {/* Simulation Speed & State */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-mono text-neutral-400">Sim Multiplier:</span>
              <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5 font-mono text-xs">
                {[1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      labAudio.playClick();
                      onSpeedChange(spd);
                    }}
                    className={`px-2 py-0.5 rounded-lg transition-colors font-semibold text-[11px] ${
                      experiment.simSpeed === spd
                        ? 'bg-sky-600 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: THERMODYNAMICS & TELEMETRY */}
        {activePanel === 'telemetry' && (
          <div className="w-80 glass-panel rounded-2xl p-4 text-white shadow-2xl border border-white/10 animate-fade-in space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-sky-300">
                  Thermal Telemetry
                </h3>
              </div>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Temperature Gauge Banner */}
            <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                  Bulk Temperature
                </span>
                <span className="text-2xl font-mono font-bold text-white tracking-tight">
                  {experiment.temperature.toFixed(1)}
                  <span className="text-sm font-normal text-neutral-400">°C</span>
                </span>
                <span className="text-[11px] font-mono text-neutral-400 ml-2">
                  ({tempF.toFixed(1)}°F)
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                  Thermal Flux
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    experiment.heatingRate > 0
                      ? 'text-rose-400'
                      : experiment.heatingRate < 0
                      ? 'text-cyan-400'
                      : 'text-neutral-400'
                  }`}
                >
                  {experiment.heatingRate > 0 ? '+' : ''}
                  {experiment.heatingRate.toFixed(2)} °C/s
                </span>
              </div>
            </div>

            {/* Current Phase State */}
            <div className={`p-2.5 rounded-xl border ${stateCfg.badgeBg} ${stateCfg.border}`}>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                Physical State:
              </span>
              <span className={`text-xs font-mono font-bold ${stateCfg.color}`}>
                {stateCfg.label}
              </span>
            </div>

            {/* Volume & Interventions */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs font-mono text-neutral-300">
                Volume: <strong className="text-sky-300">{experiment.liquidVolume.toFixed(0)} mL</strong>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    labAudio.playClick();
                    onRefillWater();
                  }}
                  className="px-2 py-1 rounded-lg bg-sky-900/60 hover:bg-sky-800 text-sky-200 text-[11px] font-mono flex items-center gap-1 border border-sky-500/30"
                  title="Refill to 350 mL"
                >
                  <Droplets className="w-3 h-3 text-sky-400" />
                  <span>Refill</span>
                </button>
                <button
                  onClick={() => {
                    labAudio.playClick();
                    onAddIce();
                  }}
                  className="px-2 py-1 rounded-lg bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-[11px] font-mono flex items-center gap-1 border border-cyan-500/30"
                  title="Drop Cryogenic Ice (-20°C)"
                >
                  <Snowflake className="w-3 h-3 text-cyan-400" />
                  <span>Ice Cube</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 3: MULTI-BULB LIGHT SWITCHBOARD */}
        {activePanel === 'lights' && (
          <div className="w-80 glass-panel rounded-2xl p-4 text-white shadow-2xl border border-white/10 animate-fade-in space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-yellow-300">
                  Laboratory Lighting
                </h3>
              </div>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-neutral-300">
              Toggle laboratory illumination fixtures and physical bulbs in 3D:
            </p>

            {/* Individual Bulb Toggles */}
            <div className="space-y-2">
              {/* 1. Main Ceiling Fluorescent Fixtures */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                <div>
                  <span className="text-xs font-medium block text-neutral-200">
                    Main Ceiling Luminaires
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Dual overhead fluorescent tubes
                  </span>
                </div>
                <button
                  onClick={() => onToggleLight('mainCeiling')}
                  className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
                    lighting.mainCeiling
                      ? 'bg-yellow-500 text-slate-950 shadow-md shadow-yellow-500/20'
                      : 'bg-slate-800 text-neutral-400 border border-white/10 hover:bg-slate-700'
                  }`}
                >
                  {lighting.mainCeiling ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* 2. Bench Task Spotlight */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                <div>
                  <span className="text-xs font-medium block text-neutral-200">
                    Bench Task Spotlight
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Focused high-CRI apparatus lamp
                  </span>
                </div>
                <button
                  onClick={() => onToggleLight('benchSpot')}
                  className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
                    lighting.benchSpot
                      ? 'bg-yellow-500 text-slate-950 shadow-md shadow-yellow-500/20'
                      : 'bg-slate-800 text-neutral-400 border border-white/10 hover:bg-slate-700'
                  }`}
                >
                  {lighting.benchSpot ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* 3. Fume Hood Interior Fluorescent */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                <div>
                  <span className="text-xs font-medium block text-neutral-200">
                    Fume Hood Interior Light
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Recessed station fluorescent tube
                  </span>
                </div>
                <button
                  onClick={() => onToggleLight('fumeHood')}
                  className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
                    lighting.fumeHood
                      ? 'bg-sky-400 text-slate-950 shadow-md shadow-sky-400/20'
                      : 'bg-slate-800 text-neutral-400 border border-white/10 hover:bg-slate-700'
                  }`}
                >
                  {lighting.fumeHood ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* 4. UV / Blacklight Lamp */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                <div>
                  <span className="text-xs font-medium block text-neutral-200">
                    UV / Blacklight Lamp
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Ultraviolet actinic inspection tubes
                  </span>
                </div>
                <button
                  onClick={() => onToggleLight('uvBlacklight')}
                  className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
                    lighting.uvBlacklight
                      ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                      : 'bg-slate-800 text-neutral-400 border border-white/10 hover:bg-slate-700'
                  }`}
                >
                  {lighting.uvBlacklight ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Master Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onSetAllLights(true)}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-neutral-200 text-xs font-mono font-medium border border-white/10 transition-colors"
              >
                All Lights ON
              </button>
              <button
                onClick={() => onSetAllLights(false)}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-neutral-200 text-xs font-mono font-medium border border-white/10 transition-colors"
              >
                All Lights OFF
              </button>
            </div>
          </div>
        )}

        {/* PANEL 4: CHEMICAL REAGENTS & SOLUTES */}
        {activePanel === 'chemicals' && (
          <div className="w-80 glass-panel rounded-2xl p-4 text-white shadow-2xl border border-white/10 animate-fade-in space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-indigo-300">
                  Solute Reagents
                </h3>
              </div>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-neutral-300">
              Select chemical solute to infuse into reaction vessel:
            </p>

            <div className="space-y-1.5">
              {CHEMICAL_PRESETS.map((chem) => {
                const isCurrent = experiment.soluteName === chem.name;
                return (
                  <button
                    key={chem.formula}
                    onClick={() => {
                      labAudio.playClick();
                      onSelectChemical(chem.color, chem.name);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left font-mono border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-sky-500/20 text-white border-sky-400 font-bold shadow-md shadow-sky-500/20'
                        : 'bg-slate-900/60 text-neutral-300 border-white/5 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: chem.color }}
                      />
                      <div className="truncate">
                        <span className="text-xs font-semibold block leading-tight truncate">
                          {chem.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 block font-mono">
                          {chem.formula}
                        </span>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider shrink-0">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PANEL 5: CAMERA PERSPECTIVES */}
        {activePanel === 'camera' && (
          <div className="w-72 glass-panel rounded-2xl p-4 text-white shadow-2xl border border-white/10 animate-fade-in space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-neutral-300" />
                <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-neutral-200">
                  Camera Perspective
                </h3>
              </div>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              {(
                [
                  'experiment_focus',
                  'overview',
                  'macro_beaker',
                  'top_down',
                ] as CameraViewPreset[]
              ).map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    labAudio.playClick();
                    onSetCameraPreset(preset);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs font-mono transition-all border ${
                    cameraPreset === preset
                      ? 'bg-sky-500/20 text-sky-200 border-sky-400 font-bold'
                      : 'bg-slate-900/60 text-neutral-300 border-white/5 hover:bg-slate-800'
                  }`}
                >
                  {CAMERA_PRESET_LABELS[preset]}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-neutral-400 font-mono pt-1">
              Drag mouse on bench to rotate 3D view; scroll wheel to zoom.
            </p>
          </div>
        )}
      </div>

      {/* 3. BOTTOM SUBTLE INFO BAR (Minimalist & Non-Obstructive) */}
      <div className="pointer-events-none flex items-center justify-between text-[11px] font-mono text-neutral-400 px-2">
        <span className="hidden sm:inline">
          Click any piece of equipment to inspect or drag across the workbench
        </span>
        <span className="ml-auto">
          Rotate selected: <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-200">R</kbd>
        </span>
      </div>
    </div>
  );
};
