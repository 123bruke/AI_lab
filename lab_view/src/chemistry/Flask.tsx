import React, { useMemo } from 'react';
import * as THREE from 'three';

interface FlaskProps {
  isSelected?: boolean;
  liquidColor?: string;
  liquidVolumeMl?: number;
}

export const Flask: React.FC<FlaskProps> = ({
  isSelected = false,
  liquidColor = '#f59e0b', // amber chemical solution
  liquidVolumeMl = 150,
}) => {
  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#f0f9ff',
        roughness: 0.06,
        metalness: 0.05,
        reflectivity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      }),
    []
  );

  return (
    <group>
      {/* 1. Conical Body of Erlenmeyer Flask */}
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.045, 0.16, 0.26, 32, 1, true]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* 2. Flat Base Plate */}
      <mesh position={[0, 0.01, 0]} castShadow>
        <cylinderGeometry args={[0.158, 0.158, 0.02, 32]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* 3. Cylindrical Neck */}
      <mesh position={[0, 0.31, 0]} castShadow>
        <cylinderGeometry args={[0.042, 0.042, 0.1, 24, 1, true]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* 4. Flanged Rim Top */}
      <mesh position={[0, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.044, 0.005, 12, 24]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* 5. Liquid inside flask */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.09, 0.145, 0.14, 24]} />
        <meshStandardMaterial
          color={liquidColor}
          roughness={0.15}
          transparent
          opacity={0.82}
          depthWrite={false}
        />
      </mesh>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.06, 0.175, 0.36, 24, 1, true]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
};
