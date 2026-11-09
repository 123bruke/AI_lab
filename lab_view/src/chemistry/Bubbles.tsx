import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface BubblesProps {
  temperature: number;
  bubbleRate: number; // 0 to 1
  liquidHeight: number;
  innerRadius?: number;
}

const BUBBLE_COUNT = 85;

export const Bubbles: React.FC<BubblesProps> = ({
  temperature,
  bubbleRate,
  liquidHeight,
  innerRadius = 0.155,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Bubble states
  const bubbleData = useMemo(() => {
    return Array.from({ length: BUBBLE_COUNT }, () => ({
      x: (Math.random() - 0.5) * innerRadius * 1.6,
      y: 0.02 + Math.random() * 0.05,
      z: (Math.random() - 0.5) * innerRadius * 1.6,
      speed: 0.08 + Math.random() * 0.22,
      wobbleSpeed: 4.0 + Math.random() * 8.0,
      wobbleAmp: 0.003 + Math.random() * 0.006,
      baseScale: 0.004 + Math.random() * 0.012,
      active: false,
    }));
  }, [innerRadius]);

  // Bubble sphere geometry
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 10, 8), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    // Determine how many bubbles should be active based on temperature & bubbleRate
    // Cold (<45°C): 0
    // Warm (60°C): ~15
    // Near boiling (85°C): ~45
    // Boiling (100°C): 85
    const activeCount = Math.floor(bubbleRate * BUBBLE_COUNT);

    for (let i = 0; i < BUBBLE_COUNT; i++) {
      const b = bubbleData[i];

      if (i < activeCount) {
        b.active = true;
        // Rising velocity increases at high temperatures
        const tempSpeedBoost = 1.0 + (temperature / 100) * 1.5;
        b.y += b.speed * tempSpeedBoost * delta;

        // Scale increases as bubble ascends (expanding vapor)
        const progress = Math.min(1, Math.max(0, b.y / (liquidHeight + 0.01)));
        const currentScale = b.baseScale * (1.0 + progress * 1.8) * (temperature >= 95 ? 1.4 : 1.0);

        // Sinusoidal buoyant wobble
        const wobbleX = Math.sin(t * b.wobbleSpeed + i) * b.wobbleAmp;
        const wobbleZ = Math.cos(t * b.wobbleSpeed + i * 1.3) * b.wobbleAmp;

        // Reset bubble when it reaches surface
        if (b.y >= liquidHeight + 0.01) {
          b.y = 0.02 + Math.random() * 0.02;
          // Respawn nucleating at bottom
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * innerRadius * 0.85;
          b.x = Math.cos(angle) * r;
          b.z = Math.sin(angle) * r;
        }

        dummy.position.set(b.x + wobbleX, b.y, b.z + wobbleZ);
        dummy.scale.set(currentScale, currentScale * 1.1, currentScale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      } else {
        // Hide inactive bubble
        b.active = false;
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[sphereGeo, undefined, BUBBLE_COUNT]}
    >
      <meshPhysicalMaterial
        color="#ffffff"
        transmission={0.92}
        roughness={0.04}
        ior={1.05} // air in water
        transparent
        opacity={0.8}
        reflectivity={0.9}
        clearcoat={1.0}
        depthWrite={false}
      />
    </instancedMesh>
  );
};
