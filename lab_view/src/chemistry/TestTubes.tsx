import React, { useMemo } from 'react';
import * as THREE from 'three';

interface TestTubesProps {
  isSelected?: boolean;
}

export const TestTubes: React.FC<TestTubesProps> = ({ isSelected = false }) => {
  const rackWidth = 0.38;
  const rackHeight = 0.22;
  const rackDepth = 0.12;

  // Fast, high-gloss glass material for tubes
  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#f0f9ff',
        roughness: 0.05,
        metalness: 0.05,
        reflectivity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      }),
    []
  );

  const tubeColors = [
    { color: '#ec4899', name: 'Phenolphthalein (Pink)' },
    { color: '#0284c7', name: 'Copper Sulfate (Blue)' },
    { color: '#d97706', name: 'Iron(III) Chloride (Amber)' },
    { color: '#38bdf8', name: 'Deionized Water' },
  ];

  return (
    <group>
      {/* 1. Wooden / Phenolic Test Tube Rack Base */}
      <mesh position={[0, 0.012, 0]} castShadow receiveShadow>
        <boxGeometry args={[rackWidth, 0.024, rackDepth]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* 2. Top Hole Plate */}
      <mesh position={[0, rackHeight * 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[rackWidth, 0.018, rackDepth]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* 3. Side Upright Supports */}
      <mesh position={[-rackWidth * 0.45, rackHeight * 0.4, 0]} castShadow>
        <boxGeometry args={[0.02, rackHeight * 0.8, rackDepth * 0.9]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      <mesh position={[rackWidth * 0.45, rackHeight * 0.4, 0]} castShadow>
        <boxGeometry args={[0.02, rackHeight * 0.8, rackDepth * 0.9]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>

      {/* 4. 4 Glass Test Tubes inserted in rack */}
      {tubeColors.map((t, idx) => {
        const x = -0.135 + idx * 0.09;
        const tubeHeight = 0.24;
        const tubeRadius = 0.018;

        return (
          <group key={idx} position={[x, 0.02, 0]}>
            {/* Glass Tube Wall */}
            <mesh position={[0, tubeHeight / 2, 0]} castShadow>
              <cylinderGeometry args={[tubeRadius, tubeRadius, tubeHeight, 20, 1, true]} />
              <primitive object={glassMat} attach="material" />
            </mesh>

            {/* Rounded Glass Bottom */}
            <mesh position={[0, 0.005, 0]}>
              <sphereGeometry args={[tubeRadius, 16, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
              <primitive object={glassMat} attach="material" />
            </mesh>

            {/* Flanged Lip Rim */}
            <mesh position={[0, tubeHeight, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[tubeRadius, 0.003, 10, 20]} />
              <primitive object={glassMat} attach="material" />
            </mesh>

            {/* Chemical Liquid Inside */}
            <mesh position={[0, tubeHeight * 0.35, 0]}>
              <cylinderGeometry args={[tubeRadius * 0.9, tubeRadius * 0.9, tubeHeight * 0.65, 16]} />
              <meshStandardMaterial
                color={t.color}
                roughness={0.15}
                transparent
                opacity={0.8}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}

      {/* Selection outline */}
      {isSelected && (
        <mesh position={[0, rackHeight / 2, 0]}>
          <boxGeometry args={[rackWidth + 0.03, rackHeight + 0.04, rackDepth + 0.03]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
};
