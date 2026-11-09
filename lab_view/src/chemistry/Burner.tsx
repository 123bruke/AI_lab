import React from 'react';
import * as THREE from 'three';
import { Fire } from './Fire';

interface BurnerProps {
  isLit: boolean;
  powerPercent: number;
  isSelected?: boolean;
}

export const Burner: React.FC<BurnerProps> = ({
  isLit,
  powerPercent,
  isSelected = false,
}) => {
  const baseRadius = 0.12;
  const barrelHeight = 0.28;
  const barrelRadius = 0.022;

  return (
    <group>
      {/* 1. Heavy Cast Iron Base */}
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[baseRadius * 0.85, baseRadius, 0.03, 24]} />
        <meshStandardMaterial
          color="#1e242b"
          roughness={0.7}
          metalness={0.8}
        />
      </mesh>

      {/* 2. Gas Intake Nozzle & Tube barb */}
      <mesh position={[-baseRadius * 0.7, 0.025, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.01, 0.012, 0.08, 16]} />
        <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Flexible Gas Hose curving backwards */}
      <mesh position={[-baseRadius * 1.3, 0.015, 0.06]} rotation={[0.2, 0.4, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.14, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>

      {/* 3. Central Brass Air Collar */}
      <mesh position={[0, 0.065, 0]} castShadow>
        <cylinderGeometry args={[barrelRadius * 1.35, barrelRadius * 1.35, 0.035, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Air intake vent holes */}
      <mesh position={[barrelRadius * 1.36, 0.065, 0]}>
        <boxGeometry args={[0.005, 0.018, 0.012]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>
      <mesh position={[-barrelRadius * 1.36, 0.065, 0]}>
        <boxGeometry args={[0.005, 0.018, 0.012]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>

      {/* 4. Chrome Steel Chimney Barrel */}
      <mesh position={[0, barrelHeight / 2 + 0.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[barrelRadius, barrelRadius, barrelHeight, 24]} />
        <meshStandardMaterial
          color="#94a3b8"
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>

      {/* Top chimney crown nozzle */}
      <mesh position={[0, barrelHeight + 0.04, 0]} castShadow>
        <cylinderGeometry args={[barrelRadius * 1.15, barrelRadius, 0.015, 24]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* 5. Realistic Layered Flame & Dynamic Lighting */}
      <Fire
        isLit={isLit}
        powerPercent={powerPercent}
        position={[0, barrelHeight + 0.045, 0]}
      />

      {/* 6. Selection Highlight Ring */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]}>
          <ringGeometry args={[baseRadius * 1.05, baseRadius * 1.15, 32]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};
