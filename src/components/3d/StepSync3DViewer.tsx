'use client';

import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Html, PresentationControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Highlight area configurations
const HIGHLIGHT_AREAS: Record<string, {
  position: [number, number, number];
  label: string;
}> = {
  overview: { position: [0, 0.5, 0], label: 'Full Vehicle' },
  engine: { position: [1.5, 0.6, 0], label: 'Engine Bay' },
  underside: { position: [0, 0.1, 0], label: 'Underside' },
  oil_drain: { position: [1.5, 0.1, 0], label: 'Oil Drain Plug' },
  oil_filter: { position: [1.2, 0.5, 0.5], label: 'Oil Filter' },
  oil_cap: { position: [0.5, 0.9, 0], label: 'Oil Filler Cap' },
};

interface StepSync3DViewerProps {
  currentStep: number;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  highlightArea?: string;
  bodyType?: 'sedan' | 'coupe' | 'truck' | 'suv' | 'hatchback';
  color?: string;
  // Custom GLTF model support
  customModelPath?: string;
  customModelScale?: number;
  customModelPosition?: [number, number, number];
  customModelRotation?: [number, number, number];
  // Alternate model for specific views (e.g., hood open for engine work)
  alternateModelPath?: string;
  useAlternateModel?: boolean;
}

// Smooth camera controller
function CameraController({
  targetPosition,
  lookAtTarget,
}: {
  targetPosition: [number, number, number];
  lookAtTarget: [number, number, number];
}) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(...targetPosition));
  const currentLookAt = useRef(new THREE.Vector3(...lookAtTarget));

  useEffect(() => {
    currentPos.current.set(...targetPosition);
    currentLookAt.current.set(...lookAtTarget);
  }, [targetPosition, lookAtTarget]);

  useFrame(() => {
    // Smoothly interpolate camera position
    camera.position.lerp(currentPos.current, 0.05);

    // Update where camera looks
    const lookAtVec = new THREE.Vector3();
    lookAtVec.copy(camera.position);
    lookAtVec.lerp(currentLookAt.current, 0.05);
  });

  return null;
}

// Pulsing indicator for repair locations
function PulsingIndicator({ position, label }: {
  position: [number, number, number];
  label: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      meshRef.current.scale.setScalar(scale);
    }
    if (outerRingRef.current) {
      const scale = 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
      outerRingRef.current.scale.setScalar(scale);
      const material = outerRingRef.current.material as THREE.MeshBasicMaterial;
      if (material) {
        material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      }
    }
  });

  return (
    <group position={position}>
      {/* Outer expanding ring */}
      <mesh ref={outerRingRef}>
        <ringGeometry args={[0.15, 0.22, 32]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner pulsing ring */}
      <mesh ref={meshRef}>
        <ringGeometry args={[0.1, 0.15, 32]} />
        <meshBasicMaterial color="#2563eb" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>

      {/* Center dot */}
      <mesh>
        <circleGeometry args={[0.06, 32]} />
        <meshBasicMaterial color="#1d4ed8" side={THREE.DoubleSide} />
      </mesh>

      {/* Vertical line */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.5, 8]} />
        <meshBasicMaterial color="#2563eb" />
      </mesh>

      {/* Label */}
      <Html position={[0, 0.55, 0]} center distanceFactor={6}>
        <div className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-lg whitespace-nowrap">
          {label}
        </div>
      </Html>
    </group>
  );
}

// Car model component
function CarModel({
  bodyType,
  color,
  highlightArea,
}: {
  bodyType: 'sedan' | 'coupe' | 'truck' | 'suv' | 'hatchback';
  color: string;
  highlightArea?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);

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

  const bodyMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      metalness: 0.8,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: highlightArea && highlightArea !== 'overview' ? 0.7 : 0.95,
    });
  }, [color, highlightArea]);

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

  const engineMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#444',
      metalness: 0.3,
      roughness: 0.7,
    });
  }, []);

  const wheelRadius = 0.35;
  const wheelPositions: [number, number, number][] = [
    [dimensions.length * 0.35, wheelRadius, dimensions.width * 0.5],
    [dimensions.length * 0.35, wheelRadius, -dimensions.width * 0.5],
    [-dimensions.length * 0.3, wheelRadius, dimensions.width * 0.5],
    [-dimensions.length * 0.3, wheelRadius, -dimensions.width * 0.5],
  ];

  const highlightConfig = highlightArea ? HIGHLIGHT_AREAS[highlightArea] : null;

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

      {/* Engine block (visible when highlighting engine area) */}
      {(highlightArea === 'engine' || highlightArea === 'oil_cap' || highlightArea === 'oil_filter') && (
        <mesh position={[dimensions.length * 0.35, 0.35, 0]}>
          <boxGeometry args={[0.6, 0.3, 0.5]} />
          <primitive object={engineMaterial} />
        </mesh>
      )}

      {/* Oil pan (visible when highlighting underside) */}
      {(highlightArea === 'underside' || highlightArea === 'oil_drain') && (
        <mesh position={[dimensions.length * 0.3, 0.05, 0]}>
          <boxGeometry args={[0.5, 0.1, 0.4]} />
          <meshStandardMaterial color="#333" metalness={0.4} roughness={0.6} />
        </mesh>
      )}

      {/* Wheels */}
      {wheelPositions.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[wheelRadius, wheelRadius, 0.2, 32]} />
          <primitive object={wheelMaterial} />
        </mesh>
      ))}

      {/* Highlight indicator */}
      {highlightConfig && highlightArea !== 'overview' && (
        <PulsingIndicator
          position={highlightConfig.position}
          label={highlightConfig.label}
        />
      )}
    </group>
  );
}

// Custom GLTF model loader component
function CustomCarModel({
  modelPath,
  color,
  highlightArea,
  scale = 1,
  position = [0, 0, 0] as [number, number, number],
  rotation = [0, 0, 0] as [number, number, number],
}: {
  modelPath: string;
  color?: string;
  highlightArea?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef<THREE.Group>(null);

  // Clone the scene to avoid mutations - recreate when modelPath changes
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true); // Deep clone

    // Apply color override if provided
    if (color) {
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          // Check if it's likely a body panel (not glass, wheel, etc.)
          const materialName = (child.material as THREE.Material).name?.toLowerCase() || '';
          const meshName = child.name?.toLowerCase() || '';

          if (
            !materialName.includes('glass') &&
            !materialName.includes('window') &&
            !materialName.includes('wheel') &&
            !materialName.includes('tire') &&
            !meshName.includes('glass') &&
            !meshName.includes('window') &&
            !meshName.includes('wheel') &&
            !meshName.includes('tire')
          ) {
            // Clone material to avoid affecting original
            const newMaterial = (child.material as THREE.MeshStandardMaterial).clone();
            newMaterial.color = new THREE.Color(color);
            child.material = newMaterial;
          }
        }
      });
    }

    // Apply transparency when highlighting specific area
    if (highlightArea && highlightArea !== 'overview') {
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const newMaterial = (child.material as THREE.MeshStandardMaterial).clone();
          newMaterial.transparent = true;
          newMaterial.opacity = 0.7;
          child.material = newMaterial;
        }
      });
    }

    return clone;
  }, [scene, color, highlightArea, modelPath]);

  const highlightConfig = highlightArea ? HIGHLIGHT_AREAS[highlightArea] : null;

  return (
    <group ref={modelRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} key={modelPath} />

      {/* Highlight indicator */}
      {highlightConfig && highlightArea !== 'overview' && (
        <PulsingIndicator
          position={highlightConfig.position}
          label={highlightConfig.label}
        />
      )}
    </group>
  );
}

// Dual model renderer - renders both but shows only the active one
function DualCarModel({
  primaryPath,
  alternatePath,
  useAlternate,
  color,
  highlightArea,
  scale = 1,
  position = [0, 0, 0] as [number, number, number],
  rotation = [0, 0, 0] as [number, number, number],
}: {
  primaryPath: string;
  alternatePath?: string;
  useAlternate: boolean;
  color?: string;
  highlightArea?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group>
      {/* Primary model */}
      <group visible={!useAlternate}>
        <CustomCarModel
          modelPath={primaryPath}
          color={color}
          highlightArea={highlightArea}
          scale={scale}
          position={position}
          rotation={rotation}
        />
      </group>

      {/* Alternate model (e.g., hood open) */}
      {alternatePath && (
        <group visible={useAlternate}>
          <CustomCarModel
            modelPath={alternatePath}
            color={color}
            highlightArea={highlightArea}
            scale={scale}
            position={position}
            rotation={rotation}
          />
        </group>
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

export function StepSync3DViewer({
  currentStep,
  cameraPosition,
  cameraTarget,
  highlightArea,
  bodyType = 'sedan',
  color = '#374151',
  customModelPath,
  customModelScale = 1,
  customModelPosition = [0, 0, 0],
  customModelRotation = [0, 0, 0],
  alternateModelPath,
  useAlternateModel = false,
}: StepSync3DViewerProps) {
  const [modelError, setModelError] = useState(false);

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          position: cameraPosition,
          fov: 45,
        }}
        shadows
        dpr={[1, 2]}
        onError={() => setModelError(true)}
      >
        <Suspense fallback={<LoadingPlaceholder />}>

          {/* Smooth camera transitions */}
          <CameraController
            targetPosition={cameraPosition}
            lookAtTarget={cameraTarget}
          />

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
          <pointLight position={[0, 5, 0]} intensity={0.3} />

          {/* Car model - use custom GLTF if provided, otherwise use procedural */}
          <PresentationControls
            global
            rotation={[0.1, 0.2, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 2, Math.PI / 2]}
            snap
          >
            {customModelPath && !modelError ? (
              <DualCarModel
                primaryPath={customModelPath}
                alternatePath={alternateModelPath}
                useAlternate={useAlternateModel}
                color={color}
                highlightArea={highlightArea}
                scale={customModelScale}
                position={customModelPosition}
                rotation={customModelRotation}
              />
            ) : (
              <CarModel
                bodyType={bodyType}
                color={color}
                highlightArea={highlightArea}
              />
            )}
          </PresentationControls>

          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>

          {/* Grid for reference */}
          <gridHelper args={[20, 40, '#333', '#222']} position={[0, 0.01, 0]} />

          <Environment preset="city" />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={12}
            maxPolarAngle={Math.PI / 2}
            target={cameraTarget}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default StepSync3DViewer;
