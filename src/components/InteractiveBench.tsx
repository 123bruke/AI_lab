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
import { ExperimentState, LabToolType } from '../types';
import { labAudio } from '../utils/audio';

interface BenchItemData {
  id: string;
  type: LabToolType;
  name: string;
  pos: [number, number, number];
  rotY: number;
}

interface InteractiveBenchProps {
  experiment: ExperimentState;
  selectedId: string | null;
  onSelectItem: (id: string | null, type: LabToolType | null, name: string | null) => void;
  onBurnerPosChange: (pos: [number, number, number]) => void;
  onBeakerPosChange: (pos: [number, number, number]) => void;
  onAddIce: () => void;
  onAddChemical: (color: string, name: string) => void;
  isDraggingItem: boolean;
  setIsDraggingItem: (dragging: boolean) => void;
}

export const InteractiveBench: React.FC<InteractiveBenchProps> = ({
  experiment,
  selectedId,
  onSelectItem,
  onBurnerPosChange,
  onBeakerPosChange,
  onAddIce,
  onAddChemical,
  isDraggingItem,
  setIsDraggingItem,
}) => {
  const { camera, gl } = useThree();

  // Benchtop height is 0.88m
  const benchY = 0.88;
  const standGauzeY = 0.88 + 0.36; // 1.24m (height of wire gauze)

  // Initial items placed on the bench with convenient initial layout
  const [items, setItems] = useState<BenchItemData[]>([
    { id: 'stand', type: 'stand', name: 'Retort Stand & Wire Gauze', pos: [0, benchY, 0], rotY: 0 },
    { id: 'burner', type: 'burner', name: 'Bunsen Burner', pos: [0, benchY, 0], rotY: 0 },
    { id: 'beaker', type: 'beaker', name: '500mL Borosilicate Beaker', pos: [0, standGauzeY, 0], rotY: 0 },
    { id: 'thermometer', type: 'thermometer', name: 'Laboratory Thermometer', pos: [0.08, standGauzeY + 0.05, 0], rotY: -0.15 },
    { id: 'flask', type: 'flask', name: '250mL Erlenmeyer Flask', pos: [0.85, benchY, 0.15], rotY: 0.4 },
    { id: 'test_tubes', type: 'test_tubes', name: 'Test Tube Rack & Reagents', pos: [-0.95, benchY, -0.15], rotY: 0 },
    { id: 'cylinder', type: 'cylinder', name: '100mL Graduated Cylinder', pos: [0.55, benchY, -0.25], rotY: 0 },
    { id: 'chemical_jar', type: 'chemical_jar', name: 'CuSO₄ Reagent Jar', pos: [-0.55, benchY, 0.28], rotY: 0.3 },
    { id: 'ice_bucket', type: 'ice_bucket', name: 'Thermal Ice Bucket', pos: [1.15, benchY, -0.2], rotY: 0 },
    { id: 'petri_dish', type: 'petri_dish', name: 'Petri Dish (Agar Culture)', pos: [-0.85, benchY, 0.3], rotY: 0 },
    { id: 'pipette', type: 'pipette', name: 'Transfer Pipette', pos: [0.38, benchY, 0.3], rotY: 0.8 },
  ]);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // References for ultra-smooth continuous raycasting
  const activeDragIdRef = useRef<string | null>(null);
  activeDragIdRef.current = activeDragId;

  const dragOffset = useRef(new THREE.Vector3());
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -benchY));
  const planeRaycaster = useRef(new THREE.Raycaster());
  const planeIntersection = useRef(new THREE.Vector3());

  // Listen for keyboard 'R' to rotate selected item
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (!selectedId) return;
        setItems((prev) =>
          prev.map((item) =>
            item.id === selectedId
              ? { ...item, rotY: (item.rotY + Math.PI / 6) % (Math.PI * 2) }
              : item
          )
        );
        labAudio.playClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  // Pointer down on an item to initiate effortless drag
  const handlePointerDown = (e: ThreeEvent<PointerEvent>, item: BenchItemData) => {
    e.stopPropagation();
    setActiveDragId(item.id);
    setIsDraggingItem(true);
    onSelectItem(item.id, item.type, item.name);
    labAudio.playClick();

    // Calculate plane intersection offset with camera ray
    const canvasRect = gl.domElement.getBoundingClientRect();
    const ndcX = ((e.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
    const ndcY = -((e.clientY - canvasRect.top) / canvasRect.height) * 2 + 1;

    planeRaycaster.current.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
    if (planeRaycaster.current.ray.intersectPlane(groundPlane.current, planeIntersection.current)) {
      dragOffset.current.set(
        item.pos[0] - planeIntersection.current.x,
        0,
        item.pos[2] - planeIntersection.current.z
      );
    } else {
      dragOffset.current.set(0, 0, 0);
    }

    // Special quick action triggers
    if (item.type === 'ice_bucket') {
      onAddIce();
    }
    if (item.type === 'chemical_jar') {
      onAddChemical('#0284c7', 'Copper(II) Sulfate Pentahydrate');
    }
  };

  // Window-level smooth pointer move: never slips or drops regardless of mouse speed
  useEffect(() => {
    const onWindowPointerMove = (e: PointerEvent) => {
      const currentDragId = activeDragIdRef.current;
      if (!currentDragId) return;

      const canvasRect = gl.domElement.getBoundingClientRect();
      const ndcX = ((e.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
      const ndcY = -((e.clientY - canvasRect.top) / canvasRect.height) * 2 + 1;

      planeRaycaster.current.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      if (planeRaycaster.current.ray.intersectPlane(groundPlane.current, planeIntersection.current)) {
        const targetX = THREE.MathUtils.clamp(
          planeIntersection.current.x + dragOffset.current.x,
          -1.65,
          1.65
        );
        const targetZ = THREE.MathUtils.clamp(
          planeIntersection.current.z + dragOffset.current.z,
          -0.68,
          0.68
        );

        setItems((prev) => {
          const standItem = prev.find((i) => i.id === 'stand');

          return prev.map((item) => {
            if (item.id !== currentDragId) return item;

            // Lift slightly off the bench for pleasant tactile feel
            let currentY = benchY + 0.035;

            // Snapping preview when hovering near retort stand
            if (standItem && (item.type === 'beaker' || item.type === 'thermometer')) {
              const distToStand = Math.hypot(targetX - standItem.pos[0], targetZ - standItem.pos[2]);
              if (distToStand < 0.26) {
                currentY = standGauzeY + 0.03;
              }
            }

            const newPos: [number, number, number] = [targetX, currentY, targetZ];

            if (item.type === 'burner') onBurnerPosChange(newPos);
            if (item.type === 'beaker') onBeakerPosChange(newPos);

            return { ...item, pos: newPos };
          });
        });
      }
    };

    const onWindowPointerUp = () => {
      const currentDragId = activeDragIdRef.current;
      if (!currentDragId) return;

      setItems((prev) => {
        const standItem = prev.find((i) => i.id === 'stand');

        return prev.map((item) => {
          if (item.id !== currentDragId) return item;

          let finalY = benchY;
          let finalX = item.pos[0];
          let finalZ = item.pos[2];

          // Beaker snapping cleanly to retort stand wire gauze
          if (item.type === 'beaker' && standItem) {
            const distToStand = Math.hypot(finalX - standItem.pos[0], finalZ - standItem.pos[2]);
            if (distToStand < 0.28) {
              finalX = standItem.pos[0];
              finalZ = standItem.pos[2];
              finalY = standGauzeY;
            }
          }

          // Thermometer snapping neatly into reaction vessel
          if (item.type === 'thermometer') {
            const beakerItem = prev.find((i) => i.id === 'beaker');
            if (beakerItem) {
              const distToBeaker = Math.hypot(finalX - beakerItem.pos[0], finalZ - beakerItem.pos[2]);
              if (distToBeaker < 0.3) {
                finalX = beakerItem.pos[0] + 0.08;
                finalZ = beakerItem.pos[2];
                finalY = beakerItem.pos[1] + 0.05;
              }
            }
          }

          // Burner snapping directly underneath retort stand
          if (item.type === 'burner' && standItem) {
            const distToStand = Math.hypot(finalX - standItem.pos[0], finalZ - standItem.pos[2]);
            if (distToStand < 0.24) {
              finalX = standItem.pos[0];
              finalZ = standItem.pos[2];
              finalY = benchY;
            }
          }

          const resolvedPos: [number, number, number] = [finalX, finalY, finalZ];
          if (item.type === 'burner') onBurnerPosChange(resolvedPos);
          if (item.type === 'beaker') onBeakerPosChange(resolvedPos);

          return { ...item, pos: resolvedPos };
        });
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
  }, [camera, gl, onBeakerPosChange, onBurnerPosChange, setIsDraggingItem, standGauzeY]);

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
            {/* 1. Beaker */}
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

            {/* 2. Bunsen Burner */}
            {item.type === 'burner' && (
              <Burner
                isLit={experiment.isBurnerLit}
                powerPercent={experiment.firePower}
                isSelected={isSel}
              />
            )}

            {/* 3. Retort Stand */}
            {item.type === 'stand' && <LabStand isSelected={isSel} />}

            {/* 4. Thermometer */}
            {item.type === 'thermometer' && (
              <Thermometer
                temperature={experiment.temperature}
                isSelected={isSel}
              />
            )}

            {/* 5. Erlenmeyer Flask */}
            {item.type === 'flask' && <Flask isSelected={isSel} />}

            {/* 6. Test Tube Rack */}
            {item.type === 'test_tubes' && <TestTubes isSelected={isSel} />}

            {/* 7. Measuring Cylinder */}
            {item.type === 'cylinder' && <MeasuringCylinder isSelected={isSel} />}

            {/* 8. Chemical Powder Jar */}
            {item.type === 'chemical_jar' && <ChemicalJar isSelected={isSel} />}

            {/* 9. Ice Bucket */}
            {item.type === 'ice_bucket' && <IceBucket isSelected={isSel} />}

            {/* 10. Petri Dish */}
            {item.type === 'petri_dish' && <PetriDish isSelected={isSel} />}

            {/* 11. Pipette */}
            {item.type === 'pipette' && <Pipette isSelected={isSel} />}

            {/* Responsive Visual Ring on Table: Hover, Selection, and Drag Lift Disc */}
            {(isDraggingThis || isSel || isHovered) && (
              <mesh
                position={[0, item.pos[1] > benchY + 0.1 ? -(item.pos[1] - benchY) + 0.003 : 0.003, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <ringGeometry
                  args={[
                    item.type === 'stand' ? 0.26 : 0.14,
                    item.type === 'stand' ? 0.28 : 0.16,
                    32,
                  ]}
                />
                <meshBasicMaterial
                  color={isDraggingThis ? '#38bdf8' : isSel ? '#0ea5e9' : '#94a3b8'}
                  transparent
                  opacity={isDraggingThis ? 0.9 : isSel ? 0.6 : 0.3}
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
