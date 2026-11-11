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
  | 'stirring_rod'
  | 'convex_lens'
  | 'concave_lens'
  | 'plane_mirror'
  | 'concave_mirror'
  | 'convex_mirror'
  | 'prism'
  | 'optical_bench'
  | 'light_source'
  | 'screen'
  | 'laser_pointer'
  | 'dynamic_material';

export interface BenchItemData {
  id: string;
  type: LabToolType;
  name: string;
  pos: [number, number, number];
  rotY: number;
  isRemovable?: boolean;
  materialRefId?: string;
  color?: string;
  description?: string;
}

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
