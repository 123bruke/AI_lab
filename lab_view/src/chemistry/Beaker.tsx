import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Water } from './Water';
import { Bubbles } from './Bubbles';
import { Steam } from './Steam';
import { createBeakerGraduationTexture } from './textures';

interface BeakerProps {
  temperature: number;
  volumeMl: number;
  liquidColor: string;
  bubbleRate: number;
  steamIntensity: number;
  waterTurbulence: number;
  isSelected?: boolean;
}

export const Beaker: React.FC<BeakerProps> = ({
  temperature,
  volumeMl,
  liquidColor,
  bubbleRate,
  steamIntensity,
  waterTurbulence,
  isSelected = false,
}) => {
  const graduationTexture = useMemo(() => createBeakerGraduationTexture(), []);

  // Beaker dimensions (500ml standard Pyrex beaker)
  const outerRadius = 0.18;
  const innerRadius = 0.168;
  const height = 0.38;

  // Liquid height based on volume
  const liquidHeight = Math.max(0.04, (volumeMl / 500) * 0.32);

  // Common Borosilicate Glass Material (Pyrex Boro 3.3)
  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#f0f9ff',
        transmission: 0.95,
        roughness: 0.04,
        ior: 1.52,
        thickness: 0.22,
        transparent: true,
        opacity: 0.95,
        reflectivity: 0.85,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    []
  );

  return (
    <group>
      {/* 1. Outer Glass Cylinder Wall */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[outerRadius, outerRadius * 0.98, height, 36, 1, true]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* 2. Inner Glass Cylinder Wall (Gives physical glass thickness) */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[innerRadius, innerRadius * 0.98, height - 0.02, 36, 1, true]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* 3. Thick Solid Glass Base Plate */}
      <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[outerRadius * 0.98, outerRadius * 0.98, 0.02, 36]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* 4. Rolled Glass Top Rim Bead */}
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[outerRadius, 0.008, 16, 36]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* 5. Pouring Spout Lip */}
      <mesh position={[outerRadius - 0.015, height + 0.004, 0]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[0.03, 0.04, 16, 1, true, 0, Math.PI]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* 6. Printed Graduation Scale / Markings Cylinder (500ml Pyrex markings) */}
      <mesh position={[0, height / 2, 0]} rotation={[0, Math.PI * 0.5, 0]}>
        <cylinderGeometry
          args={[outerRadius + 0.001, outerRadius + 0.001, height * 0.85, 36, 1, true, -Math.PI * 0.4, Math.PI * 0.8]}
        />
        <meshBasicMaterial
          map={graduationTexture}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 7. Realistic Liquid / Water */}
      <Water
        temperature={temperature}
        volumeMl={volumeMl}
        color={liquidColor}
        waterTurbulence={waterTurbulence}
        innerRadius={innerRadius}
      />

      {/* 8. Nucleation & Boiling Bubbles inside liquid */}
      <Bubbles
        temperature={temperature}
        bubbleRate={bubbleRate}
        liquidHeight={liquidHeight}
        innerRadius={innerRadius}
      />

      {/* 9. Rising Volumetric Steam vapor */}
      <Steam
        steamIntensity={steamIntensity}
        startY={height}
        mouthRadius={outerRadius}
      />

      {/* 10. Selected outline / halo ring */}
      {isSelected && (
        <mesh position={[0, height / 2, 0]}>
          <cylinderGeometry args={[outerRadius + 0.015, outerRadius + 0.015, height + 0.02, 32, 1, true]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
};
