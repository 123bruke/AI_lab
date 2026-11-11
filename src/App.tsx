import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LabScene } from './components/LabScene';
import { AgenticChatbot } from './components/AgenticChatbot';
import { ObjectInspector } from './components/ObjectInspector';
import { MaterialsModal } from './components/MaterialsModal';
import { INITIAL_BENCH_ITEMS } from './components/InteractiveBench';
import { INITIAL_EXPERIMENT_STATE } from './simulation/thermodynamics';
import { ExperimentState, CameraViewPreset, LabToolType, LabLightingState, BenchItemData } from './types';
import { LabMaterial } from './data/materialsData';
import { labAudio } from './utils/audio';
import { initGlobalErrorHandling } from './services/telemetry';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Flame,
  Thermometer,
  Eye,
  Camera,
  Layers,
  FlaskConical,
  Sun,
  Boxes,
} from 'lucide-react';

export default function App() {
  const [experiment, setExperiment] = useState<ExperimentState>(INITIAL_EXPERIMENT_STATE);
  const [benchItems, setBenchItems] = useState<BenchItemData[]>(INITIAL_BENCH_ITEMS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedToolType, setSelectedToolType] = useState<LabToolType | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset>('experiment_focus');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDraggingItem, setIsDraggingItem] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isMaterialsOpen, setIsMaterialsOpen] = useState<boolean>(false);
  const [lighting, setLighting] = useState<LabLightingState>({
    mainCeiling: true,
    benchSpot: true,
    fumeHood: true,
    uvBlacklight: false,
  });

  useEffect(() => {
    initGlobalErrorHandling();
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const rotateCounter = useRef(0);

  const handleToggleLight = useCallback((lightKey: keyof LabLightingState) => {
    setLighting((prev) => ({
      ...prev,
      [lightKey]: !prev[lightKey],
    }));
    labAudio.playClick();
  }, []);

  const handleToggleBurner = useCallback(() => {
    setExperiment((prev) => {
      const nextLit = !prev.isBurnerLit;
      if (nextLit) {
        labAudio.playIgnite();
      }
      return {
        ...prev,
        isBurnerLit: nextLit,
        isSimulating: true,
      };
    });
  }, []);

  const handleFirePowerChange = useCallback((power: number) => {
    setExperiment((prev) => ({
      ...prev,
      firePower: power,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setExperiment({
      ...INITIAL_EXPERIMENT_STATE,
      liquidColor: experiment.liquidColor,
      soluteName: experiment.soluteName,
    });
    setBenchItems(INITIAL_BENCH_ITEMS);
    setSelectedId(null);
    setSelectedToolType(null);
    labAudio.playClick();
  }, [experiment.liquidColor, experiment.soluteName]);

  const handleAddIce = useCallback(() => {
    setExperiment((prev) => {
      const cooledTemp = Math.max(0.5, prev.temperature - 20);
      return {
        ...prev,
        temperature: cooledTemp,
        liquidVolume: Math.min(500, prev.liquidVolume + 30),
      };
    });
    labAudio.playGlassClink();
  }, []);

  const handleRefillWater = useCallback(() => {
    setExperiment((prev) => ({
      ...prev,
      liquidVolume: 350,
      temperature: Math.max(22, prev.temperature * 0.85),
    }));
    labAudio.playGlassClink();
  }, []);

  const handleSelectChemical = useCallback((color: string, name: string) => {
    setExperiment((prev) => ({
      ...prev,
      liquidColor: color,
      soluteName: name,
    }));
    labAudio.playGlassClink();
  }, []);

  const handleSelectItem = useCallback(
    (id: string | null, type: LabToolType | null) => {
      setSelectedId(id);
      setSelectedToolType(type);
    },
    []
  );

  const handleToggleMute = useCallback(() => {
    const muted = labAudio.toggleMute();
    setIsMuted(muted);
  }, []);

  const handleRotateItem = useCallback(() => {
    rotateCounter.current += 1;
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));
  }, []);

  // Add material / tool to the 3D table
  const handleAddMaterialToBench = useCallback(
    (material: LabMaterial) => {
      const count = benchItems.length;
      // Stagger items neatly across the bench
      const col = ((count - 10) % 5) - 2;
      const row = Math.floor((count - 10) / 5) % 2 === 0 ? 0.35 : -0.35;
      const posX = col * 0.42;
      const posZ = row;

      const newItem: BenchItemData = {
        id: `placed_${material.id}_${Date.now()}`,
        type: (material.toolType as LabToolType) || 'dynamic_material',
        name: material.name,
        pos: [posX, 0.88, posZ],
        rotY: 0,
        isRemovable: true,
        materialRefId: material.id,
        color: material.color,
        description: material.description,
      };

      setBenchItems((prev) => [...prev, newItem]);
      setSelectedId(newItem.id);
      setSelectedToolType(newItem.type);
    },
    [benchItems.length]
  );

  // Delete / Remove item from table
  const handleRemoveBenchItem = useCallback(
    (id: string) => {
      setBenchItems((prev) => prev.filter((item) => item.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setSelectedToolType(null);
      }
      labAudio.playGlassClink();
    },
    [selectedId]
  );

  const handleClearCustomItems = useCallback(() => {
    setBenchItems(INITIAL_BENCH_ITEMS);
    setSelectedId(null);
    setSelectedToolType(null);
    labAudio.playGlassClink();
  }, []);

  // Temperature color indicator
  const getTempColor = (temp: number) => {
    if (temp <= 5) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    if (temp < 45) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (temp < 80) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse';
  };

  return (
    <main className="w-screen h-screen relative bg-neutral-950 font-sans overflow-hidden select-none">
      {/* 1. Cinema 4D Optical WebGL Canvas (Full viewport direct 3D laboratory) */}
      <div className="w-full h-full absolute inset-0 z-0">
        <LabScene
          experiment={experiment}
          setExperiment={setExperiment}
          benchItems={benchItems}
          setBenchItems={setBenchItems}
          selectedId={selectedId}
          onSelectItem={handleSelectItem}
          cameraPreset={cameraPreset}
          onAddIce={handleAddIce}
          onAddChemical={handleSelectChemical}
          isDraggingItem={isDraggingItem}
          setIsDraggingItem={setIsDraggingItem}
          lighting={lighting}
          onRemoveBenchItem={handleRemoveBenchItem}
        />
      </div>

      {/* 2. Top Floating Minimal Glassmorphic Telemetry HUD */}
      <header className="absolute top-4 left-4 right-4 z-30 pointer-events-none flex items-center justify-between">
        {/* Left: Clean Branding & Active Telemetry */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-neutral-950/85 border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-white">
              Virtual Science Lab
            </span>
          </div>

          {/* Dedicated Materials Button */}
          <button
            onClick={() => {
              setIsMaterialsOpen(true);
              labAudio.playClick();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#10a37f] hover:bg-emerald-600 text-white font-medium text-xs transition-all shadow-lg shadow-emerald-700/30 active:scale-95 cursor-pointer border border-emerald-400/40"
          >
            <Boxes size={15} />
            <span>Materials & Optics ({LAB_MATERIALS_DATABASE.length})</span>
          </button>

          {/* Current Chemical Solute */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-neutral-950/80 border border-white/10 backdrop-blur-xl shadow-lg text-xs font-mono">
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm"
              style={{ backgroundColor: experiment.liquidColor }}
            />
            <span className="text-neutral-200 font-medium truncate max-w-[140px]">
              {experiment.soluteName}
            </span>
            <span className="text-neutral-500">|</span>
            <span className="text-neutral-400">{Math.round(experiment.liquidVolume)} mL</span>
          </div>

          {/* Temperature & Water State Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border backdrop-blur-xl shadow-lg text-xs font-mono font-semibold ${getTempColor(
              experiment.temperature
            )}`}
          >
            <Thermometer size={13} />
            <span>{experiment.temperature.toFixed(1)}°C</span>
            <span className="text-[10px] opacity-80 uppercase tracking-tight">
              ({experiment.waterState.replace('_', ' ')})
            </span>
          </div>

          {/* Burner Flame Status */}
          {experiment.isBurnerLit ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-orange-500/15 border border-orange-500/40 text-orange-400 backdrop-blur-xl text-xs font-mono font-semibold animate-pulse">
              <Flame size={13} />
              <span>FLAME {experiment.firePower}%</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-neutral-950/60 border border-white/5 text-neutral-500 backdrop-blur-xl text-xs font-mono">
              <Flame size={12} />
              <span>BURNER OFF</span>
            </div>
          )}
        </div>

        {/* Right: Quick Controls Bar */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Camera View Switcher */}
          <div className="flex items-center bg-neutral-950/80 border border-white/10 backdrop-blur-xl rounded-2xl p-1 shadow-lg">
            {(
              [
                { id: 'experiment_focus', label: 'Bench' },
                { id: 'macro_beaker', label: 'Macro' },
                { id: 'top_down', label: 'Top' },
                { id: 'overview', label: 'Wide' },
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setCameraPreset(preset.id);
                  labAudio.playClick();
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition-all cursor-pointer ${
                  cameraPreset === preset.id
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-2xl bg-neutral-950/80 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 backdrop-blur-xl shadow-lg transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Reset Bench */}
          <button
            onClick={handleReset}
            title="Reset Laboratory Bench & Items"
            className="p-2 rounded-2xl bg-neutral-950/80 border border-white/10 text-neutral-400 hover:text-rose-400 hover:bg-white/10 backdrop-blur-xl shadow-lg transition-all cursor-pointer"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </header>

      {/* 3. Modern ChatGPT-Style Agentic AI Copilot (White & Emerald Green) */}
      <AgenticChatbot
        experiment={experiment}
        onToggleBurner={handleToggleBurner}
        onFirePowerChange={handleFirePowerChange}
        onSelectChemical={handleSelectChemical}
        onAddIce={handleAddIce}
        onRefillWater={handleRefillWater}
        onSetCameraPreset={setCameraPreset}
        onToggleLight={handleToggleLight}
        onReset={handleReset}
        onOpenMaterials={() => setIsMaterialsOpen(true)}
      />

      {/* 4. Materials Drawer / Modal */}
      <MaterialsModal
        isOpen={isMaterialsOpen}
        onClose={() => setIsMaterialsOpen(false)}
        benchItems={benchItems}
        onAddMaterialToBench={handleAddMaterialToBench}
        onRemoveBenchItem={handleRemoveBenchItem}
        onClearCustomItems={handleClearCustomItems}
      />

      {/* 5. Floating Scientific Object Inspector (Appears when apparatus item is clicked) */}
      {selectedToolType && (
        <ObjectInspector
          toolType={selectedToolType}
          onClose={() => {
            setSelectedId(null);
            setSelectedToolType(null);
          }}
          onRotateItem={handleRotateItem}
          onAddIce={handleAddIce}
          onSelectChemical={handleSelectChemical}
          onRefillWater={handleRefillWater}
          onDeleteItem={() => selectedId && handleRemoveBenchItem(selectedId)}
        />
      )}

      {/* 6. Smooth Laboratory Initialization Loading Screen */}
      <div
        id="lab-loader-overlay"
        className={`absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-700 z-50 ${
          isReady ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col items-center space-y-4 max-w-sm px-6 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-white">
              Virtual Science Laboratory
            </h1>
            <p className="text-xs text-neutral-400 mt-1 font-sans">
              Initializing 3D optical shaders & physical simulator...
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
