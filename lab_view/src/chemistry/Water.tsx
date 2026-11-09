import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface WaterProps {
  temperature: number;
  volumeMl: number; // 50 to 500
  color: string;
  waterTurbulence: number; // 0 to 1
  innerRadius?: number; // approx 0.165 for 500ml beaker
}

export const Water: React.FC<WaterProps> = ({
  temperature,
  volumeMl,
  color,
  waterTurbulence,
  innerRadius = 0.168,
}) => {
  const surfaceMeshRef = useRef<THREE.Mesh>(null);
  const bodyMeshRef = useRef<THREE.Mesh>(null);

  // Height of liquid based on volume (500ml = ~0.34m high in beaker)
  const maxVolume = 500;
  const maxHeight = 0.32;
  const liquidHeight = Math.max(0.04, (volumeMl / maxVolume) * maxHeight);
  const liquidY = liquidHeight / 2 + 0.015; // resting just above beaker bottom

  // Create high-subdivision disk geometry for animated boiling surface waves
  const surfaceSegments = 32;
  const [surfaceGeo, originalPositions] = useMemo(() => {
    const geo = new THREE.CircleGeometry(innerRadius * 0.985, surfaceSegments);
    geo.rotateX(-Math.PI / 2);
    const positions = (geo.attributes.position as THREE.BufferAttribute).array;
    const orig = new Float32Array(positions.length);
    orig.set(positions);
    return [geo, orig];
  }, [innerRadius, surfaceSegments]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!surfaceMeshRef.current) return;

    const posAttr = surfaceGeo.attributes.position as THREE.BufferAttribute;
    const pos = posAttr.array as Float32Array;

    // Amplitude scales dramatically with boiling state
    // At 20°C: micro ripples (0.0008)
    // At 100°C: rolling boiling turbulence (0.015)
    const isBoiling = temperature >= 95;
    const baseAmp = 0.0008 + waterTurbulence * 0.014;
    const freq = isBoiling ? 14.0 : 4.0;

    for (let i = 0; i < pos.length / 3; i++) {
      const ox = originalPositions[i * 3];
      const oz = originalPositions[i * 3 + 2];
      const distFromCenter = Math.sqrt(ox * ox + oz * oz);

      // Waves: concentric ripples + chaotic cross-waves
      const wave1 = Math.sin(distFromCenter * 28.0 - t * freq) * baseAmp;
      const wave2 = Math.cos(ox * 20.0 + t * (freq * 0.8)) * (baseAmp * 0.6);
      const wave3 = isBoiling
        ? (Math.sin(ox * 35.0 + oz * 35.0 + t * 25.0) * baseAmp * 0.5)
        : 0;

      // Meniscus: curve upward slightly at outer boundary
      const meniscus = Math.pow(distFromCenter / innerRadius, 4) * 0.004;

      pos[i * 3 + 1] = originalPositions[i * 3 + 1] + wave1 + wave2 + wave3 + meniscus;
    }

    posAttr.needsUpdate = true;
    surfaceGeo.computeVertexNormals();

    // Subtle thermal expansion / convective volume breathing
    if (bodyMeshRef.current) {
      const expansion = 1.0 + (temperature / 100) * 0.025;
      bodyMeshRef.current.scale.set(1.0, expansion, 1.0);
    }
  });

  return (
    <group>
      {/* 1. Main Liquid Cylinder Body (Physical Glass/Liquid Transmission) */}
      <mesh ref={bodyMeshRef} position={[0, liquidY, 0]}>
        <cylinderGeometry
          args={[innerRadius * 0.985, innerRadius * 0.98, liquidHeight, 32, 1, true]}
        />
        <meshPhysicalMaterial
          color={color}
          transmission={0.88}
          roughness={0.06 + waterTurbulence * 0.12}
          ior={1.333}
          thickness={0.3}
          transparent
          opacity={0.88}
          depthWrite={false}
          attenuationColor={color}
          attenuationDistance={0.25}
          reflectivity={0.6}
        />
      </mesh>

      {/* 2. Dynamic Liquid Top Surface (Boiling Ripples & Meniscus) */}
      <mesh
        ref={surfaceMeshRef}
        geometry={surfaceGeo}
        position={[0, liquidHeight + 0.015, 0]}
      >
        <meshPhysicalMaterial
          color={color}
          transmission={0.92}
          roughness={0.04 + waterTurbulence * 0.15}
          ior={1.333}
          transparent
          opacity={0.92}
          reflectivity={0.85}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Surface Meniscus Ring (capillary adhesion to glass wall) */}
      <mesh position={[0, liquidHeight + 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[innerRadius * 0.94, innerRadius * 0.995, 32]} />
        <meshPhysicalMaterial
          color={color}
          transmission={0.9}
          roughness={0.1}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Beaker Bottom Liquid Disk */}
      <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[innerRadius * 0.97, 32]} />
        <meshPhysicalMaterial
          color={color}
          transmission={0.85}
          roughness={0.1}
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
