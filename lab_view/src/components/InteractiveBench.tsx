import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { Beaker } from '../chemistry/Beaker';
import { Burner } from '../chemistry/Burner';
import { LabStand } from '../chemistry/LabStand';
import { Thermometer } from '../chemistry/Thermometer';
import { Flask } from '../chemistry/Flask';
import { TestTubes } from '../chemistry/TestTubes';
import {
  MeasuringCylinder,
  ChemicalJar,
  IceBucket,
  PetriDish,
  Pipette,
} from '../chemistry/OtherEquipment';
import { DynamicBenchToolRenderer } from '../chemistry/Optics4DEquipment';
import { ExperimentState, LabToolType, BenchItemData } from '../types';
import { labAudio } from '../utils/audio';

export const INITIAL_BENCH_ITEMS: BenchItemData[] = [
  { id: 'stand', type: 'stand', name: 'Retort Stand & Wire Gauze', pos: [0, 0.88, 0], rotY: 0 },
  { id: 'burner', type: 'burner', name: 'Bunsen Burner', pos: [0, 0.88, 0], rotY: 0 },
  { id: 'beaker', type: 'beaker', name: '500mL Borosilicate Beaker', pos: [0, 1.24, 0], rotY: 0 },
  { id: 'thermometer', type: 'thermometer', name: 'Laboratory Thermometer', pos: [0.08, 1.29, 0], rotY: -0.15 },
  { id: 'flask', type: 'flask', name: '250mL Erlenmeyer Flask', pos: [0.85, 0.88, 0.15], rotY: 0.4 },
  { id: 'test_tubes', type: 'test_tubes', name: 'Test Tube Rack & Reagents', pos: [-0.95, 0.88, -0.15], rotY: 0 },
  { id: 'cylinder', type: 'cylinder', name: '100mL Graduated Cylinder', pos: [0.55, 0.88, -0.25], rotY: 0 },
  { id: 'chemical_jar', type: 'chemical_jar', name: 'CuSO₄ Reagent Jar', pos: [-0.55, 0.88, 0.28], rotY: 0.3 },
  { id: 'ice_bucket', type: 'ice_bucket', name: 'Thermal Ice Bucket', pos: [1.15, 0.88, -0.2], rotY: 0 },
  { id: 'petri_dish', type: 'petri_dish', name: 'Petri Dish (Agar Culture)', pos: [-0.85, 0.88, 0.3], rotY: 0 },
  { id: 'pipette', type: 'pipette', name: 'Transfer Pipette', pos: [0.38, 0.88, 0.8], rotY: 0.8 },
];

interface InteractiveBenchProps {
  experiment: ExperimentState;
  items: BenchItemData[];
  setItems: React.Dispatch<React.SetStateAction<BenchItemData[]>>;
  selectedId: string | null;
  onSelectItem: (id: string | null, type: LabToolType | null, name: string | null) => void;
  onBurnerPosChange: (pos: [number, number, number]) => void;
  onBeakerPosChange: (pos: [number, number, number]) => void;
  onAddIce: () => void;
  onAddChemical: (color: string, name: string) => void;
  isDraggingItem: boolean;
  setIsDraggingItem: (dragging: boolean) => void;
  onRemoveItem?: (id: string) => void;
}

export const InteractiveBench: React.FC<InteractiveBenchProps> = ({
  experiment,
  items,
  setItems,
  selectedId,
  onSelectItem,
  onBurnerPosChange,
  onBeakerPosChange,
  onAddIce,
  onAddChemical,
  isDraggingItem,
  setIsDraggingItem,
  onRemoveItem,
}) => {
  const { camera, gl } = useThree();

  // Benchtop height is 0.88m
  const benchY = 0.88;
  const standGauzeY = 0.88 + 0.36; // 1.24m (height of wire gauze)

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // References for continuous raycasting
  const activeDragIdRef = useRef<string | null>(null);
  activeDragIdRef.current = activeDragId;

  const dragOffset = useRef(new THREE.Vector3());
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -benchY));
  const planeRaycaster = useRef(new THREE.Raycaster());
  const planeIntersection = useRef(new THREE.Vector3());

  // Listen for keyboard 'R' to rotate, and 'Delete' / 'Backspace' to delete selected item
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;

      if (e.key === 'r' || e.key === 'R') {
        setItems((prev) =>
          prev.map((item) =>
            item.id === selectedId
              ? { ...item, rotY: (item.rotY + Math.PI / 6) % (Math.PI * 2) }
              : item
          )
        );
        labAudio.playClick();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Prevent deleting if user is typing in an input
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;

        if (onRemoveItem) {
          onRemoveItem(selectedId);
        } else {
          setItems((prev) => prev.filter((item) => item.id !== selectedId));
          onSelectItem(null, null, null);
        }
        labAudio.playGlassClink();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, setItems, onSelectItem, onRemoveItem]);

  // Pointer Down to initiate drag or selection
  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>, item: BenchItemData) => {
      e.stopPropagation();

      onSelectItem(item.id, item.type, item.name);
      setActiveDragId(item.id);
      setIsDraggingItem(true);
      labAudio.playClick();

      // Intersect ray with ground plane
      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      planeRaycaster.current.setFromCamera(mouse, camera);

      if (planeRaycaster.current.ray.intersectPlane(groundPlane.current, planeIntersection.current)) {
        dragOffset.current.set(
          item.pos[0] - planeIntersection.current.x,
          0,
          item.pos[2] - planeIntersection.current.z
        );
      }
    },
    [camera, onSelectItem, setIsDraggingItem]
  );

  // Global window listeners for drag movement
  useEffect(() => {
    const onWindowPointerMove = (e: PointerEvent) => {
      if (!activeDragIdRef.current) return;

      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      planeRaycaster.current.setFromCamera(mouse, camera);

      if (planeRaycaster.current.ray.intersectPlane(groundPlane.current, planeIntersection.current)) {
        let newX = planeIntersection.current.x + dragOffset.current.x;
        let newZ = planeIntersection.current.z + dragOffset.current.z;

        // Clamp to laboratory bench bounds [-1.6, 1.6] x [-0.6, 0.6]
        newX = THREE.MathUtils.clamp(newX, -1.6, 1.6);
        newZ = THREE.MathUtils.clamp(newZ, -0.6, 0.6);

        setItems((prev) =>
          prev.map((item) => {
            if (item.id === activeDragIdRef.current) {
              const currentY = item.pos[1];
              return { ...item, pos: [newX, currentY, newZ] };
            }
            return item;
          })
        );
      }
    };

    const onWindowPointerUp = () => {
      if (!activeDragIdRef.current) return;

      setItems((prev) => {
        const currentItems = [...prev];
        const stand = currentItems.find((i) => i.id === 'stand');
        const beaker = currentItems.find((i) => i.id === 'beaker');
        const burner = currentItems.find((i) => i.id === 'burner');

        if (stand && beaker) {
          const distToBeaker = Math.hypot(beaker.pos[0] - stand.pos[0], beaker.pos[2] - stand.pos[2]);
          if (distToBeaker < 0.28) {
            beaker.pos = [stand.pos[0], standGauzeY, stand.pos[2]];
          } else {
            beaker.pos = [beaker.pos[0], benchY, beaker.pos[2]];
          }
          onBeakerPosChange(beaker.pos);
        }

        if (stand && burner) {
          const distToBurner = Math.hypot(burner.pos[0] - stand.pos[0], burner.pos[2] - stand.pos[2]);
          if (distToBurner < 0.22) {
            burner.pos = [stand.pos[0], benchY, stand.pos[2]];
          }
          onBurnerPosChange(burner.pos);
        }

        return currentItems;
      });

      labAudio.playGlassClink();
      setActiveDragId(null);
      setIsDraggingItem(false);
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
    };
  }, [camera, onBeakerPosChange, onBurnerPosChange, setItems, setIsDraggingItem, standGauzeY]);

  // Handle bench background click to deselect
  const handleBenchClick = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (!activeDragId) {
        onSelectItem(null, null, null);
      }
    },
    [activeDragId, onSelectItem]
  );

  return (
    <group>
      {/* Invisible broad plane on bench for clicking to clear selection */}
      <mesh
        position={[0, benchY + 0.001, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={handleBenchClick}
      >
        <planeGeometry args={[3.8, 1.8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {items.map((item) => {
        const isSel = selectedId === item.id;
        const isDraggingThis = activeDragId === item.id;
        const isHovered = hoveredId === item.id;

        return (
          <group
            key={item.id}
            position={item.pos}
            rotation={[0, item.rotY, 0]}
            onPointerDown={(e) => handlePointerDown(e, item)}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredId(item.id);
              gl.domElement.style.cursor = 'grab';
            }}
            onPointerOut={() => {
              setHoveredId(null);
              if (!activeDragId) {
                gl.domElement.style.cursor = 'default';
              }
            }}
          >
            {/* Standard Chemistry Items */}
            {item.type === 'beaker' && (
              <Beaker
                temperature={experiment.temperature}
                volumeMl={experiment.liquidVolume}
                liquidColor={experiment.liquidColor}
                bubbleRate={experiment.bubbleRate}
                steamIntensity={experiment.steamIntensity}
                waterTurbulence={experiment.waterTurbulence}
                isSelected={isSel}
              />
            )}
            {item.type === 'burner' && (
              <Burner
                isLit={experiment.isBurnerLit}
                powerPercent={experiment.firePower}
                isSelected={isSel}
              />
            )}
            {item.type === 'stand' && <LabStand isSelected={isSel} />}
            {item.type === 'thermometer' && (
              <Thermometer
                temperature={experiment.temperature}
                isSelected={isSel}
              />
            )}
            {item.type === 'flask' && <Flask isSelected={isSel} />}
            {item.type === 'test_tubes' && <TestTubes isSelected={isSel} />}
            {item.type === 'cylinder' && <MeasuringCylinder isSelected={isSel} />}
            {item.type === 'chemical_jar' && <ChemicalJar isSelected={isSel} />}
            {item.type === 'ice_bucket' && <IceBucket isSelected={isSel} />}
            {item.type === 'petri_dish' && <PetriDish isSelected={isSel} />}
            {item.type === 'pipette' && <Pipette isSelected={isSel} />}

            {/* Dynamic 4D Optics & Custom Placed Equipment */}
            {item.type !== 'beaker' &&
              item.type !== 'burner' &&
              item.type !== 'stand' &&
              item.type !== 'thermometer' &&
              item.type !== 'flask' &&
              item.type !== 'test_tubes' &&
              item.type !== 'cylinder' &&
              item.type !== 'chemical_jar' &&
              item.type !== 'ice_bucket' &&
              item.type !== 'petri_dish' &&
              item.type !== 'pipette' && (
                <DynamicBenchToolRenderer
                  toolType={item.type}
                  color={item.color}
                  name={item.name}
                  isSelected={isSel}
                  isHovered={isHovered}
                />
              )}

            {/* Interactive Ground Target Ring: Selection & Drag Highlighting */}
            {(isDraggingThis || isSel || isHovered) && (
              <mesh
                position={[0, item.pos[1] > benchY + 0.1 ? -(item.pos[1] - benchY) + 0.003 : 0.003, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <ringGeometry
                  args={[
                    item.type === 'stand' || item.type === 'optical_bench' ? 0.28 : 0.14,
                    item.type === 'stand' || item.type === 'optical_bench' ? 0.31 : 0.16,
                    32,
                  ]}
                />
                <meshBasicMaterial
                  color={isDraggingThis ? '#22c55e' : isSel ? '#10b981' : '#94a3b8'}
                  transparent
                  opacity={isDraggingThis ? 0.95 : isSel ? 0.75 : 0.35}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};
