import React, { useState } from 'react';
import { LabToolType, EquipmentInfo } from '../types';
import { CHEMICAL_PRESETS } from '../simulation/thermodynamics';
import { Info, RotateCw, Snowflake, Droplets, FlaskConical, X, ChevronDown, ChevronUp } from 'lucide-react';
import { labAudio } from '../utils/audio';

const EQUIPMENT_DETAILS: Record<LabToolType, EquipmentInfo> = {
  beaker: {
    name: '500mL Borosilicate Glass Beaker',
    category: 'Volumetric Reaction Vessel',
    material: 'Borosilicate Glass (Boro 3.3)',
    safeTempLimit: 'Up to 500°C (thermal shock ΔT ≈ 150°C)',
    description: 'Standard cylindrical reaction container with flat base and pouring spout for solution preparation, dissolution, and thermal heating.',
    usageTip: 'Always heat over a ceramic-centered wire gauze to avoid localized thermal fracture.',
  },
  burner: {
    name: 'Tirrill / Bunsen Burner',
    category: 'Combustion Heat Source',
    material: 'Cast Iron Base, Brass Air Collar, Chrome Barrel',
    safeTempLimit: 'Flame temp 300°C - 1500°C',
    description: 'Laboratory gas burner producing a stoichiometric non-luminous blue flame for direct thermodynamic thermal transfer.',
    usageTip: 'Adjust the rotating air collar to achieve a clean, hot blue cone with no sooting.',
  },
  stand: {
    name: 'Retort Stand & Wire Gauze',
    category: 'Support Apparatus',
    material: 'Cast Iron Baseplate, Steel Upright Rod, Ceramic Gauze',
    safeTempLimit: 'Ceramic center heat-resistant to 1100°C',
    description: 'Heavy laboratory support system with boss-head clamp, iron ring, and ceramic wire gauze for stable vessel heating.',
    usageTip: 'Keep heavy base toward you for center-of-gravity stability.',
  },
  thermometer: {
    name: 'Laboratory Partial Immersion Thermometer',
    category: 'Thermodynamic Sensor',
    material: 'Boro Glass with Red Spirit / Mercury Fluid Column',
    safeTempLimit: '-10°C to +110°C (1°C subdivisions)',
    description: 'Calibrated laboratory glass thermometer for monitoring bulk solution temperatures and phase transition plateaus.',
    usageTip: 'Do not touch the bulb directly to the bottom glass of the beaker.',
  },
  flask: {
    name: '250mL Erlenmeyer (Conical) Flask',
    category: 'Mixing & Titration Vessel',
    material: 'Borosilicate Glass 3.3',
    safeTempLimit: 'Up to 500°C',
    description: 'Conical shaped body with cylindrical neck designed to minimize vapor loss and prevent splashing during swirling.',
    usageTip: 'Ideal for rapid swirling and refluxing volatile solutions.',
  },
  test_tubes: {
    name: 'Test Tube Rack & Chemical Reagents',
    category: 'Micro-scale Reaction Rack',
    material: 'Polished Hardwood Rack with Glass Reaction Tubes',
    safeTempLimit: 'Glass tubes: 450°C',
    description: 'Rack holding four individual reaction tubes with solutions of Phenolphthalein, CuSO₄, FeCl₃, and Deionized Water.',
    usageTip: 'Always use test tube holders when heating directly in a flame.',
  },
  cylinder: {
    name: '100mL Graduated Measuring Cylinder',
    category: 'Volumetric Measurement',
    material: 'Class A Borosilicate Glass with Hex Base',
    safeTempLimit: 'Ambient measurement (avoid heating)',
    description: 'High-precision liquid measurement cylinder with white ceramic etched graduation scale and anti-roll hexagonal base.',
    usageTip: 'Read the volume at the bottom of the curved liquid meniscus at eye level.',
  },
  chemical_jar: {
    name: 'Reagent Salt Bottle (CuSO₄ · 5H₂O)',
    category: 'Chemical Solid Storage',
    material: 'Amber Chemical Glass with Polypropylene Screw Cap',
    safeTempLimit: 'Store at 15°C - 25°C',
    description: 'Laboratory grade Copper(II) Sulfate Pentahydrate blue crystals for thermodynamic hydration and colorimetric experiments.',
    usageTip: 'Dissolves readily in warm deionized water to form vivid blue aqueous ions.',
  },
  ice_bucket: {
    name: 'Insulated Cryogenic Ice Bucket',
    category: 'Thermal Quenching Medium',
    material: 'Double-walled Brushed Stainless Steel',
    safeTempLimit: '0°C latent ice reservoir',
    description: 'Thermal reservoir containing pure crystalline ice cubes for rapid cooling, phase equilibria, and endothermic quenching.',
    usageTip: 'Add ice to the beaker to observe rapid temperature decrease via latent heat.',
  },
  petri_dish: {
    name: 'Borosilicate Glass Petri Dish',
    category: 'Crystallization & Culture Dish',
    material: 'Optically Clear Borosilicate Glass',
    safeTempLimit: 'Autoclavable to 200°C',
    description: 'Shallow cylindrical glass dish with matching loose-fitting lid for slow solvent evaporation and crystallization observation.',
    usageTip: 'Used for observing microscopic crystalline formations.',
  },
  pipette: {
    name: 'Volumetric Transfer Pipette',
    category: 'Precision Liquid Handling',
    material: 'Glass Capillary with Natural Rubber Suction Bulb',
    safeTempLimit: 'Ambient transfer (0°C - 60°C)',
    description: 'Dropper pipette for dropwise addition of indicators and aqueous chemical reagents to the reaction beaker.',
    usageTip: 'Hold strictly vertical when dispensing drops for accurate droplet volume.',
  },
  stirring_rod: {
    name: 'Glass Stirring Rod',
    category: 'Reaction Mixing',
    material: 'Annealed Borosilicate Glass',
    safeTempLimit: 'Up to 500°C',
    description: 'Solid glass rod with rounded fire-polished ends for promoting solute dissolution and thermal uniformity.',
    usageTip: 'Stir gently in circular motions without striking the beaker walls.',
  },
};

interface ObjectInspectorProps {
  toolType: LabToolType | null;
  onClose: () => void;
  onRotateItem: () => void;
  onAddIce: () => void;
  onSelectChemical: (color: string, name: string) => void;
  onRefillWater: () => void;
}

export const ObjectInspector: React.FC<ObjectInspectorProps> = ({
  toolType,
  onClose,
  onRotateItem,
  onAddIce,
  onSelectChemical,
  onRefillWater,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  if (!toolType) return null;

  const info = EQUIPMENT_DETAILS[toolType] || {
    name: 'Laboratory Equipment',
    category: 'Apparatus',
    material: 'Scientific Glass / Metal',
    safeTempLimit: 'Standard Laboratory Spec',
    description: 'Precision laboratory equipment for chemical synthesis and thermodynamics.',
    usageTip: 'Handle with clean laboratory gloves.',
  };

  if (isMinimized) {
    return (
      <div
        id="object-inspector-panel-minimized"
        className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2 text-neutral-900 z-30 shadow-2xl flex items-center gap-3 text-xs border border-neutral-200/90 cursor-pointer hover:bg-white transition-all select-none"
        onClick={() => setIsMinimized(false)}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-neutral-800 truncate max-w-[170px]">
          {info.name}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(false);
          }}
          className="text-neutral-500 hover:text-neutral-900 p-0.5 rounded transition-colors"
          title="Expand Details"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            labAudio.playClick();
            onClose();
          }}
          className="text-neutral-400 hover:text-neutral-800 p-0.5 rounded transition-colors"
          title="Deselect"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      id="object-inspector-panel"
      className="absolute bottom-5 right-5 w-80 sm:w-88 bg-white/95 backdrop-blur-2xl rounded-3xl p-5 text-neutral-900 z-30 shadow-2xl animate-fade-in border border-neutral-200/80 select-none"
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
        <div className="pr-2">
          <span className="inline-block px-2 py-0.5 rounded-full bg-neutral-100 text-[10px] font-medium tracking-wide uppercase text-neutral-600 mb-1">
            {info.category}
          </span>
          <h3 className="text-sm font-bold text-neutral-900 leading-snug tracking-tight">{info.name}</h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            title="Minimize Inspector"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              labAudio.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="mt-3.5 space-y-2.5 text-xs">
        <p className="text-neutral-600 leading-relaxed text-[12px]">{info.description}</p>

        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
          <div className="bg-neutral-50 p-2.5 rounded-2xl border border-neutral-150">
            <span className="text-neutral-400 block text-[9px] uppercase font-sans font-semibold tracking-wider">Composition</span>
            <span className="text-neutral-800 font-medium text-[11px] mt-0.5 block truncate">{info.material}</span>
          </div>
          <div className="bg-neutral-50 p-2.5 rounded-2xl border border-neutral-150">
            <span className="text-neutral-400 block text-[9px] uppercase font-sans font-semibold tracking-wider">Thermal Limit</span>
            <span className="text-rose-600 font-semibold text-[11px] mt-0.5 block truncate">{info.safeTempLimit}</span>
          </div>
        </div>

        <div className="p-2.5 bg-blue-50/80 rounded-2xl border border-blue-100 text-[11px] text-blue-900 flex items-start gap-2 leading-relaxed">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>{info.usageTip}</span>
        </div>
      </div>

      {/* Interactive Quick Actions */}
      <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-wrap gap-2">
        <button
          onClick={() => {
            labAudio.playClick();
            onRotateItem();
          }}
          className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5 text-neutral-300" />
          <span>Rotate 3D (R)</span>
        </button>

        {toolType === 'beaker' && (
          <>
            <button
              onClick={() => {
                labAudio.playClick();
                onRefillWater();
              }}
              className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 border border-blue-200 transition-all cursor-pointer"
            >
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              <span>Refill Meniscus</span>
            </button>
            <button
              onClick={() => {
                labAudio.playClick();
                onAddIce();
              }}
              className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold flex items-center gap-1.5 border border-sky-200 transition-all cursor-pointer"
            >
              <Snowflake className="w-3.5 h-3.5 text-sky-600" />
              <span>Add Ice Cube</span>
            </button>
          </>
        )}

        {toolType === 'ice_bucket' && (
          <button
            onClick={() => {
              labAudio.playClick();
              onAddIce();
            }}
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Snowflake className="w-4 h-4" />
            <span>Transfer Cryogenic Ice Cube</span>
          </button>
        )}

        {(toolType === 'chemical_jar' || toolType === 'test_tubes') && (
          <div className="w-full pt-1.5 space-y-1.5">
            <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-neutral-500 block">
              Inject Chemical Solute:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {CHEMICAL_PRESETS.slice(1).map((chem) => (
                <button
                  key={chem.formula}
                  onClick={() => {
                    labAudio.playClick();
                    onSelectChemical(chem.color, chem.name);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-left text-[11px] font-medium flex items-center gap-2 text-neutral-800 border border-neutral-200/70 truncate transition-all cursor-pointer"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: chem.color }}
                  />
                  <span className="truncate">{chem.formula}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
