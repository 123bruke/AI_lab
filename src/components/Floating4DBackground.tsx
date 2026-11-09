import React, { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

interface BallProps {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  opacity?: number;
}

const QuantumOrb: React.FC<BallProps> = ({
  position,
  color,
  size,
  speed,
  roughness = 0.1,
  metalness = 0.2,
  clearcoat = 1.0,
  opacity = 0.9,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialPos = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * speed;
    meshRef.current.position.x = initialPos.x + Math.sin(t * 0.7) * 0.8;
    meshRef.current.position.y = initialPos.y + Math.cos(t * 0.9) * 0.6;
    meshRef.current.position.z = initialPos.z + Math.sin(t * 0.5) * 0.5;
    meshRef.current.rotation.x = t * 0.3;
    meshRef.current.rotation.y = t * 0.4;
  });

  return (
    <Float speed={speed * 2} rotationIntensity={1.2} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position} castShadow receiveShadow>
        <sphereGeometry args={[size, 48, 48]} />
        <meshPhysicalMaterial
          color={color}
          roughness={roughness}
          metalness={metalness}
          clearcoat={clearcoat}
          clearcoatRoughness={0.08}
          reflectivity={0.9}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
    </Float>
  );
};

export const Floating4DBackground: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          {/* Cinema 4D Studio Lighting Rig (Self-contained, zero external network downloads) */}
          <ambientLight intensity={isDarkMode ? 0.9 : 1.4} />
          <directionalLight position={[10, 10, 5]} intensity={isDarkMode ? 2.5 : 3.0} color="#ffffff" />
          <directionalLight position={[-10, -5, -5]} intensity={1.2} color="#38bdf8" />
          <pointLight position={[0, 0, 4]} intensity={isDarkMode ? 2.0 : 2.5} color="#818cf8" />
          <pointLight position={[-4, 3, 2]} intensity={1.5} color="#38bdf8" />
          <pointLight position={[4, -3, 2]} intensity={1.5} color="#c084fc" />

          {/* 4D Chromatic & Refractive Floating Spheres */}
          <QuantumOrb
            position={[-3.2, 1.8, -1]}
            size={1.6}
            color={isDarkMode ? "#38bdf8" : "#0284c7"}
            speed={0.4}
            metalness={0.15}
            roughness={0.1}
            opacity={0.85}
          />
          <QuantumOrb
            position={[3.4, -1.2, -0.5]}
            size={1.9}
            color={isDarkMode ? "#c084fc" : "#9333ea"}
            speed={0.35}
            metalness={0.2}
            roughness={0.12}
            opacity={0.88}
          />
          <QuantumOrb
            position={[2.0, 2.2, -2]}
            size={1.2}
            color={isDarkMode ? "#34d399" : "#059669"}
            speed={0.45}
            metalness={0.1}
            roughness={0.08}
            opacity={0.9}
          />
          <QuantumOrb
            position={[-2.4, -2.2, -1.5]}
            size={1.4}
            color={isDarkMode ? "#f43f5e" : "#e11d48"}
            speed={0.5}
            metalness={0.25}
            roughness={0.12}
            opacity={0.85}
          />
          <QuantumOrb
            position={[0, 0, -3]}
            size={2.5}
            color={isDarkMode ? "#3b82f6" : "#2563eb"}
            speed={0.2}
            metalness={0.12}
            roughness={0.06}
            opacity={0.8}
          />

          {/* Chrome metallic 4D accent spheres */}
          <QuantumOrb
            position={[-4.0, -0.5, 0.5]}
            size={0.65}
            color="#e2e8f0"
            speed={0.6}
            metalness={0.95}
            roughness={0.05}
            opacity={1.0}
          />
          <QuantumOrb
            position={[4.2, 1.5, 0]}
            size={0.75}
            color="#cbd5e1"
            speed={0.55}
            metalness={0.98}
            roughness={0.04}
            opacity={1.0}
          />
        </Canvas>
      </Suspense>

      {/* Frosted Depth-of-Field Blur Separator Layer */}
      <div
        className={`absolute inset-0 backdrop-blur-2xl transition-colors duration-500 ${
          isDarkMode
            ? 'bg-gradient-to-b from-neutral-950/80 via-neutral-950/65 to-neutral-950/90'
            : 'bg-gradient-to-b from-white/75 via-slate-50/60 to-white/80'
        }`}
      />
    </div>
  );
};
