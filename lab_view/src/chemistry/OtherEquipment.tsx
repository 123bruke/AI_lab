import React, { useMemo } from 'react';
import * as THREE from 'three';

// 1. Graduated Measuring Cylinder (100ml)
export const MeasuringCylinder: React.FC<{ isSelected?: boolean }> = ({ isSelected = false }) => {
  const height = 0.42;
  const radius = 0.04;

  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#f0f9ff',
        roughness: 0.06,
        metalness: 0.05,
        reflectivity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide,
      }),
    []
  );

  return (
    <group>
      {/* Hexagonal anti-roll base */}
      <mesh position={[0, 0.012, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.075, 0.08, 0.024, 6]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Tall slender cylinder */}
      <mesh position={[0, height / 2 + 0.02, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, height, 24, 1, true]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Liquid inside (60ml mark) */}
      <mesh position={[0, height * 0.3 + 0.02, 0]}>
        <cylinderGeometry args={[radius * 0.94, radius * 0.94, height * 0.58, 20]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.12}
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </mesh>

      {/* Spout */}
      <mesh position={[radius, height + 0.02, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.012, 0.02, 12, 1, true, 0, Math.PI]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Graduation ticks */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[radius + 0.001, 0.08 + i * 0.038, 0]}>
          <boxGeometry args={[0.002, 0.002, 0.014]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {isSelected && (
        <mesh position={[0, height / 2, 0]}>
          <cylinderGeometry args={[radius + 0.015, radius + 0.015, height + 0.04, 16, 1, true]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
};

// 2. Chemical Reagent Bottle / Powder Jar
export const ChemicalJar: React.FC<{
  label?: string;
  chemicalName?: string;
  powderColor?: string;
  isSelected?: boolean;
}> = ({
  label = 'CuSO₄ · 5H₂O',
  powderColor = '#0284c7',
  isSelected = false,
}) => {
    const height = 0.26;
    const radius = 0.075;

    const amberGlassMat = useMemo(
      () =>
        new THREE.MeshPhysicalMaterial({
          color: '#78350f',
          roughness: 0.15,
          metalness: 0.1,
          reflectivity: 0.85,
          clearcoat: 0.8,
          transparent: true,
          opacity: 0.85,
        }),
      []
    );

    return (
      <group>
        {/* Amber glass jar body */}
        <mesh position={[0, height * 0.42, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[radius, radius, height * 0.75, 24]} />
          <primitive object={amberGlassMat} attach="material" />
        </mesh>

        {/* Shoulder & Neck */}
        <mesh position={[0, height * 0.85, 0]} castShadow>
          <cylinderGeometry args={[radius * 0.55, radius, 0.04, 24]} />
          <primitive object={amberGlassMat} attach="material" />
        </mesh>

        {/* Neck */}
        <mesh position={[0, height * 0.94, 0]} castShadow>
          <cylinderGeometry args={[radius * 0.52, radius * 0.52, 0.03, 20]} />
          <primitive object={amberGlassMat} attach="material" />
        </mesh>

        {/* Polypropylene Black Screw Cap */}
        <mesh position={[0, height + 0.01, 0]} castShadow>
          <cylinderGeometry args={[radius * 0.56, radius * 0.56, 0.035, 24]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Reagent Label paper */}
        <mesh position={[0, height * 0.42, radius + 0.001]} rotation={[0, 0, 0]}>
          <planeGeometry args={[radius * 1.3, height * 0.45]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>

        {/* Chemical Powder / Crystals inside */}
        <mesh position={[0, height * 0.28, 0]}>
          <cylinderGeometry args={[radius * 0.92, radius * 0.92, height * 0.48, 16]} />
          <meshStandardMaterial color={powderColor} roughness={0.85} />
        </mesh>

        {isSelected && (
          <mesh position={[0, height / 2, 0]}>
            <cylinderGeometry args={[radius + 0.015, radius + 0.015, height + 0.02, 16, 1, true]} />
            <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.4} />
          </mesh>
        )}
      </group>
    );
  };

// 3. Ice Bucket & Realistic Ice Cubes
export const IceBucket: React.FC<{ isSelected?: boolean; onAddIce?: () => void }> = ({
  isSelected = false,
}) => {
  const bucketRadius = 0.14;
  const bucketHeight = 0.16;

  const iceMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#e0f2fe',
        roughness: 0.12,
        metalness: 0.05,
        reflectivity: 0.9,
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.65,
      }),
    []
  );

  return (
    <group>
      {/* Insulated stainless steel bowl */}
      <mesh position={[0, bucketHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[bucketRadius, bucketRadius * 0.85, bucketHeight, 28, 1, true]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.01, 0]} castShadow>
        <cylinderGeometry args={[bucketRadius * 0.85, bucketRadius * 0.85, 0.02, 28]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Ice Cubes resting inside bucket */}
      {[
        [-0.04, 0.08, -0.02, 0.3, 0.5],
        [0.05, 0.09, 0.03, -0.2, 0.4],
        [-0.01, 0.11, 0.04, 0.5, -0.3],
        [0.02, 0.07, -0.05, 0.1, 0.8],
        [-0.05, 0.06, 0.03, -0.4, 0.1],
      ].map(([x, y, z, rx, ry], i) => (
        <mesh
          key={i}
          position={[x as number, y as number, z as number]}
          rotation={[rx as number, ry as number, 0]}
          castShadow
        >
          <boxGeometry args={[0.042, 0.042, 0.042]} />
          <primitive object={iceMat} attach="material" />
        </mesh>
      ))}

      {isSelected && (
        <mesh position={[0, bucketHeight / 2, 0]}>
          <cylinderGeometry args={[bucketRadius + 0.015, bucketRadius + 0.015, bucketHeight + 0.02, 24, 1, true]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
};

// 4. Petri Dish
export const PetriDish: React.FC<{ isSelected?: boolean }> = ({ isSelected = false }) => {
  const dishRadius = 0.1;
  const dishHeight = 0.022;

  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#2b6c97ff',
        roughness: 0.05,
        metalness: 0.05,
        reflectivity: 0.9,
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      }),
    []
  );

  return (
    <group>
      {/* Lower dish */}
      <mesh position={[0, dishHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[dishRadius, dishRadius, dishHeight, 32, 1, true]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      <mesh position={[0, 0.003, 0]} castShadow>
        <cylinderGeometry args={[dishRadius, dishRadius, 0.006, 32]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Nutrient Agar / Crystal sample layer */}
      <mesh position={[0, 0.008, 0]}>
        <cylinderGeometry args={[dishRadius * 0.95, dishRadius * 0.95, 0.005, 32]} />
        <meshStandardMaterial color="#fef08a" roughness={0.3} transparent opacity={0.8} />
      </mesh>

      {/* Upper lid slightly offset */}
      <mesh position={[0.02, dishHeight + 0.005, 0.01]} castShadow>
        <cylinderGeometry args={[dishRadius * 1.05, dishRadius * 1.05, 0.012, 32, 1, true]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {isSelected && (
        <mesh position={[0, dishHeight / 2, 0]}>
          <cylinderGeometry args={[dishRadius + 0.015, dishRadius + 0.015, dishHeight + 0.02, 24, 1, true]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
};

// 5. Pipette / Dropper
export const Pipette: React.FC<{ isSelected?: boolean }> = ({ isSelected = false }) => {
  const pipetteGlass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#f0f9ff',
        roughness: 0.05,
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.45,
      }),
    []
  );

  return (
    <group rotation={[0, 0, Math.PI / 2.2]}>
      {/* Red rubber bulb */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.6} />
      </mesh>

      {/* Glass pipette body */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.24, 14]} />
        <primitive object={pipetteGlass} attach="material" />
      </mesh>

      {/* Tapered glass tip */}
      <mesh position={[0, -0.06, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.002, 0.08, 14]} />
        <primitive object={pipetteGlass} attach="material" />
      </mesh>

      {isSelected && (
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 12, 1, true]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
};

// 6. Glass Stirring Rod
export const StirringRod: React.FC<{ isSelected?: boolean }> = ({ isSelected = false }) => {
  const rodGlass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#f0f9ff',
        roughness: 0.04,
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.5,
      }),
    []
  );

  return (
    <group rotation={[0.2, 0.4, 0]}>
      <mesh position={[0, 0.004, 0]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.38, 12]} />
        <primitive object={rodGlass} attach="material" />
      </mesh>
      {isSelected && (
        <mesh position={[0, 0.004, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.4, 12, 1, true]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
};
