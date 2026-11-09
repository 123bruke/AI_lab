import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createFlameGlowTexture } from './textures';

interface FireProps {
  isLit: boolean;
  powerPercent: number; // 0 to 100
  position?: [number, number, number];
}

export const Fire: React.FC<FireProps> = ({ isLit, powerPercent, position = [0, 0, 0] }) => {
  const outerFlameRef = useRef<THREE.Mesh>(null);
  const innerFlameRef = useRef<THREE.Mesh>(null);
  const coreFlameRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const sparksRef = useRef<THREE.Points>(null);

  const glowTexture = useMemo(() => createFlameGlowTexture(), []);

  // Sparks / ember particles setup
  const sparkCount = 28;
  const [sparkGeo, sparkVelocities] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(sparkCount * 3);
    const velocities: { x: number; y: number; z: number; life: number; maxLife: number }[] = [];

    for (let i = 0; i < sparkCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.05;
      positions[i * 3 + 1] = Math.random() * 0.15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.05;

      velocities.push({
        x: (Math.random() - 0.5) * 0.08,
        y: 0.2 + Math.random() * 0.4,
        z: (Math.random() - 0.5) * 0.08,
        life: Math.random() * 0.8,
        maxLife: 0.6 + Math.random() * 0.6,
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return [geo, velocities];
  }, [sparkCount]);

  useFrame((state, delta) => {
    if (!isLit) {
      if (lightRef.current) lightRef.current.intensity = 0;
      return;
    }

    const t = state.clock.getElapsedTime();
    const power = powerPercent / 100; // 0.1 to 1.0

    // Organic flame flicker calculation
    const noise1 = Math.sin(t * 18.0) * 0.08 + Math.cos(t * 26.0) * 0.05;
    const noise2 = Math.sin(t * 33.0 + 1.2) * 0.06;
    const flicker = noise1 + noise2;

    const baseScaleY = 0.6 + power * 0.8;
    const currentScaleY = Math.max(0.2, baseScaleY + flicker * 0.3);
    const currentScaleXZ = Math.max(0.4, 0.7 + power * 0.5 + flicker * 0.15);

    // Outer flame motion
    if (outerFlameRef.current) {
      outerFlameRef.current.scale.set(currentScaleXZ, currentScaleY, currentScaleXZ);
      outerFlameRef.current.rotation.y = t * 3.0;
      outerFlameRef.current.position.x = Math.sin(t * 12.0) * 0.008;
      outerFlameRef.current.position.z = Math.cos(t * 15.0) * 0.008;
    }

    // Inner blue core motion (tighter, more stable)
    if (innerFlameRef.current) {
      innerFlameRef.current.scale.set(
        currentScaleXZ * 0.6,
        currentScaleY * 0.55 + Math.sin(t * 22) * 0.03,
        currentScaleXZ * 0.6
      );
      innerFlameRef.current.rotation.y = -t * 2.5;
    }

    // High temperature core
    if (coreFlameRef.current) {
      coreFlameRef.current.scale.set(
        currentScaleXZ * 0.35,
        currentScaleY * 0.35,
        currentScaleXZ * 0.35
      );
    }

    // Dynamic flame light casting flickering shadows
    if (lightRef.current) {
      const baseIntensity = 1.2 + power * 3.0;
      lightRef.current.intensity = baseIntensity + (Math.sin(t * 24.0) + Math.cos(t * 37.0)) * 0.4;
      lightRef.current.position.y = position[1] + 0.15 + currentScaleY * 0.1;
      lightRef.current.position.x = position[0] + Math.sin(t * 20.0) * 0.01;
      lightRef.current.position.z = position[2] + Math.cos(t * 17.0) * 0.01;
    }

    // Glow sprite
    if (glowRef.current) {
      const glowScale = (0.5 + power * 0.6) * (1.0 + flicker * 0.2);
      glowRef.current.scale.set(glowScale, glowScale * 1.4, 1);
    }

    // Spark particles simulation
    if (sparksRef.current) {
      const posAttr = sparkGeo.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;

      for (let i = 0; i < sparkCount; i++) {
        const vel = sparkVelocities[i];
        vel.life += delta;

        if (vel.life >= vel.maxLife) {
          vel.life = 0;
          positions[i * 3] = (Math.random() - 0.5) * 0.04 * power;
          positions[i * 3 + 1] = 0.02;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 0.04 * power;
          vel.x = (Math.random() - 0.5) * 0.06 * power;
          vel.y = (0.3 + Math.random() * 0.5) * power;
          vel.z = (Math.random() - 0.5) * 0.06 * power;
        } else {
          positions[i * 3] += vel.x * delta;
          positions[i * 3 + 1] += vel.y * delta;
          positions[i * 3 + 2] += vel.z * delta;
          // drift
          vel.x += Math.sin(t * 8 + i) * 0.02 * delta;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  if (!isLit) return null;

  return (
    <group position={position}>
      {/* 1. Point Light for realistic dynamic scene illumination & shadows */}
      <pointLight
        ref={lightRef}
        color="#ffaa33"
        distance={4.5}
        decay={2}
        castShadow
        shadow-bias={-0.001}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      {/* 2. Additive Glow Billboard Sprite */}
      <sprite ref={glowRef} position={[0, 0.12, 0]}>
        <spriteMaterial
          map={glowTexture}
          transparent
          blending={THREE.AdditiveBlending}
          opacity={0.85}
          depthWrite={false}
        />
      </sprite>

      {/* 3. Outer Flame Mesh (incandescent yellow/orange/vermilion) */}
      <mesh ref={outerFlameRef} position={[0, 0.12, 0]}>
        <coneGeometry args={[0.075, 0.28, 16, 4, true]} />
        <meshStandardMaterial
          color="#ff7700"
          emissive="#ff5500"
          emissiveIntensity={2.5}
          transparent
          opacity={0.78}
          roughness={0.1}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Inner Flame Mesh (distinctive stoichiometric Bunsen blue core) */}
      <mesh ref={innerFlameRef} position={[0, 0.08, 0]}>
        <coneGeometry args={[0.045, 0.18, 14, 2, true]} />
        <meshStandardMaterial
          color="#00eeff"
          emissive="#00bfff"
          emissiveIntensity={4.2}
          transparent
          opacity={0.92}
          roughness={0.1}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 5. Intrinsic High-Energy Flame Base (rich royal cyan) */}
      <mesh ref={coreFlameRef} position={[0, 0.04, 0]}>
        <coneGeometry args={[0.025, 0.08, 12, 1, true]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#38bdf8"
          emissiveIntensity={5.0}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 6. Ember / Spark Particle Cloud */}
      <points ref={sparksRef} geometry={sparkGeo}>
        <pointsMaterial
          color="#ffdd77"
          size={0.016}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
