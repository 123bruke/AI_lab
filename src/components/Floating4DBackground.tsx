import React, { useRef, useMemo, Suspense, useState, useEffect, Component, ReactNode } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

class CanvasErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn('Floating4DBackground WebGL notice (using CSS fallback):', error);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

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
  roughness = 0.08,
  metalness = 0.85,
  clearcoat = 1.0,
  opacity = 1.0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialPos = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * speed;
    meshRef.current.position.x = initialPos.x + Math.sin(t * 0.7) * 0.7;
    meshRef.current.position.y = initialPos.y + Math.cos(t * 0.9) * 0.5;
    meshRef.current.position.z = initialPos.z + Math.sin(t * 0.5) * 0.4;
    meshRef.current.rotation.x = t * 0.25;
    meshRef.current.rotation.y = t * 0.35;
  });

  return (
    <Float speed={speed * 2} rotationIntensity={1.2} floatIntensity={1.2}>
      <mesh ref={meshRef} position={position} castShadow receiveShadow>
        <sphereGeometry args={[size, 48, 48]} />
        <meshPhysicalMaterial
          color={color}
          roughness={roughness}
          metalness={metalness}
          clearcoat={clearcoat}
          clearcoatRoughness={0.05}
          reflectivity={0.95}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
    </Float>
  );
};

export const Floating4DBackground: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const [webglAvailable, setWebglAvailable] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebglAvailable(false);
    } catch {
      setWebglAvailable(false);
    }
  }, []);

  const cssFallback = (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-[30rem] h-[30rem] rounded-full bg-sky-400/10 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-2/3 left-1/3 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />
    </div>
  );

  return (
    <div className="fixed inset-0 w-screen h-screen pointer-events-none overflow-hidden z-0">
      {webglAvailable ? (
        <CanvasErrorBoundary fallback={cssFallback}>
          <Suspense fallback={cssFallback}>
            <Canvas
              camera={{ position: [0, 0, 8], fov: 45 }}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            >
              {/* Cinema 4D Studio Lighting Rig: Crisp White & Subtle Ice Cyan */}
              <ambientLight intensity={isDarkMode ? 1.0 : 1.5} color="#f8fafc" />
              <directionalLight position={[10, 10, 5]} intensity={isDarkMode ? 3.0 : 3.5} color="#ffffff" />
              <directionalLight position={[-10, -5, -5]} intensity={1.5} color="#e0f2fe" />
              <pointLight position={[0, 0, 4]} intensity={2.2} color="#ffffff" />
              <pointLight position={[-4, 3, 2]} intensity={1.5} color="#bae6fd" />
              <pointLight position={[4, -3, 2]} intensity={1.2} color="#e2e8f0" />

              {/* Cinema 4D High-End Monochrome & Platinum Chrome Spheres */}
              {/* 1. Large Central Platinum Mirror Orb */}
              <QuantumOrb
                position={[0, 0, -2.5]}
                size={2.2}
                color="#f1f5f9"
                speed={0.2}
                metalness={0.96}
                roughness={0.04}
                opacity={1.0}
              />

              {/* 2. Frosted Cyan-Glass Molecular Orb (Upper Left) */}
              <QuantumOrb
                position={[-3.2, 1.8, -0.8]}
                size={1.5}
                color={isDarkMode ? "#38bdf8" : "#0284c7"}
                speed={0.35}
                metalness={0.2}
                roughness={0.08}
                opacity={0.88}
              />

              {/* 3. Obsidian Dark Glass Sphere (Lower Right) */}
              <QuantumOrb
                position={[3.2, -1.4, -0.5]}
                size={1.7}
                color={isDarkMode ? "#1e293b" : "#475569"}
                speed={0.3}
                metalness={0.4}
                roughness={0.06}
                opacity={0.92}
              />

              {/* 4. Pure Specular Liquid Chrome Sphere (Upper Right) */}
              <QuantumOrb
                position={[2.4, 2.0, -1.5]}
                size={1.1}
                color="#ffffff"
                speed={0.4}
                metalness={0.98}
                roughness={0.03}
                opacity={1.0}
              />

              {/* 5. Pure Silver Floating Sphere (Lower Left) */}
              <QuantumOrb
                position={[-2.2, -2.0, -1.2]}
                size={1.3}
                color="#cbd5e1"
                speed={0.45}
                metalness={0.95}
                roughness={0.05}
                opacity={1.0}
              />

              {/* 6. Micro Satellite Accent Spheres */}
              <QuantumOrb
                position={[-4.2, -0.2, 0.5]}
                size={0.55}
                color="#ffffff"
                speed={0.55}
                metalness={0.99}
                roughness={0.02}
                opacity={1.0}
              />
              <QuantumOrb
                position={[4.0, 1.2, 0]}
                size={0.65}
                color="#94a3b8"
                speed={0.5}
                metalness={0.97}
                roughness={0.03}
                opacity={1.0}
              />
            </Canvas>
          </Suspense>
        </CanvasErrorBoundary>
      ) : (
        cssFallback
      )}

      {/* Frosted Depth-of-Field Blur Separator Layer (Clean Obsidian & White) */}
      <div
        className={`absolute inset-0 backdrop-blur-md transition-colors duration-500 ${isDarkMode
            ? 'bg-neutral-950/70'
            : 'bg-white/75'
          }`}
      />
    </div>
  );
};
