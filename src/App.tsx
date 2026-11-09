import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LabScene } from './components/LabScene';
import { ExperimentUI } from './components/ExperimentUI';
import { ObjectInspector } from './components/ObjectInspector';
import { INITIAL_EXPERIMENT_STATE } from './simulation/thermodynamics';
import { ExperimentState, CameraViewPreset, LabToolType, LabLightingState } from './types';
import { labAudio } from './utils/audio';

export default function App() {
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
    // Smooth transition once WebGL context & shaders initialize
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 750);
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

  // Toggle experiment start/stop
  const handleToggleExperiment = useCallback(() => {
    setExperiment((prev) => {
      const nextSim = !prev.isSimulating;
      if (nextSim) {
        labAudio.playIgnite();
      }
      return {
        ...prev,
        isSimulating: nextSim,
        isBurnerLit: nextSim ? true : prev.isBurnerLit,
      };
    });
  }, []);

  // Quick ignition toggle
  const handleToggleBurner = useCallback(() => {
    setExperiment((prev) => {
      const nextLit = !prev.isBurnerLit;
      if (nextLit) {
        labAudio.playIgnite();
      }
      return {
        ...prev,
        isBurnerLit: nextLit,
      };
    });
  }, []);

  // Fire power adjustment
  const handleFirePowerChange = useCallback((power: number) => {
    setExperiment((prev) => ({
      ...prev,
      firePower: power,
    }));
  }, []);

  // Sim speed multiplier
  const handleSpeedChange = useCallback((speed: number) => {
    setExperiment((prev) => ({
      ...prev,
      simSpeed: speed,
    }));
  }, []);

  // Reset experiment back to room temperature
  const handleReset = useCallback(() => {
    setExperiment({
      ...INITIAL_EXPERIMENT_STATE,
      liquidColor: experiment.liquidColor,
      soluteName: experiment.soluteName,
    });
    labAudio.playClick();
  }, [experiment.liquidColor, experiment.soluteName]);

  // Drop cryogenic ice cube into beaker
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

  // Refill evaporated water
  const handleRefillWater = useCallback(() => {
    setExperiment((prev) => ({
      ...prev,
      liquidVolume: 350,
      temperature: Math.max(22, prev.temperature * 0.85),
    }));
    labAudio.playGlassClink();
  }, []);

  // Select chemical solute
  const handleSelectChemical = useCallback((color: string, name: string) => {
    setExperiment((prev) => ({
      ...prev,
      liquidColor: color,
      soluteName: name,
    }));
    labAudio.playGlassClink();
  }, []);

  // Selection handler
  const handleSelectItem = useCallback(
    (id: string | null, type: LabToolType | null) => {
      setSelectedId(id);
      setSelectedToolType(type);
    },
    []
  );

  // Audio mute toggle
  const handleToggleMute = useCallback(() => {
    const muted = labAudio.toggleMute();
    setIsMuted(muted);
  }, []);

  // Rotate selected item
  const handleRotateItem = useCallback(() => {
    rotateCounter.current += 1;
    // Dispatch a simulated keydown event for 'R'
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));
  }, []);

  return (
    <main className="w-screen h-screen relative overflow-hidden bg-neutral-950 font-sans">
      {/* 3D WebGL Canvas Layer */}
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

      {/* Modern Scientific HUD & Controls */}
      <ExperimentUI
        experiment={experiment}
        onToggleExperiment={handleToggleExperiment}
        onToggleBurner={handleToggleBurner}
        onFirePowerChange={handleFirePowerChange}
        onSpeedChange={handleSpeedChange}
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
      />

      {/* Floating Scientific Object Inspector */}
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
        className={`absolute inset-0 bg-slate-950 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-700 z-50 ${
          isReady ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col items-center space-y-4 max-w-sm px-6 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <div>
            <h1 className="text-sm font-mono tracking-widest text-cyan-300 font-bold uppercase">
              Virtual Chemistry Lab
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Calibrating thermodynamic solvers & WebGL optics...
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
