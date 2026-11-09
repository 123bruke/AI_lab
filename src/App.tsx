import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LabScene } from './components/LabScene';
import { UnifiedLabSidebar } from './components/UnifiedLabSidebar';
import { ObjectInspector } from './components/ObjectInspector';
import { LandingPage } from './components/LandingPage';
import { INITIAL_EXPERIMENT_STATE } from './simulation/thermodynamics';
import { ExperimentState, CameraViewPreset, LabToolType, LabLightingState } from './types';
import { labAudio } from './utils/audio';
import { initGlobalErrorHandling } from './services/telemetry';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'lab'>('landing');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [experiment, setExperiment] = useState<ExperimentState>(INITIAL_EXPERIMENT_STATE);
  const [selectedId, setSelectedId] = useState<string | null>('beaker');
  const [selectedToolType, setSelectedToolType] = useState<LabToolType | null>('beaker');
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset>('experiment_focus');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDraggingItem, setIsDraggingItem] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
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
    return () => clearTimeout(timer);
  }, []);

  const rotateCounter = useRef(0);

  const handleToggleLight = useCallback((lightKey: keyof LabLightingState) => {
    setLighting((prev) => ({
      ...prev,
      [lightKey]: !prev[lightKey],
    }));
    labAudio.playClick();
  }, []);

  const handleSetAllLights = useCallback((state: boolean) => {
    setLighting({
      mainCeiling: state,
      benchSpot: state,
      fumeHood: state,
      uvBlacklight: state,
    });
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

  // Enter lab from landing page with optional chemical solute preset
  const handleEnterLab = useCallback((presetSolute?: { name: string; color: string }) => {
    if (presetSolute) {
      setExperiment((prev) => ({
        ...prev,
        soluteName: presetSolute.name,
        liquidColor: presetSolute.color,
      }));
    }
    setCurrentView('lab');
    labAudio.playClick();
  }, []);

  return (
    <main className="w-screen h-screen relative bg-neutral-950 font-sans overflow-hidden">
      {/* Persistent Quick Mode Switcher Dock */}
      <div className="fixed top-3 right-6 z-50 flex items-center p-1 rounded-xl bg-black/90 border border-white/20 backdrop-blur-2xl shadow-2xl text-xs font-mono">
        <button
          onClick={() => setCurrentView('landing')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            currentView === 'landing'
              ? 'bg-white text-black font-bold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Landing Page
        </button>
        <button
          onClick={() => setCurrentView('lab')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            currentView === 'lab'
              ? 'bg-white text-black font-bold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          4D Virtual Lab
        </button>
      </div>

      {/* 1. Landing Page View */}
      {currentView === 'landing' ? (
        <div className="w-full h-full overflow-y-auto overflow-x-hidden relative">
          <LandingPage
            onEnterLab={handleEnterLab}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
          />
        </div>
      ) : (
        /* 2. 3D Virtual Chemistry Lab View */
        <div className="w-full h-full relative">
          {/* Cinema 4D Optical WebGL Canvas */}
          <LabScene
            experiment={experiment}
            setExperiment={setExperiment}
            selectedId={selectedId}
            onSelectItem={handleSelectItem}
            cameraPreset={cameraPreset}
            onAddIce={handleAddIce}
            onAddChemical={handleSelectChemical}
            isDraggingItem={isDraggingItem}
            setIsDraggingItem={setIsDraggingItem}
            lighting={lighting}
          />

          {/* Unified Black & White Minimalist Sidebar & Autonomous AI Agent */}
          <UnifiedLabSidebar
            experiment={experiment}
            onToggleBurner={handleToggleBurner}
            onFirePowerChange={handleFirePowerChange}
            onReset={handleReset}
            onAddIce={handleAddIce}
            onRefillWater={handleRefillWater}
            onSelectChemical={handleSelectChemical}
            cameraPreset={cameraPreset}
            onSetCameraPreset={setCameraPreset}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            lighting={lighting}
            onToggleLight={handleToggleLight}
            onSetAllLights={handleSetAllLights}
            onReturnToHome={() => setCurrentView('landing')}
          />

          {/* Floating Scientific Object Inspector on item click */}
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
            />
          )}

          {/* Laboratory Initialization Overlay */}
          <div
            id="lab-loader-overlay"
            className={`absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-700 z-50 ${isReady ? 'opacity-0' : 'opacity-100'
              }`}
          >
            <div className="flex flex-col items-center space-y-4 max-w-sm px-6 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <div>
                <h1 className="text-sm font-mono tracking-widest text-white font-bold uppercase">
                  MOSEB_STUDENT_LAB
                </h1>
                <p className="text-xs text-neutral-400 mt-1 font-mono">
                  Initializing Cinema 4D PBR Shaders & Numerical Solvers...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
