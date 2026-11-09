import React, { useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
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
    const clampedDelta = Math.min(delta, 0.1);

    // Audio frequency & gain updates
    labAudio.updateBurnerSound(lastStateRef.current.isBurnerLit, lastStateRef.current.firePower);
    labAudio.updateBoilingSound(lastStateRef.current.temperature);

    const needsUpdate =
      lastStateRef.current.isSimulating ||
      lastStateRef.current.isBurnerLit ||
      Math.abs(lastStateRef.current.temperature - 22.0) > 0.1;

    if (needsUpdate) {
      timeAccumulator.current += clampedDelta;

      // Throttle React state dispatch to ~16-20 FPS for silky 60+ FPS WebGL render
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
  const burnerPos = useRef<[number, number, number]>([0, 0.88, 0]);
  const beakerPos = useRef<[number, number, number]>([0, 1.24, 0]);

  return (
    <div id="canvas-container" className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Suspense fallback={null}>
        <Canvas
          shadows="soft"
          dpr={[1, 2]}
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
            toneMappingExposure: 1.2,
          }}
        >
          {/* Soft atmospheric lab depth fog */}
          <color attach="background" args={['#090d16']} />
          <fog attach="fog" args={['#090d16', 5, 20]} />

          {/* Self-contained Cinema 4D Studio Lighting (No external HDR download) */}
          <ambientLight intensity={0.8} color="#e0f2fe" />
          <directionalLight
            position={[5, 8, 4]}
            intensity={2.2}
            color="#ffffff"
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />
          <directionalLight position={[-4, 6, -3]} intensity={1.2} color="#93c5fd" />
          <pointLight position={[0, 2.5, 0]} intensity={1.8} color="#ffffff" distance={6} />
          <pointLight position={[-2, 1.5, 1]} intensity={0.9} color="#38bdf8" distance={4} />

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

          {/* 4. Realistic Ambient Occlusion Soft Contact Shadows directly on the benchtop */}
          <ContactShadows
            position={[0, 0.882, 0]}
            opacity={0.65}
            scale={4.2}
            blur={1.6}
            far={1.4}
            resolution={1024}
            color="#05070a"
          />

          {/* 5. Interactive Workbench & Equipment Apparatus */}
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
      </Suspense>
    </div>
  );
};
