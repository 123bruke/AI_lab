export type LabToolType =
  | 'beaker'
  | 'flask'
  | 'burner'
  | 'stand'
  | 'test_tubes'
  | 'cylinder'
  | 'thermometer'
  | 'pipette'
  | 'petri_dish'
  | 'chemical_jar'
  | 'ice_bucket'
  | 'stirring_rod';

export interface LabItem {
  id: string;
  type: LabToolType;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  isSelectable: boolean;
  isDraggable: boolean;
  chemicalContent?: {
    name: string;
    formula: string;
    volumeMl: number;
    color: string;
    density: number;
  };
}

export type WaterState = 'ice' | 'liquid' | 'heating' | 'near_boiling' | 'boiling';

export interface ExperimentState {
  temperature: number; // in Celsius
  heatingRate: number; // °C/sec (positive = heating, negative = cooling)
  firePower: number; // 0 to 100%
  isBurnerLit: boolean;
  waterState: WaterState;
  steamIntensity: number; // 0 to 1
  bubbleRate: number; // 0 to 1
  waterTurbulence: number; // 0 to 1
  liquidVolume: number; // in ml
  liquidColor: string; // hex
  soluteName: string;
  elapsedSeconds: number;
  isSimulating: boolean;
  simSpeed: number; // 1x, 2x, 4x
}

export interface LabLightingState {
  mainCeiling: boolean;
  benchSpot: boolean;
  fumeHood: boolean;
  uvBlacklight: boolean;
}

export type CameraViewPreset = 'overview' | 'experiment_focus' | 'macro_beaker' | 'top_down';

export interface EquipmentInfo {
  name: string;
  category: string;
  material: string;
  description: string;
  safeTempLimit: string;
  usageTip: string;
}
