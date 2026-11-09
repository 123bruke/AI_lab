import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createSteamTexture } from './textures';

interface SteamProps {
  steamIntensity: number; // 0 to 1
  startY: number; // top of beaker / liquid surface
  mouthRadius?: number; // ~0.17
}

const STEAM_PARTICLE_COUNT = 160;

export const Steam: React.FC<SteamProps> = ({
  steamIntensity,
  startY,
  mouthRadius = 0.165,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const texture = useMemo(() => createSteamTexture(), []);

  // Set up particle attributes
  const [geometry, particles] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(STEAM_PARTICLE_COUNT * 3);
    const opacities = new Float32Array(STEAM_PARTICLE_COUNT);
    const scales = new Float32Array(STEAM_PARTICLE_COUNT);

    const partData = Array.from({ length: STEAM_PARTICLE_COUNT }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * mouthRadius * 0.8;
      const px = Math.cos(angle) * r;
      const pz = Math.sin(angle) * r;
      const py = startY + Math.random() * 0.1;

      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;
      opacities[i] = 0;
      scales[i] = 0.05;

      return {
        x: px,
        y: py,
        z: pz,
        vx: (Math.random() - 0.5) * 0.04,
        vy: 0.18 + Math.random() * 0.35,
        vz: (Math.random() - 0.5) * 0.04,
        life: Math.random() * 2.0,
        maxLife: 1.8 + Math.random() * 1.5,
        baseScale: 0.06 + Math.random() * 0.08,
      };
    });

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    geo.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    return [geo, partData];
  }, [startY, mouthRadius]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();

    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;

    const activeCount = Math.floor(steamIntensity * STEAM_PARTICLE_COUNT);

    for (let i = 0; i < STEAM_PARTICLE_COUNT; i++) {
      const p = particles[i];

      if (i < activeCount && steamIntensity > 0.05) {
        p.life += delta;

        // Reset particle when expired
        if (p.life >= p.maxLife) {
          p.life = 0;
          const angle = Math.random() * Math.PI * 2;
          const r = Math.sqrt(Math.random()) * mouthRadius * 0.75;
          p.x = Math.cos(angle) * r;
          p.y = startY + (Math.random() - 0.5) * 0.02;
          p.z = Math.sin(angle) * r;
          p.vx = (Math.random() - 0.5) * 0.05 * steamIntensity;
          p.vy = (0.2 + Math.random() * 0.4) * (0.8 + steamIntensity * 0.8);
          p.vz = (Math.random() - 0.5) * 0.05 * steamIntensity;
        } else {
          // Convective turbulence as vapor rises
          const curlX = Math.sin(t * 3.0 + p.y * 5.0 + i) * 0.08 * delta;
          const curlZ = Math.cos(t * 2.5 + p.y * 4.5 + i * 1.5) * 0.08 * delta;

          p.x += (p.vx + curlX) * delta * 12;
          p.y += p.vy * delta;
          p.z += (p.vz + curlZ) * delta * 12;

          // Natural thermal expansion outwards as it ascends
          p.vx *= 1.02;
          p.vz *= 1.02;
        }

        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
      } else {
        // Inactive - move underground
        positions[i * 3 + 1] = -100;
      }
    }

    posAttr.needsUpdate = true;
  });

  if (steamIntensity <= 0.02) return null;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        map={texture}
        size={0.12 * (1.0 + steamIntensity * 0.6)}
        transparent
        opacity={0.35 * steamIntensity}
        blending={THREE.NormalBlending}
        depthWrite={false}
        color="#f8fafc"
      />
    </points>
  );
};
