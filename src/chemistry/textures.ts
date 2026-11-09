import * as THREE from 'three';

let cachedSteamTexture: THREE.CanvasTexture | null = null;
let cachedFlameGlowTexture: THREE.CanvasTexture | null = null;
let cachedFloorTexture: THREE.CanvasTexture | null = null;
let cachedGraduationTexture: THREE.CanvasTexture | null = null;

// Generate soft volumetric smoke / steam particle texture
export function createSteamTexture(): THREE.CanvasTexture {
  if (cachedSteamTexture) return cachedSteamTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  gradient.addColorStop(0.2, 'rgba(240, 245, 255, 0.5)');
  gradient.addColorStop(0.5, 'rgba(230, 240, 250, 0.2)');
  gradient.addColorStop(0.8, 'rgba(220, 230, 245, 0.05)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  cachedSteamTexture = texture;
  return texture;
}

// Generate flame glow texture
export function createFlameGlowTexture(): THREE.CanvasTexture {
  if (cachedFlameGlowTexture) return cachedFlameGlowTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 240, 180, 1.0)');
  gradient.addColorStop(0.25, 'rgba(255, 140, 30, 0.6)');
  gradient.addColorStop(0.55, 'rgba(255, 70, 0, 0.2)');
  gradient.addColorStop(0.85, 'rgba(50, 120, 255, 0.05)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  cachedFlameGlowTexture = texture;
  return texture;
}

// Generate laboratory floor tile grid texture with subtle specularity
export function createLabFloorTexture(): THREE.CanvasTexture {
  if (cachedFloorTexture) return cachedFloorTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Light scientific epoxy / cleanroom floor
  ctx.fillStyle = '#181b22';
  ctx.fillRect(0, 0, 256, 256);

  // Large tiles with neat grout lines
  const tileSize = 64;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#272b35';

  for (let x = 0; x <= 256; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }

  for (let y = 0; y <= 256; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  // Fast subtle noise
  for (let i = 0; i < 400; i++) {
    const nx = Math.random() * 256;
    const ny = Math.random() * 256;
    const brightness = Math.floor(Math.random() * 15 + 25);
    ctx.fillStyle = `rgb(${brightness}, ${brightness + 3}, ${brightness + 8})`;
    ctx.fillRect(nx, ny, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.needsUpdate = true;
  cachedFloorTexture = texture;
  return texture;
}

// Generate beaker graduation scale texture (500ml Pyrex style)
export function createBeakerGraduationTexture(): THREE.CanvasTexture {
  if (cachedGraduationTexture) return cachedGraduationTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textBaseline = 'middle';

  // Pyrex branding
  ctx.fillText('BORO 3.3', 180, 80);
  ctx.font = '16px sans-serif';
  ctx.fillText('APPROX VOL', 180, 105);
  ctx.fillText('500 mL', 180, 125);

  // Graduation marks
  const levels = [
    { ml: '500', y: 150 },
    { ml: '400', y: 210 },
    { ml: '300', y: 270 },
    { ml: '200', y: 330 },
    { ml: '100', y: 390 },
  ];

  ctx.lineWidth = 4;
  for (const lvl of levels) {
    ctx.beginPath();
    ctx.moveTo(220, lvl.y);
    ctx.lineTo(310, lvl.y);
    ctx.stroke();

    ctx.font = 'bold 22px monospace';
    ctx.fillText(lvl.ml, 325, lvl.y);

    // Intermediate 50ml tick
    const intermediateY = lvl.y + 30;
    if (lvl.ml !== '100') {
      ctx.beginPath();
      ctx.moveTo(250, intermediateY);
      ctx.lineTo(290, intermediateY);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  cachedGraduationTexture = texture;
  return texture;
}
