'use client';

import { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

// Repair location mappings for common tasks
const REPAIR_LOCATIONS: Record<string, {
  position: [number, number, number];
  label: string;
  description: string;
  cameraPosition?: [number, number, number];
}> = {
  // Engine bay tasks
  'oil_change': { position: [1.5, 0.3, 0], label: 'Oil Drain', description: 'Under the engine - look for the oil pan', cameraPosition: [3, 0, 3] },
  'oil_filter': { position: [1.2, 0.5, 0.5], label: 'Oil Filter', description: 'Side or bottom of engine', cameraPosition: [3, 1, 3] },
  'air_filter': { position: [1.5, 0.8, 0.3], label: 'Air Filter', description: 'Engine bay - air box', cameraPosition: [3, 2, 2] },
  'coolant': { position: [1.6, 0.6, 0], label: 'Coolant', description: 'Radiator at front of engine', cameraPosition: [4, 1, 0] },
  'spark_plugs': { position: [1.0, 0.7, 0.2], label: 'Spark Plugs', description: 'Top of engine - one per cylinder', cameraPosition: [2, 2, 2] },
  'battery': { position: [1.2, 0.8, -0.6], label: 'Battery', description: 'Engine bay - usually on side', cameraPosition: [2, 2, -2] },

  // Brake tasks
  'brake_pads_front': { position: [1.8, 0.2, 0.8], label: 'Front Brakes', description: 'Behind front wheels', cameraPosition: [3, 1, 3] },
  'brake_pads_rear': { position: [-1.5, 0.2, 0.8], label: 'Rear Brakes', description: 'Behind rear wheels', cameraPosition: [-2, 1, 3] },
  'brake_fluid': { position: [0.8, 0.9, -0.3], label: 'Brake Fluid', description: 'Master cylinder in engine bay', cameraPosition: [2, 2, -1] },

  // Tire tasks
  'tire_rotation': { position: [1.8, 0.2, 0.8], label: 'Wheels', description: 'All four corners', cameraPosition: [4, 2, 4] },
  'tire_pressure': { position: [1.8, 0.2, 0.8], label: 'Tire Valve', description: 'Valve stem on wheel', cameraPosition: [3, 0.5, 3] },

  // Transmission
  'transmission_fluid': { position: [0, 0.2, 0], label: 'Transmission', description: 'Center of vehicle underneath', cameraPosition: [0, 0, 4] },

  // Suspension
  'suspension': { position: [1.8, 0.4, 0.7], label: 'Suspension', description: 'Wheel wells', cameraPosition: [3, 1, 3] },

  // Lights
  'headlight': { position: [2.1, 0.4, 0.5], label: 'Headlight', description: 'Front of vehicle', cameraPosition: [4, 1, 2] },
  'taillight': { position: [-2.1, 0.4, 0.5], label: 'Taillight', description: 'Rear of vehicle', cameraPosition: [-4, 1, 2] },

  // Wipers
  'wiper_blades': { position: [0.8, 0.9, 0], label: 'Wipers', description: 'Base of windshield', cameraPosition: [2, 2, 0] },

  // Exhaust
  'exhaust': { position: [-2.0, 0.1, 0], label: 'Exhaust', description: 'Underneath at rear', cameraPosition: [-3, 0.5, 2] },
};

// Match guide title to repair location
function getRepairLocation(guideTitle: string): string | null {
  const title = guideTitle.toLowerCase();

  if (title.includes('oil change') || title.includes('oil filter')) return 'oil_change';
  if (title.includes('air filter')) return 'air_filter';
  if (title.includes('brake') && title.includes('front')) return 'brake_pads_front';
  if (title.includes('brake') && title.includes('rear')) return 'brake_pads_rear';
  if (title.includes('brake')) return 'brake_pads_front';
  if (title.includes('tire rotation')) return 'tire_rotation';
  if (title.includes('tire pressure')) return 'tire_pressure';
  if (title.includes('coolant') || title.includes('radiator')) return 'coolant';
  if (title.includes('spark plug')) return 'spark_plugs';
  if (title.includes('battery')) return 'battery';
  if (title.includes('transmission')) return 'transmission_fluid';
  if (title.includes('suspension') || title.includes('strut') || title.includes('shock')) return 'suspension';
  if (title.includes('headlight')) return 'headlight';
  if (title.includes('taillight') || title.includes('tail light')) return 'taillight';
  if (title.includes('wiper')) return 'wiper_blades';
  if (title.includes('exhaust') || title.includes('muffler')) return 'exhaust';
  if (title.includes('brake fluid')) return 'brake_fluid';

  return null;
}

interface RepairVisualizerProps {
  guideTitle: string;
  bodyType?: 'sedan' | 'coupe' | 'truck' | 'suv' | 'hatchback';
  color?: string;
  className?: string;
  showLabel?: boolean;
}

// Pulsing indicator component
function PulsingIndicator({ position, label, description }: {
  position: [number, number, number];
  label: string;
  description: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Pulse animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      {/* Outer glow ring */}
      <mesh ref={meshRef}>
        <ringGeometry args={[0.12, 0.18, 32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner dot */}
      <mesh>
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial color="#dc2626" side={THREE.DoubleSide} />
      </mesh>

      {/* Connecting line going up */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
        <meshBasicMaterial color="#dc2626" />
      </mesh>

      {/* Label */}
      <Html
        position={[0, 0.7, 0]}
        center
        distanceFactor={8}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <div className={`
          px-3 py-2 rounded-lg shadow-lg transition-all duration-200 cursor-pointer
          ${hovered ? 'bg-red-600 scale-110' : 'bg-gray-900/90'}
        `}>
          <p className="text-white text-sm font-medium whitespace-nowrap">{label}</p>
          {hovered && (
            <p className="text-gray-300 text-xs mt-1 max-w-[200px]">{description}</p>
          )}
        </div>
      </Html>
    </group>
  );
}

// Simplified car body for repair visualization
function RepairCarModel({
  bodyType,
  color,
  repairLocation,
}: {
  bodyType: 'sedan' | 'coupe' | 'truck' | 'suv' | 'hatchback';
  color: string;
  repairLocation: typeof REPAIR_LOCATIONS[string] | null;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Calculate dimensions based on body type
  const dimensions = useMemo(() => {
    const base = {
      sedan: { length: 4.2, width: 1.6, height: 1.2, cabinHeight: 0.8 },
      coupe: { length: 4.0, width: 1.7, height: 1.1, cabinHeight: 0.7 },
      truck: { length: 5.0, width: 1.8, height: 1.4, cabinHeight: 0.9 },
      suv: { length: 4.5, width: 1.8, height: 1.6, cabinHeight: 1.0 },
      hatchback: { length: 3.8, width: 1.5, height: 1.3, cabinHeight: 0.9 },
    };
    return base[bodyType];
  }, [bodyType]);

  // Materials
  const bodyMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      metalness: 0.8,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.85, // Slightly transparent to show repair location
    });
  }, [color]);

  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#111',
      metalness: 0,
      roughness: 0,
      transmission: 0.9,
      transparent: true,
      opacity: 0.3,
    });
  }, []);

  const wheelMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1a1a1a',
      metalness: 0.5,
      roughness: 0.5,
    });
  }, []);

  const wheelRadius = 0.35;
  const wheelPositions: [number, number, number][] = [
    [dimensions.length * 0.35, wheelRadius, dimensions.width * 0.5],
    [dimensions.length * 0.35, wheelRadius, -dimensions.width * 0.5],
    [-dimensions.length * 0.3, wheelRadius, dimensions.width * 0.5],
    [-dimensions.length * 0.3, wheelRadius, -dimensions.width * 0.5],
  ];

  return (
    <group ref={groupRef} position={[0, 0.4, 0]}>
      {/* Main body */}
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[dimensions.length, dimensions.height * 0.4, dimensions.width]} />
        <primitive object={bodyMaterial} />
      </mesh>

      {/* Cabin */}
      <mesh castShadow position={[dimensions.length * 0.05, dimensions.height * 0.5, 0]}>
        <boxGeometry args={[dimensions.length * 0.55, dimensions.cabinHeight, dimensions.width * 0.9]} />
        <primitive object={bodyMaterial} />
      </mesh>

      {/* Windshield */}
      <mesh position={[dimensions.length * 0.28, dimensions.height * 0.55, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[dimensions.length * 0.15, dimensions.cabinHeight * 0.8, dimensions.width * 0.85]} />
        <primitive object={glassMaterial} />
      </mesh>

      {/* Wheels */}
      {wheelPositions.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[wheelRadius, wheelRadius, 0.2, 32]} />
          <primitive object={wheelMaterial} />
        </mesh>
      ))}

      {/* Repair location indicator */}
      {repairLocation && (
        <PulsingIndicator
          position={repairLocation.position}
          label={repairLocation.label}
          description={repairLocation.description}
        />
      )}
    </group>
  );
}

function LoadingPlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[2, 0.5, 1]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
}

export function RepairVisualizer({
  guideTitle,
  bodyType = 'sedan',
  color = '#374151',
  className = '',
  showLabel = true,
}: RepairVisualizerProps) {
  const locationKey = getRepairLocation(guideTitle);
  const repairLocation = locationKey ? REPAIR_LOCATIONS[locationKey] : null;
  const [isVisible, setIsVisible] = useState(false);

  // Fade in effect
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Don't render if no matching repair location found
  if (!repairLocation) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <div className="absolute top-4 left-4 z-10 bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2">
          <p className="text-white text-sm font-medium">Repair Location</p>
          <p className="text-gray-400 text-xs">{repairLocation.label}</p>
        </div>
      )}

      <div className={`
        w-full aspect-[16/9] bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl overflow-hidden
        transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}>
        <Canvas
          camera={{
            position: repairLocation.cameraPosition || [4, 2, 4],
            fov: 45
          }}
          shadows
          dpr={[1, 2]}
        >
          <Suspense fallback={<LoadingPlaceholder />}>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <spotLight
              position={[10, 10, 5]}
              angle={0.15}
              penumbra={1}
              intensity={1}
              castShadow
            />
            <spotLight
              position={[-10, 10, -5]}
              angle={0.15}
              penumbra={1}
              intensity={0.5}
            />

            {/* Car with repair indicator */}
            <PresentationControls
              global
              rotation={[0.1, 0.3, 0]}
              polar={[-Math.PI / 4, Math.PI / 4]}
              azimuth={[-Math.PI / 2, Math.PI / 2]}
            >
              <RepairCarModel
                bodyType={bodyType}
                color={color}
                repairLocation={repairLocation}
              />
            </PresentationControls>

            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>

            <Environment preset="city" />
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={3}
              maxDistance={10}
              maxPolarAngle={Math.PI / 2}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Description below */}
      <div className="mt-3 px-1">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{repairLocation.label}:</span>{' '}
          {repairLocation.description}
        </p>
      </div>
    </div>
  );
}

export default RepairVisualizer;
