import React from 'react';
import * as THREE from 'three';

interface LabStandProps {
  ringHeight?: number; // default ~0.35m (allows Bunsen burner to slide underneath!)
  isSelected?: boolean;
}

export const LabStand: React.FC<LabStandProps> = ({
  ringHeight = 0.36,
  isSelected = false,
}) => {
  const baseWidth = 0.28;
  const baseDepth = 0.42;
  const baseThickness = 0.025;
  const rodHeight = 0.85;
  const rodRadius = 0.012;
  const ringRadius = 0.16;

  return (
    <group>
      {/* 1. Heavy Rectangular Cast Iron Baseplate */}
      <mesh position={[0, baseThickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[baseWidth, baseThickness, baseDepth]} />
        <meshStandardMaterial
          color="#1e242b"
          roughness={0.7}
          metalness={0.8}
        />
      </mesh>

      {/* Rubber feet underneath */}
      <mesh position={[-baseWidth * 0.4, 0.003, -baseDepth * 0.4]}>
        <cylinderGeometry args={[0.012, 0.012, 0.006, 12]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>
      <mesh position={[baseWidth * 0.4, 0.003, -baseDepth * 0.4]}>
        <cylinderGeometry args={[0.012, 0.012, 0.006, 12]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>
      <mesh position={[-baseWidth * 0.4, 0.003, baseDepth * 0.4]}>
        <cylinderGeometry args={[0.012, 0.012, 0.006, 12]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>
      <mesh position={[baseWidth * 0.4, 0.003, baseDepth * 0.4]}>
        <cylinderGeometry args={[0.012, 0.012, 0.006, 12]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>

      {/* 2. Stainless Steel Upright Rod (rear mounted) */}
      <mesh position={[0, rodHeight / 2 + baseThickness, baseDepth * 0.35]} castShadow>
        <cylinderGeometry args={[rodRadius, rodRadius, rodHeight, 20]} />
        <meshStandardMaterial
          color="#94a3b8"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Rod base hex nut */}
      <mesh position={[0, baseThickness + 0.01, baseDepth * 0.35]}>
        <cylinderGeometry args={[0.02, 0.02, 0.018, 6]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* 3. Boss Head Clamp (Black enameled clamp) */}
      <group position={[0, ringHeight, baseDepth * 0.35]}>
        <mesh castShadow>
          <boxGeometry args={[0.045, 0.045, 0.045]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.8} />
        </mesh>
        {/* Thumbscrew knob */}
        <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.02, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* 4. Ring Clamp Extension Arm */}
      <group position={[0, ringHeight, 0]}>
        {/* Arm connecting boss head to ring center */}
        <mesh position={[0, 0, baseDepth * 0.17]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, baseDepth * 0.35, 14]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.3} />
        </mesh>

        {/* Circular Steel Support Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[ringRadius, 0.008, 16, 32]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.3} />
        </mesh>

        {/* 5. Ceramic-Centered Wire Gauze resting on the ring */}
        {/* Galvanized wire mesh square */}
        <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
          <planeGeometry args={[0.26, 0.26]} />
          <meshStandardMaterial
            color="#475569"
            metalness={0.7}
            roughness={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Ceramic heat-resistant white center disk */}
        <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.085, 32]} />
          <meshStandardMaterial
            color="#f1f5f9"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      </group>

      {/* Selection outline */}
      {isSelected && (
        <mesh position={[0, baseThickness / 2, 0]}>
          <boxGeometry args={[baseWidth + 0.02, baseThickness + 0.01, baseDepth + 0.02]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
};
