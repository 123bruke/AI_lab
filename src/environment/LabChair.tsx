import React, { useMemo } from 'react';
import * as THREE from 'three';

interface LabChairProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}

export const LabChair: React.FC<LabChairProps> = ({ position, rotation = [0, 0, 0] }) => {
  // Chrome metal material
  const chromeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f1f5f9',
        metalness: 0.95,
        roughness: 0.12,
      }),
    []
  );

  // Black textured laboratory vinyl / polyurethane seat material
  const vinylMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1e293b',
        metalness: 0.1,
        roughness: 0.6,
      }),
    []
  );

  // Stool height dimensions (adjusted for standard 0.88m lab bench)
  const seatHeight = 0.64;
  const seatRadius = 0.18;
  const seatThickness = 0.055;
  const footRingRadius = 0.19;
  const footRingHeight = 0.28;

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Five-Star Chrome Base with Floor Casters */}
      <group position={[0, 0.025, 0]}>
        {/* Central hub */}
        <mesh position={[0, 0.02, 0]} material={chromeMaterial}>
          <cylinderGeometry args={[0.045, 0.055, 0.04, 16]} />
        </mesh>

        {/* 5 Base Spoke Legs */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * (Math.PI * 2)) / 5;
          const legLength = 0.26;
          const lx = Math.cos(angle) * (legLength / 2);
          const lz = Math.sin(angle) * (legLength / 2);
          const endX = Math.cos(angle) * legLength;
          const endZ = Math.sin(angle) * legLength;

          return (
            <group key={i}>
              {/* Slanted Chrome Spoke */}
              <mesh
                position={[lx, 0.015, lz]}
                rotation={[0, -angle, 0.08]}
                material={chromeMaterial}
              >
                <boxGeometry args={[legLength, 0.018, 0.024]} />
              </mesh>

              {/* Dual-wheel Nylon Caster at leg end */}
              <group position={[endX, 0.008, endZ]}>
                {/* Caster stem */}
                <mesh position={[0, 0.012, 0]} material={chromeMaterial}>
                  <cylinderGeometry args={[0.005, 0.005, 0.02, 8]} />
                </mesh>
                {/* Wheel hood */}
                <mesh position={[0, 0.01, 0]}>
                  <boxGeometry args={[0.024, 0.012, 0.028]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.7} />
                </mesh>
                {/* Dual wheels */}
                <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.016, 0.016, 0.022, 12]} />
                  <meshStandardMaterial color="#090d16" roughness={0.4} />
                </mesh>
              </group>
            </group>
          );
        })}
      </group>

      {/* 2. Chrome Central Hydraulic Lift Column */}
      <mesh position={[0, seatHeight * 0.45, 0]} material={chromeMaterial} castShadow>
        <cylinderGeometry args={[0.024, 0.028, seatHeight * 0.78, 16]} />
      </mesh>

      {/* Column Telescopic Shroud Collar */}
      <mesh position={[0, seatHeight * 0.28, 0]}>
        <cylinderGeometry args={[0.034, 0.034, 0.16, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>

      {/* 3. Circular Chrome Footrest Ring */}
      <group position={[0, footRingHeight, 0]}>
        {/* Torus ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={chromeMaterial} castShadow>
          <torusGeometry args={[footRingRadius, 0.011, 12, 32]} />
        </mesh>
        {/* 4 Radial Support Spokes to central column */}
        {[0, 1, 2, 3].map((i) => {
          const spokeAngle = (i * Math.PI) / 2;
          const sx = (Math.cos(spokeAngle) * footRingRadius) / 2;
          const sz = (Math.sin(spokeAngle) * footRingRadius) / 2;
          return (
            <mesh
              key={i}
              position={[sx, 0, sz]}
              rotation={[0, -spokeAngle, 0]}
              material={chromeMaterial}
            >
              <boxGeometry args={[footRingRadius, 0.012, 0.014]} />
            </mesh>
          );
        })}
      </group>

      {/* 4. Under-seat Heavy Mechanism Plate & Height Adjuster Lever */}
      <group position={[0, seatHeight - 0.025, 0]}>
        {/* Steel seat mounting flange */}
        <mesh material={chromeMaterial}>
          <boxGeometry args={[0.16, 0.018, 0.16]} />
        </mesh>
        {/* Pneumatic control paddle / handle */}
        <mesh position={[0.11, -0.01, 0.04]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.005, 0.005, 0.1, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        <mesh position={[0.16, -0.018, 0.04]}>
          <boxGeometry args={[0.022, 0.012, 0.035]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
      </group>

      {/* 5. Circular Thick Padded Vinyl Seat Cushion */}
      <group position={[0, seatHeight, 0]}>
        {/* Main round cushion */}
        <mesh material={vinylMaterial} castShadow receiveShadow>
          <cylinderGeometry args={[seatRadius, seatRadius * 0.96, seatThickness, 32]} />
        </mesh>

        {/* Crowned soft top layer */}
        <mesh position={[0, seatThickness * 0.45, 0]} material={vinylMaterial} castShadow>
          <sphereGeometry args={[seatRadius * 0.98, 24, 12, 0, Math.PI * 2, 0, Math.PI / 3.5]} />
        </mesh>

        {/* Perimeter Seam Beading */}
        <mesh position={[0, seatThickness * 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[seatRadius, 0.006, 8, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
      </group>

      {/* 6. Ergonomic Low Lumbar Backrest */}
      <group position={[0, seatHeight, 0]}>
        {/* Chrome support bar curving up behind seat */}
        <mesh position={[0, 0.14, -seatRadius * 1.05]} material={chromeMaterial} castShadow>
          <boxGeometry args={[0.024, 0.28, 0.012]} />
        </mesh>
        <mesh position={[0, 0.01, -seatRadius * 0.7]} rotation={[0.4, 0, 0]} material={chromeMaterial}>
          <boxGeometry args={[0.024, 0.15, 0.012]} />
        </mesh>

        {/* Curved Backrest Pad */}
        <group position={[0, 0.27, -seatRadius * 1.08]}>
          <mesh material={vinylMaterial} castShadow receiveShadow>
            <boxGeometry args={[0.26, 0.13, 0.032]} />
          </mesh>
          {/* Subtle curved wings */}
          <mesh
            position={[-0.12, 0, 0.012]}
            rotation={[0, 0.25, 0]}
            material={vinylMaterial}
          >
            <boxGeometry args={[0.06, 0.13, 0.028]} />
          </mesh>
          <mesh
            position={[0.12, 0, 0.012]}
            rotation={[0, -0.25, 0]}
            material={vinylMaterial}
          >
            <boxGeometry args={[0.06, 0.13, 0.028]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
