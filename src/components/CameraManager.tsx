import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CameraViewPreset } from '../types';

interface CameraManagerProps {
  viewPreset: CameraViewPreset;
  isDraggingItem: boolean;
}

const CAMERA_CONFIGS: Record<CameraViewPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  experiment_focus: {
    pos: [0.35, 1.48, 1.35],
    target: [0, 1.18, 0],
  },
  macro_beaker: {
    pos: [0.06, 1.34, 0.72],
    target: [0, 1.26, 0],
  },
  overview: {
    pos: [0.4, 2.3, 3.5],
    target: [0, 1.0, 0],
  },
  top_down: {
    pos: [0, 2.9, 0.7],
    target: [0, 0.9, 0],
  },
};

export const CameraManager: React.FC<CameraManagerProps> = ({
  viewPreset,
  isDraggingItem,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetPos = useRef(new THREE.Vector3(...CAMERA_CONFIGS[viewPreset].pos));
  const targetLook = useRef(new THREE.Vector3(...CAMERA_CONFIGS[viewPreset].target));
  const isTransitioning = useRef(true);

  useEffect(() => {
    const cfg = CAMERA_CONFIGS[viewPreset];
    targetPos.current.set(...cfg.pos);
    targetLook.current.set(...cfg.target);
    isTransitioning.current = true;
  }, [viewPreset]);

  useFrame(({ camera }) => {
    if (isTransitioning.current) {
      camera.position.lerp(targetPos.current, 0.06);

      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLook.current, 0.06);
        controlsRef.current.update();
      }

      // Check if close enough to stop forced lerp
      if (
        camera.position.distanceTo(targetPos.current) < 0.02 &&
        controlsRef.current &&
        controlsRef.current.target.distanceTo(targetLook.current) < 0.02
      ) {
        isTransitioning.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!isDraggingItem}
      enableDamping
      dampingFactor={0.06}
      minDistance={0.4}
      maxDistance={6.5}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going beneath floor
      onStart={() => {
        // If user manually orbits, cancel preset transition
        isTransitioning.current = false;
      }}
    />
  );
};
