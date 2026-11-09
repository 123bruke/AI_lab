import { ExperimentState, WaterState } from '../types';

export const INITIAL_EXPERIMENT_STATE: ExperimentState = {
  temperature: 22.0,
  heatingRate: 0,
  firePower: 70, // default 70%
  isBurnerLit: false,
  waterState: 'liquid',
  steamIntensity: 0,
  bubbleRate: 0,
  waterTurbulence: 0,
  liquidVolume: 350, // 350 ml
  liquidColor: '#38bdf8', // crisp pure aquatic blue
  soluteName: 'Pure Deionized H₂O',
  elapsedSeconds: 0,
  isSimulating: false,
  simSpeed: 1.5,
};

import { REAGENTS_DATABASE, ChemicalReagent } from '../data/reagentsData';

export { REAGENTS_DATABASE };
export type { ChemicalReagent };

export const CHEMICAL_PRESETS = REAGENTS_DATABASE.map((r) => ({
  name: r.name,
  formula: r.formula,
  color: r.color,
  description: r.description,
}));

export function computeWaterState(temp: number): WaterState {
  if (temp < 10) return 'ice';
  if (temp < 45) return 'liquid';
  if (temp < 75) return 'heating';
  if (temp < 95) return 'near_boiling';
  return 'boiling';
}

export function updateThermodynamics(
  prev: ExperimentState,
  deltaSeconds: number,
  burnerPos: [number, number, number],
  beakerPos: [number, number, number]
): ExperimentState {
  const dt = deltaSeconds * prev.simSpeed;

  // Calculate 2D horizontal distance between burner and beaker
  const dx = burnerPos[0] - beakerPos[0];
  const dz = burnerPos[2] - beakerPos[2];
  const horizontalDist = Math.sqrt(dx * dx + dz * dz);

  // Burner must be relatively under or directly beneath beaker (within ~0.45m radius)
  const isDirectlyUnder = horizontalDist < 0.45;
  const burnerEffectivePower = (prev.isBurnerLit && isDirectlyUnder) ? (prev.firePower / 100) : 0;

  // Thermal physics:
  // Heat input directly corresponds to combustion power (non-linear flame efficacy)
  // Low flame has lower thermal efficiency and smaller flame height; high flame delivers fierce direct heat flux
  const proximityFactor = Math.max(0, 1 - (horizontalDist / 0.45));
  const volumeFactor = 350 / Math.max(100, prev.liquidVolume);
  
  // Flame power curve: small flame (20%) produces much less heat (~2.5°C/s), high flame (100%) produces intense heat (~22°C/s)
  const flameEfficacy = Math.pow(burnerEffectivePower, 1.35);
  const heatInput = flameEfficacy * 22.0 * proximityFactor * volumeFactor;

  // Cooling physics: Newton's Law of Cooling + Surface Evaporative Loss
  const ambientTemp = 22.0;
  const tempDiff = prev.temperature - ambientTemp;
  let coolingRate = 0.075 * tempDiff;

  if (prev.temperature > 75) {
    // Evaporative cooling accelerates sharply near boiling
    coolingRate += (prev.temperature - 75) * 0.16;
  }

  // Net temperature rate of change (°C / sec)
  let netRate = heatInput - coolingRate;

  // If water is boiling, temperature plateaus around 100°C (latent heat of vaporization)
  if (prev.temperature >= 100 && netRate > 0) {
    netRate = netRate * 0.04; // Energy goes into phase change rather than temperature rise
  }

  let newTemp = prev.temperature + netRate * dt;

  // Phase change plateau: water boils at 100°C (slight atmospheric elevation to 101.2°C)
  if (newTemp > 101.2) {
    newTemp = 101.2;
  }
  if (newTemp < 0.5) {
    newTemp = 0.5;
  }

  // Evaporation of volume during boiling: faster when fire is high
  let newVolume = prev.liquidVolume;
  if (newTemp >= 97 && burnerEffectivePower > 0) {
    const evaporationRate = (burnerEffectivePower * 1.2 + 0.15) * dt; // ml per sec
    newVolume = Math.max(40, prev.liquidVolume - evaporationRate);
  }

  const waterState = computeWaterState(newTemp);

  // Steam intensity: starts softly at 55°C, reaches 1.0 at 100°C (scaled by flame power when boiling)
  let steamIntensity = 0;
  if (newTemp > 55) {
    const baseSteam = Math.min(1.0, Math.pow((newTemp - 55) / 45, 1.8));
    steamIntensity = Math.min(1.0, baseSteam * (0.6 + burnerEffectivePower * 0.4));
  }

  // Bubble rate: nucleation begins around 48°C, rapid rolling bubbles at 95°C+
  let bubbleRate = 0;
  if (newTemp > 45) {
    bubbleRate = Math.min(1.0, Math.pow((newTemp - 45) / 55, 1.5) * (0.5 + burnerEffectivePower * 0.5));
  }

  // Water turbulence: calm surface at room temp, ripples at 75°C, vigorous churning at 100°C with high flame
  let waterTurbulence = 0;
  if (newTemp > 50) {
    waterTurbulence = Math.min(1.0, (newTemp - 50) / 50);
    if (newTemp >= 95) {
      waterTurbulence = 0.7 + 0.3 * burnerEffectivePower + 0.15 * Math.sin(prev.elapsedSeconds * 9);
    }
  }

  return {
    ...prev,
    temperature: parseFloat(newTemp.toFixed(1)),
    heatingRate: parseFloat(netRate.toFixed(2)),
    waterState,
    steamIntensity,
    bubbleRate,
    waterTurbulence,
    liquidVolume: parseFloat(newVolume.toFixed(1)),
    elapsedSeconds: prev.elapsedSeconds + dt,
  };
}
