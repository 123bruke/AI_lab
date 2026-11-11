import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { LabToolType } from '../types';

interface OpticsItemProps {
  isSelected?: boolean;
  isHovered?: boolean;
  color?: string;
  name?: string;
  hasLaserActive?: boolean;
}

// 1. CONVEX LENS (Converging light)
export const ConvexLensModel: React.FC<OpticsItemProps> = ({ isSelected, isHovered }) => {
  const glassRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (glassRef.current) {
      // Subtle 4D optical chromatic shimmer
      const t = clock.getElapsedTime();
      const mat = glassRef.current.material as THREE.MeshPhysicalMaterial;
      if (mat) {
        mat.emissiveIntensity = 0.15 + Math.sin(t * 2) * 0.08;
      }
    }
  });

  return (
    <group>
      {/* Heavy Steel Base & Optical Post */}
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.045, 0.05, 0.03, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.16, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Precision Lens Ring Clamp */}
      <mesh position={[0, 0.19, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.05, 0.006, 16, 32]} />
        <meshStandardMaterial color={isSelected ? '#38bdf8' : '#334155'} metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Convex Glass Element (BK7 Crown Glass) */}
      <mesh ref={glassRef} position={[0, 0.19, 0]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[0.05, 32, 16, 0, Math.PI * 2, 0, Math.PI]} scale={[1, 1, 0.28]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          emissive="#38bdf8"
          emissiveIntensity={0.2}
          transmission={0.95}
          opacity={0.9}
          transparent
          roughness={0.05}
          ior={1.52}
        />
      </mesh>
      {/* 4D Converging Light Caustic Guides */}
      <group position={[0, 0.19, 0]}>
        <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.045, 0.16, 16, 1, true]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.14}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};

// 2. CONCAVE LENS (Diverging light)
export const ConcaveLensModel: React.FC<OpticsItemProps> = ({ isSelected }) => {
  return (
    <group>
      {/* Base & Post */}
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.045, 0.05, 0.03, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.16, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Outer Rim */}
      <mesh position={[0, 0.19, 0]}>
        <torusGeometry args={[0.05, 0.006, 16, 32]} />
        <meshStandardMaterial color={isSelected ? '#818cf8' : '#334155'} metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Concave Glass Element */}
      <mesh position={[0, 0.19, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.048, 0.048, 0.018, 32]} />
        <meshPhysicalMaterial
          color="#ede9fe"
          emissive="#818cf8"
          emissiveIntensity={0.2}
          transmission={0.94}
          opacity={0.88}
          transparent
          roughness={0.08}
          ior={1.62}
        />
      </mesh>
      {/* 4D Diverging Ray Cone */}
      <mesh position={[0, 0.19, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.075, 0.18, 16, 1, true]} />
        <meshBasicMaterial
          color="#818cf8"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// 3. PLANE MIRROR (Specular Reflection)
export const PlaneMirrorModel: React.FC<OpticsItemProps> = ({ isSelected }) => {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.055, 0.03, 32]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.16, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
      </mesh>
      {/* Mirror Frame */}
      <mesh position={[0, 0.20, 0]}>
        <boxGeometry args={[0.1, 0.12, 0.012]} />
        <meshStandardMaterial color={isSelected ? '#38bdf8' : '#1e293b'} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Ultra-Specular Front Mirror Surface */}
      <mesh position={[0, 0.20, 0.007]}>
        <planeGeometry args={[0.092, 0.112]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.98}
          roughness={0.02}
          envMapIntensity={2.5}
        />
      </mesh>
    </group>
  );
};

// 4. CONCAVE MIRROR (Converging reflection)
export const ConcaveMirrorModel: React.FC<OpticsItemProps> = ({ isSelected }) => {
  return (
    <group>
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.055, 0.03, 32]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.16, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Parabolic / Concave Dish */}
      <mesh position={[0, 0.20, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[0.055, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        <meshStandardMaterial
          color="#f1f5f9"
          metalness={0.96}
          roughness={0.04}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// 5. CONVEX MIRROR (Diverging reflection)
export const ConvexMirrorModel: React.FC<OpticsItemProps> = ({ isSelected }) => {
  return (
    <group>
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.055, 0.03, 32]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.16, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Convex Dome Dish */}
      <mesh position={[0, 0.20, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[0.055, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.95}
          roughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// 6. PRISM (Refraction & Rainbow Dispersion)
export const PrismModel: React.FC<OpticsItemProps> = ({ isSelected }) => {
  const prismRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (prismRef.current) {
      const t = clock.getElapsedTime();
      prismRef.current.rotation.y = Math.sin(t * 0.4) * 0.08;
    }
  });

  return (
    <group>
      {/* Rotating Turntable Stage */}
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.055, 0.06, 0.03, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Equilateral 60° Prism Crystal (SF11 dense flint) */}
      <mesh ref={prismRef} position={[0, 0.09, 0]} rotation={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.12, 3]} />
        <meshPhysicalMaterial
          color="#f5f3ff"
          emissive="#a855f7"
          emissiveIntensity={0.25}
          transmission={0.96}
          opacity={0.92}
          transparent
          roughness={0.03}
          ior={1.78}
        />
      </mesh>

      {/* Dispersed Rainbow Spectrum Fan Output */}
      <group position={[0.03, 0.09, 0.02]} rotation={[0, -0.6, 0]}>
        {['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7'].map((c, i) => (
          <mesh
            key={i}
            position={[0.08 + i * 0.015, 0, (i - 3) * 0.02]}
            rotation={[0, (i - 3) * 0.08, 0]}
          >
            <boxGeometry args={[0.18, 0.008, 0.004]} />
            <meshBasicMaterial
              color={c}
              transparent
              opacity={0.65}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// 7. OPTICAL BENCH (Support rail & rider saddles)
export const OpticalBenchModel: React.FC<OpticsItemProps> = ({ isSelected }) => {
  return (
    <group>
      {/* Leveling Feet */}
      <mesh position={[-0.45, 0.01, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.02, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>
      <mesh position={[0.45, 0.01, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.02, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>
      {/* 1.0-Meter Anodized Aluminum Rail Track */}
      <mesh position={[0, 0.035, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.03, 0.09]} />
        <meshStandardMaterial color={isSelected ? '#38bdf8' : '#1e293b'} metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Stainless Steel Central Guide Rods */}
      <mesh position={[0, 0.052, 0.025]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.005, 0.005, 0.98, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.052, -0.025]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.005, 0.005, 0.98, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Sliding Carrier Saddles */}
      {[-0.25, 0, 0.25].map((x, i) => (
        <group key={i} position={[x, 0.055, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.06, 0.02, 0.1]} />
            <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.015, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.02, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// 8. LIGHT SOURCE (Collimated illuminator)
export const LightSourceModel: React.FC<OpticsItemProps> = ({ isSelected }) => {
  return (
    <group>
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.055, 0.03, 32]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.16, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Lamp Cylindrical Housing */}
      <mesh position={[0, 0.19, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.14, 32]} />
        <meshStandardMaterial color={isSelected ? '#fef08a' : '#1e293b'} metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Front Optical Aperture & Bulb */}
      <mesh position={[0, 0.19, 0.072]}>
        <circleGeometry args={[0.036, 32]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      {/* Projected Light Cone */}
      <mesh position={[0, 0.19, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.18, 0.55, 24, 1, true]} />
        <meshBasicMaterial
          color="#fef08a"
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// 9. SCREEN (Receiving images)
export const ScreenModel: React.FC<OpticsItemProps> = ({ isSelected }) => {
  return (
    <group>
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.055, 0.03, 32]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.16, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Target Screen Frame */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.16, 0.16, 0.008]} />
        <meshStandardMaterial color={isSelected ? '#38bdf8' : '#334155'} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Matte White Target Face with Optical Grid */}
      <mesh position={[0, 0.22, 0.005]}>
        <planeGeometry args={[0.15, 0.15]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Laser Spot on Screen */}
      <mesh position={[0, 0.22, 0.006]}>
        <circleGeometry args={[0.006, 16]} />
        <meshBasicMaterial color="#22c55e" blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

// 10. LASER POINTER (Studying light propagation)
export const LaserPointerModel: React.FC<OpticsItemProps> = ({ isSelected }) => {
  const laserBeamRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (laserBeamRef.current) {
      const t = clock.getElapsedTime();
      const scalePulse = 1.0 + Math.sin(t * 8) * 0.05;
      laserBeamRef.current.scale.set(scalePulse, 1, scalePulse);
    }
  });

  return (
    <group>
      {/* Laboratory Heavy Optical Stand */}
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.045, 0.05, 0.03, 32]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.16, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Cylindrical Diode Laser Mount & Housing */}
      <mesh position={[0, 0.19, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.15, 24]} />
        <meshStandardMaterial color={isSelected ? '#22c55e' : '#15803d'} metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Brass Aperture Cap */}
      <mesh position={[0, 0.19, 0.078]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.018, 0.015, 24]} />
        <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 532nm Emerald Coherent Volumetric Laser Beam */}
      <group position={[0, 0.19, 0.085]}>
        {/* Core Laser Ray */}
        <mesh position={[0, 0, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.0018, 0.0018, 1.5, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Glowing Emerald Aura Cylinder */}
        <mesh ref={laserBeamRef} position={[0, 0, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 1.5, 16, 1, true]} />
          <meshBasicMaterial
            color="#22c55e"
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};

// Generic Custom / 4D Specimen Stand for any other placed material
export const GenericMaterialSpecimen: React.FC<{
  color?: string;
  name?: string;
  isSelected?: boolean;
}> = ({ color = '#38bdf8', isSelected }) => {
  const specimenRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (specimenRef.current) {
      const t = clock.getElapsedTime();
      specimenRef.current.rotation.y = t * 0.8;
      specimenRef.current.position.y = 0.08 + Math.sin(t * 1.5) * 0.012;
    }
  });

  return (
    <group>
      {/* Specimen Plinth */}
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.055, 0.03, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Floating 4D Material Geometry */}
      <group ref={specimenRef}>
        <mesh castShadow>
          <octahedronGeometry args={[0.045, 0]} />
          <meshStandardMaterial
            color={color}
            metalness={0.8}
            roughness={0.15}
            emissive={color}
            emissiveIntensity={isSelected ? 0.6 : 0.3}
          />
        </mesh>
        {/* Orbital Wireframe Ring */}
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[0.065, 0.002, 16, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  );
};

// Master Switcher for dynamic bench apparatus
export const DynamicBenchToolRenderer: React.FC<{
  toolType: LabToolType;
  color?: string;
  name?: string;
  isSelected?: boolean;
  isHovered?: boolean;
}> = ({ toolType, color, name, isSelected, isHovered }) => {
  switch (toolType) {
    case 'convex_lens':
      return <ConvexLensModel isSelected={isSelected} isHovered={isHovered} />;
    case 'concave_lens':
      return <ConcaveLensModel isSelected={isSelected} isHovered={isHovered} />;
    case 'plane_mirror':
      return <PlaneMirrorModel isSelected={isSelected} isHovered={isHovered} />;
    case 'concave_mirror':
      return <ConcaveMirrorModel isSelected={isSelected} isHovered={isHovered} />;
    case 'convex_mirror':
      return <ConvexMirrorModel isSelected={isSelected} isHovered={isHovered} />;
    case 'prism':
      return <PrismModel isSelected={isSelected} isHovered={isHovered} />;
    case 'optical_bench':
      return <OpticalBenchModel isSelected={isSelected} isHovered={isHovered} />;
    case 'light_source':
      return <LightSourceModel isSelected={isSelected} isHovered={isHovered} />;
    case 'screen':
      return <ScreenModel isSelected={isSelected} isHovered={isHovered} />;
    case 'laser_pointer':
      return <LaserPointerModel isSelected={isSelected} isHovered={isHovered} />;
    default:
      return <GenericMaterialSpecimen color={color} name={name} isSelected={isSelected} />;
  }
};
