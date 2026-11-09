import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createLabFloorTexture } from '../chemistry/textures';
import { LabChair } from './LabChair';
import { LabLightingState } from '../types';

interface LaboratoryProps {
  lighting?: LabLightingState;
}

const DEFAULT_LIGHTING: LabLightingState = {
  mainCeiling: true,
  benchSpot: true,
  fumeHood: true,
  uvBlacklight: false,
};

export const Laboratory: React.FC<LaboratoryProps> = ({ lighting = DEFAULT_LIGHTING }) => {
  const floorTexture = useMemo(() => createLabFloorTexture(), []);

  // Benchtop dimensions
  const benchWidth = 3.6;
  const benchDepth = 1.6;
  const benchHeight = 0.88;
  const topThickness = 0.05;

  return (
    <group>
      {/* 1. Realistic 3D Laboratory Floor with Tiling and Specular Reflections */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          map={floorTexture}
          roughness={0.25}
          metalness={0.15}
        />
      </mesh>

      {/* Safety Floor Marking Lines (Bright warning yellow/black hazard line) */}
      <mesh position={[0, 0.002, 2.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[benchWidth + 0.8, 0.08]} />
        <meshBasicMaterial color="#eab308" />
      </mesh>

      {/* 2. Main Laboratory Workbench */}
      <group position={[0, 0, 0]}>
        {/* Chemical-Resistant Solid Epoxy/Phenolic Resin Benchtop */}
        <mesh
          position={[0, benchHeight - topThickness / 2, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[benchWidth, topThickness, benchDepth]} />
          <meshStandardMaterial
            color="#181e26" // dark charcoal laboratory resin
            roughness={0.22}
            metalness={0.25}
          />
        </mesh>

        {/* Benchtop Beveled Edges Trim */}
        <mesh position={[0, benchHeight - topThickness / 2, benchDepth / 2 + 0.005]}>
          <boxGeometry args={[benchWidth + 0.02, topThickness, 0.01]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Cabinet Base Unit Left */}
        <mesh
          position={[-benchWidth * 0.3, (benchHeight - topThickness) / 2, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[benchWidth * 0.34, benchHeight - topThickness, benchDepth * 0.9]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.5} metalness={0.1} />
        </mesh>

        {/* Drawer divisions & Chrome Handles Left */}
        {[0.2, 0.42, 0.64].map((y, idx) => (
          <group key={idx} position={[-benchWidth * 0.3, y, benchDepth * 0.45 + 0.01]}>
            <mesh>
              <boxGeometry args={[benchWidth * 0.3, 0.003, 0.005]} />
              <meshBasicMaterial color="#64748b" />
            </mesh>
            <mesh position={[0, 0.04, 0.01]} castShadow>
              <cylinderGeometry args={[0.006, 0.006, 0.12, 12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        ))}

        {/* Cabinet Base Unit Right */}
        <mesh
          position={[benchWidth * 0.3, (benchHeight - topThickness) / 2, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[benchWidth * 0.34, benchHeight - topThickness, benchDepth * 0.9]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.5} metalness={0.1} />
        </mesh>

        {/* Drawer divisions & Chrome Handles Right */}
        {[0.2, 0.42, 0.64].map((y, idx) => (
          <group key={idx} position={[benchWidth * 0.3, y, benchDepth * 0.45 + 0.01]}>
            <mesh>
              <boxGeometry args={[benchWidth * 0.3, 0.003, 0.005]} />
              <meshBasicMaterial color="#64748b" />
            </mesh>
            <mesh position={[0, 0.04, 0.01]} castShadow>
              <cylinderGeometry args={[0.006, 0.006, 0.12, 12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        ))}

        {/* Central Knee Space Steel Framework (Legs & Crossbeam) */}
        <mesh position={[0, (benchHeight - topThickness) / 2, -benchDepth * 0.38]}>
          <boxGeometry args={[benchWidth * 0.28, benchHeight - topThickness, 0.04]} />
          <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.7} />
        </mesh>

        {/* Electrical Service Raceway & Gas Taps at Back of Bench */}
        <group position={[0, benchHeight + 0.06, -benchDepth * 0.44]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[benchWidth * 0.95, 0.12, 0.08]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.2} />
          </mesh>
          {/* Dual Outlets & Gas Valves */}
          {[-1.0, -0.4, 0.4, 1.0].map((x, i) => (
            <mesh key={i} position={[x, 0, 0.042]} castShadow>
              <boxGeometry args={[0.08, 0.06, 0.008]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.2} />
            </mesh>
          ))}
        </group>

        {/* Raised Reagent Wall Shelf mounted on bench */}
        <group position={[0, benchHeight + 0.35, -benchDepth * 0.44]}>
          {/* Support Upright Brackets */}
          <mesh position={[-benchWidth * 0.42, 0, 0]} castShadow>
            <boxGeometry args={[0.03, 0.55, 0.18]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[benchWidth * 0.42, 0, 0]} castShadow>
            <boxGeometry args={[0.03, 0.55, 0.18]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Reagent Shelf Board */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[benchWidth * 0.86, 0.025, 0.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} />
          </mesh>

          {/* Background Chemical Bottles on the Shelf */}
          {[-1.2, -0.9, -0.65, 0.6, 0.85, 1.15].map((x, i) => (
            <group key={i} position={[x, 0.09, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.15, 16]} />
                <meshStandardMaterial
                  color={i % 2 === 0 ? '#78350f' : '#0369a1'} // amber & cobalt bottles
                  roughness={0.15}
                  metalness={0.1}
                />
              </mesh>
              <mesh position={[0, 0.09, 0]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.03, 16]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.2} />
              </mesh>
            </group>
          ))}
          {/* 3. UV / Blacklight Inspection Fixture Mounted Under Shelf */}
          <group position={[0, -0.04, 0]}>
            {/* Dark UV Housing */}
            <mesh castShadow>
              <boxGeometry args={[0.9, 0.035, 0.08]} />
              <meshStandardMaterial color="#1e1b4b" roughness={0.4} metalness={0.6} />
            </mesh>
            {/* Dual UV Actinic Tubes */}
            <mesh position={[0, -0.018, -0.015]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.007, 0.007, 0.82, 12]} />
              <meshStandardMaterial
                color={lighting.uvBlacklight ? '#c084fc' : '#312e81'}
                emissive={lighting.uvBlacklight ? '#a855f7' : '#000000'}
                emissiveIntensity={lighting.uvBlacklight ? 2.8 : 0}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[0, -0.018, 0.015]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.007, 0.007, 0.82, 12]} />
              <meshStandardMaterial
                color={lighting.uvBlacklight ? '#c084fc' : '#312e81'}
                emissive={lighting.uvBlacklight ? '#a855f7' : '#000000'}
                emissiveIntensity={lighting.uvBlacklight ? 2.8 : 0}
                roughness={0.1}
              />
            </mesh>
            {/* UV Inspection Actinic Light */}
            {lighting.uvBlacklight && (
              <pointLight
                position={[0, -0.15, 0]}
                intensity={4.5}
                distance={2.5}
                color="#c084fc"
              />
            )}
          </group>
        </group>
      </group>

      {/* 3. Laboratory Swivel Stools (Chairs) */}
      {/* Chair 1: Tucked neatly into the central knee space of workbench */}
      <LabChair position={[0, 0, 0.72]} rotation={[0, 0, 0]} />

      {/* Chair 2: Ergonomic technician chair to the right of bench */}
      <LabChair position={[1.42, 0, 0.8]} rotation={[0, -0.4, 0]} />

      {/* 4. Background Laboratory Walls */}
      {/* Rear Wall */}
      <mesh position={[0, 4, -4.5]} receiveShadow>
        <planeGeometry args={[18, 8]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
      </mesh>

      {/* Wall Baseboard Kickplate */}
      <mesh position={[0, 0.1, -4.48]}>
        <boxGeometry args={[18, 0.2, 0.02]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Periodic Table & Safety Placard on the Rear Wall */}
      <group position={[-2.4, 2.6, -4.47]}>
        <mesh castShadow>
          <boxGeometry args={[1.8, 1.2, 0.02]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[1.7, 1.1]} />
          <meshStandardMaterial color="#0284c7" roughness={0.8} />
        </mesh>
      </group>

      {/* Hazard Diamond NFPA 704 Sign */}
      <group position={[2.2, 2.8, -4.47]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.6, 0.02]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.012]} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[0.4, 0.4]} />
          <meshStandardMaterial color="#eab308" roughness={0.5} />
        </mesh>
      </group>

      {/* Background Modern Fume Hood Station (Right Background) */}
      <group position={[3.8, 0, -2.5]}>
        {/* Hood Body */}
        <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 2.6, 1.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Transparent Glass Sash Window */}
        <mesh position={[0, 1.4, 0.59]}>
          <planeGeometry args={[1.6, 1.1]} />
          <meshStandardMaterial
            color="#bae6fd"
            roughness={0.1}
            metalness={0.1}
            transparent
            opacity={0.35}
          />
        </mesh>
        {/* Interior Fume Hood Fluorescent Tube Fixture */}
        <group position={[0, 2.4, 0]}>
          <mesh>
            <boxGeometry args={[1.2, 0.05, 0.1]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.015, 0.015, 1.1, 12]} />
            <meshStandardMaterial
              color={lighting.fumeHood ? '#e0f2fe' : '#64748b'}
              emissive={lighting.fumeHood ? '#38bdf8' : '#000000'}
              emissiveIntensity={lighting.fumeHood ? 2.2 : 0}
              roughness={0.1}
            />
          </mesh>
        </group>
        {/* Interior Fume Hood Light Source */}
        {lighting.fumeHood && (
          <pointLight position={[0, 2.2, 0]} intensity={2.2} distance={3.8} color="#bae6fd" />
        )}
        {/* Exhaust Ductwork on top */}
        <mesh position={[0, 3.2, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.6, 20]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* 5. Overhead Hanging Pendant Bench Task Spotlight with Real Bulb */}
      <group position={[0, 3.8, 0]}>
        {/* Slender mounting cable from ceiling */}
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 2.2, 8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
        {/* Industrial Aluminum Lamp Hood / Shade */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.26, 0.22, 24, 1, true]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 20]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Physical 3D High-Intensity Light Bulb */}
        <mesh position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.07, 24, 16]} />
          <meshStandardMaterial
            color={lighting.benchSpot ? '#ffffff' : '#475569'}
            emissive={lighting.benchSpot ? '#ffffff' : '#000000'}
            emissiveIntensity={lighting.benchSpot ? 3.0 : 0}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* 6. Ceiling Plane & Fluorescent Luminaires with Real Tubes */}
      <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
      </mesh>

      {/* Recessed Cleanroom Luminaires with Dual Glowing Tubes */}
      {[-2.2, 0, 2.2].map((x, i) => (
        <group key={i} position={[x, 5.92, -0.3]}>
          {/* Troffer housing */}
          <mesh>
            <boxGeometry args={[1.5, 0.08, 0.55]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.4} roughness={0.4} />
          </mesh>
          {/* Dual Fluorescent Tubes */}
          <mesh position={[0, -0.04, -0.12]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.016, 0.016, 1.35, 14]} />
            <meshStandardMaterial
              color={lighting.mainCeiling ? '#ffffff' : '#64748b'}
              emissive={lighting.mainCeiling ? '#f8fafc' : '#000000'}
              emissiveIntensity={lighting.mainCeiling ? 2.0 : 0}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, -0.04, 0.12]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.016, 0.016, 1.35, 14]} />
            <meshStandardMaterial
              color={lighting.mainCeiling ? '#ffffff' : '#64748b'}
              emissive={lighting.mainCeiling ? '#f8fafc' : '#000000'}
              emissiveIntensity={lighting.mainCeiling ? 2.0 : 0}
              roughness={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* 7. Laboratory Illumination Light Sources (Controlled by lighting switches) */}
      {/* Soft Ambient Light (Dims gracefully if main light is off) */}
      <ambientLight
        color="#cbd5e1"
        intensity={lighting.mainCeiling ? 0.65 : 0.18}
      />

      {/* Key Overhead Main Laboratory Illumination */}
      {lighting.mainCeiling && (
        <directionalLight
          position={[2.5, 7.5, 3.5]}
          intensity={2.2}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={0.5}
          shadow-camera-far={18}
          shadow-camera-left={-3.5}
          shadow-camera-right={3.5}
          shadow-camera-top={3.5}
          shadow-camera-bottom={-3.5}
          shadow-bias={-0.0005}
        />
      )}

      {/* Overhead Bench Focus Spotlight (High-CRI Cool White Light) */}
      {lighting.benchSpot && (
        <spotLight
          position={[0, 3.8, 0]}
          target-position={[0, benchHeight, 0]}
          intensity={4.2}
          angle={0.68}
          penumbra={0.5}
          color="#f8fafc"
          castShadow
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-bias={-0.0008}
        />
      )}

      {/* Background Rim Light */}
      <directionalLight
        position={[-3, 4, -4]}
        intensity={lighting.mainCeiling ? 0.7 : 0.25}
        color="#e0f2fe"
      />
    </group>
  );
};
