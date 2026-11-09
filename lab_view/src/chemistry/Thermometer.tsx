import React, { useMemo } from 'react';
import * as THREE from 'three';

interface ThermometerProps {
  temperature: number; // in Celsius (0 to 110)
  isSelected?: boolean;
}

export const Thermometer: React.FC<ThermometerProps> = ({
  temperature,
  isSelected = false,
}) => {
  const totalHeight = 0.45;
  const stemRadius = 0.012;
  const bulbRadius = 0.022;

  // Temperature range: -10°C to 110°C (span 120°C)
  // Column fraction: clamp between 0 and 1
  const minTemp = -10;
  const maxTemp = 110;
  const tempClamped = Math.min(maxTemp, Math.max(minTemp, temperature));
  const tempRatio = (tempClamped - minTemp) / (maxTemp - minTemp);

  // Capillary column parameters
  const columnMaxHeight = totalHeight * 0.72;
  const currentColumnHeight = Math.max(0.01, tempRatio * columnMaxHeight);

  // Pyrex glass material
  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        transmission: 0.95,
        roughness: 0.05,
        ior: 1.5,
        transparent: true,
        opacity: 0.9,
        reflectivity: 0.8,
        clearcoat: 1.0,
      }),
    []
  );

  return (
    <group>
      {/* 1. Glass Outer Stem Tube */}
      <mesh position={[0, totalHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[stemRadius, stemRadius, totalHeight, 20]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* 2. Glass Bulb at Bottom */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[bulbRadius, 20, 20]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* 3. Red Liquid Reservoir in Bulb */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[bulbRadius * 0.88, 16, 16]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#dc2626"
          emissiveIntensity={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* 4. Dynamic Red Liquid Capillary Column rising with Temperature */}
      <mesh position={[0, bulbRadius + currentColumnHeight / 2, 0]}>
        <cylinderGeometry args={[stemRadius * 0.35, stemRadius * 0.35, currentColumnHeight, 14]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#dc2626"
          emissiveIntensity={0.7}
          roughness={0.2}
        />
      </mesh>

      {/* 5. Scale Plate with Celsius Graduations */}
      <mesh position={[0, totalHeight * 0.52, -stemRadius * 0.2]}>
        <planeGeometry args={[stemRadius * 1.6, totalHeight * 0.75]} />
        <meshBasicMaterial color="#f8fafc" side={THREE.DoubleSide} transparent opacity={0.65} />
      </mesh>

      {/* 6. Celsius Markings (Tick notches along stem) */}
      {Array.from({ length: 11 }).map((_, i) => {
        const y = bulbRadius + (i / 10) * columnMaxHeight;
        const isMajor = i % 2 === 0;
        return (
          <mesh key={i} position={[stemRadius * 0.6, y, 0]}>
            <boxGeometry args={[isMajor ? 0.008 : 0.004, 0.0015, 0.002]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
        );
      })}

      {/* 7. Selection indicator */}
      {isSelected && (
        <mesh position={[0, totalHeight / 2, 0]}>
          <cylinderGeometry args={[stemRadius + 0.008, stemRadius + 0.008, totalHeight + 0.04, 16]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};
