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
        className="absolute bottom-4 right-4 glass-panel rounded-xl px-3 py-1.5 text-white z-20 shadow-xl flex items-center gap-2 text-xs border border-white/10 cursor-pointer hover:bg-slate-900/80 transition-colors"
        onClick={() => setIsMinimized(false)}
      >
        <span className="font-mono text-sky-400 font-medium truncate max-w-[160px]">
          {info.name}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(false);
          }}
          className="text-neutral-400 hover:text-white"
          title="Expand Details"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            labAudio.playClick();
            onClose();
          }}
          className="text-neutral-400 hover:text-white ml-1"
          title="Deselect"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      id="object-inspector-panel"
      className="absolute bottom-4 right-4 w-76 sm:w-80 glass-panel rounded-2xl p-3.5 text-white z-20 shadow-2xl animate-fade-in border border-white/10"
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-2 border-b border-white/10">
        <div className="pr-2">
          <span className="text-[9px] font-mono tracking-wider uppercase text-sky-400 font-semibold">
            {info.category}
          </span>
          <h3 className="text-xs font-bold text-neutral-100 leading-snug">{info.name}</h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimize Inspector"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              labAudio.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Deselect"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 space-y-2 text-xs">
        <p className="text-neutral-300 leading-relaxed">{info.description}</p>

        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
          <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <span className="text-neutral-400 block text-[9px] uppercase">Composition</span>
            <span className="text-neutral-200 font-medium">{info.material}</span>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <span className="text-neutral-400 block text-[9px] uppercase">Thermal Limit</span>
            <span className="text-amber-400 font-medium">{info.safeTempLimit}</span>
          </div>
        </div>

        <div className="p-2 bg-sky-950/40 rounded-lg border border-sky-500/20 text-[11px] text-sky-200/90 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
          <span>{info.usageTip}</span>
        </div>
      </div>

      {/* Interactive Actions */}
      <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
        <button
          onClick={() => {
            labAudio.playClick();
            onRotateItem();
          }}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 border border-white/10 transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5 text-sky-400" />
          <span>Rotate (R)</span>
        </button>

        {toolType === 'beaker' && (
          <>
            <button
              onClick={() => {
                labAudio.playClick();
                onRefillWater();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-sky-900/60 hover:bg-sky-800 text-sky-200 text-xs font-medium flex items-center gap-1.5 border border-sky-500/30 transition-colors"
            >
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>Refill H₂O</span>
            </button>
            <button
              onClick={() => {
                labAudio.playClick();
                onAddIce();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-xs font-medium flex items-center gap-1.5 border border-cyan-500/30 transition-colors"
            >
              <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
              <span>Drop Ice Cube</span>
            </button>
          </>
        )}

        {toolType === 'ice_bucket' && (
          <button
            onClick={() => {
              labAudio.playClick();
              onAddIce();
            }}
            className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span>Add Ice Cube to Beaker</span>
          </button>
        )}

        {(toolType === 'chemical_jar' || toolType === 'test_tubes') && (
          <div className="w-full pt-1 space-y-1">
            <span className="text-[10px] uppercase font-mono text-neutral-400 block">
              Inject Chemical Solution:
            </span>
            <div className="grid grid-cols-2 gap-1">
              {CHEMICAL_PRESETS.slice(1).map((chem) => (
                <button
                  key={chem.formula}
                  onClick={() => {
                    labAudio.playClick();
                    onSelectChemical(chem.color, chem.name);
                  }}
                  className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-left text-[10px] font-mono flex items-center gap-1.5 text-neutral-200 border border-white/5 truncate"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
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
