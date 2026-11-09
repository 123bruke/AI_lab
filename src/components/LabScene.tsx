import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Laboratory } from '../environment/Laboratory';
import { InteractiveBench } from './InteractiveBench';
import { CameraManager } from './CameraManager';
import { ExperimentState, CameraViewPreset, LabToolType, LabLightingState } from '../types';
import { updateThermodynamics } from '../simulation/thermodynamics';
import { labAudio } from '../utils/audio';

interface LabSceneProps {
  experiment: ExperimentState;
  setExperiment: React.Dispatch<React.SetStateAction<ExperimentState>>;
  selectedId: string | null;
  onSelectItem: (id: string | null, type: LabToolType | null, name: string | null) => void;
  cameraPreset: CameraViewPreset;
  onAddIce: () => void;
  onAddChemical: (color: string, name: string) => void;
  isDraggingItem: boolean;
  setIsDraggingItem: (dragging: boolean) => void;
  lighting: LabLightingState;
}

// Inner simulation loop component inside Canvas context
const SimulationLoop: React.FC<{
  experiment: ExperimentState;
  setExperiment: React.Dispatch<React.SetStateAction<ExperimentState>>;
  burnerPos: React.MutableRefObject<[number, number, number]>;
  beakerPos: React.MutableRefObject<[number, number, number]>;
}> = ({ experiment, setExperiment, burnerPos, beakerPos }) => {
  const lastStateRef = useRef(experiment);
  lastStateRef.current = experiment;
  const timeAccumulator = useRef(0);

  useFrame((_, delta) => {
    // Limit delta to prevent huge jumps on tab switch
    const clampedDelta = Math.min(delta, 0.1);

    // Audio frequency & gain updates
    labAudio.updateBurnerSound(lastStateRef.current.isBurnerLit, lastStateRef.current.firePower);
    labAudio.updateBoilingSound(lastStateRef.current.temperature);

    // If simulation is running or water needs natural ambient cooling
    const needsUpdate =
      lastStateRef.current.isSimulating ||
      lastStateRef.current.isBurnerLit ||
      Math.abs(lastStateRef.current.temperature - 22.0) > 0.1;

    if (needsUpdate) {
      timeAccumulator.current += clampedDelta;

      // Throttle React state dispatch to ~16-20 FPS to keep main thread completely free for 60+ FPS WebGL
      if (timeAccumulator.current >= 0.055) {
        setExperiment((prev) =>
          updateThermodynamics(prev, timeAccumulator.current, burnerPos.current, beakerPos.current)
        );
        timeAccumulator.current = 0;
      }
    }
  });

  return null;
};

export const LabScene: React.FC<LabSceneProps> = ({
  experiment,
  setExperiment,
  selectedId,
  onSelectItem,
  cameraPreset,
  onAddIce,
  onAddChemical,
  isDraggingItem,
  setIsDraggingItem,
  lighting,
}) => {
  // Track dynamic positions for thermodynamics
  const burnerPos = useRef<[number, number, number]>([0, 0.88, 0]);
  const beakerPos = useRef<[number, number, number]>([0, 1.24, 0]);

  return (
    <div id="canvas-container" className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{
          position: [0.35, 1.48, 1.35],
          fov: 44,
          near: 0.1,
          far: 35,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        {/* Soft atmospheric lab depth fog */}
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 6, 22]} />

        {/* 1. Cinematic Camera Management */}
        <CameraManager
          viewPreset={cameraPreset}
          isDraggingItem={isDraggingItem}
        />

        {/* 2. Physics & Thermodynamics Loop */}
        <SimulationLoop
          experiment={experiment}
          setExperiment={setExperiment}
          burnerPos={burnerPos}
          beakerPos={beakerPos}
        />

        {/* 3. 3D Architectural Laboratory Room & Lighting */}
        <Laboratory lighting={lighting} />

        {/* 4. Interactive Workbench & Equipment Apparatus */}
        <InteractiveBench
          experiment={experiment}
          selectedId={selectedId}
          onSelectItem={onSelectItem}
          onBurnerPosChange={(pos) => {
            burnerPos.current = pos;
          }}
          onBeakerPosChange={(pos) => {
            beakerPos.current = pos;
          }}
          onAddIce={onAddIce}
          onAddChemical={onAddChemical}
          isDraggingItem={isDraggingItem}
          setIsDraggingItem={setIsDraggingItem}
        />
      </Canvas>
    </div>
  );
};
