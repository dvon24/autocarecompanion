'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { WheelConfig, SuspensionConfig } from './CarViewer';

interface CarModelProps {
  bodyType: 'sedan' | 'coupe' | 'truck' | 'suv' | 'hatchback';
  color: string;
  wheelConfig?: WheelConfig;
  suspensionConfig?: SuspensionConfig;
}

// Default wheel config
const DEFAULT_WHEEL: WheelConfig = {
  diameter: 18,
  width: 8,
  offset: 35,
  style: 'sport',
  finish: '#2a2a2a',
};

/**
 * 3D Car Model Component
 *
 * Creates a procedural car mesh based on body type.
 * Uses simple geometry for performance (can be replaced with GLTF models later).
 */
export function CarModel({
  bodyType,
  color,
  wheelConfig = DEFAULT_WHEEL,
  suspensionConfig,
}: CarModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelRefs = useRef<THREE.Mesh[]>([]);

  // Animate wheels spinning
  useFrame((_, delta) => {
    wheelRefs.current.forEach((wheel) => {
      if (wheel) {
        wheel.rotation.x += delta * 2;
      }
    });
  });

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

  // Calculate wheel size and position
  const wheelSize = useMemo(() => {
    const radiusInches = wheelConfig.diameter / 2;
    const radiusMeters = radiusInches * 0.0254; // Convert to meters
    const widthMeters = wheelConfig.width * 0.0254;
    return { radius: radiusMeters, width: widthMeters };
  }, [wheelConfig]);

  // Suspension drop adjustment
  const suspensionDrop = suspensionConfig?.drop
    ? suspensionConfig.drop * 0.0254
    : 0;

  // Wheel positions
  const wheelPositions = useMemo(() => {
    const frontX = dimensions.length * 0.35;
    const rearX = -dimensions.length * 0.3;
    const y = wheelSize.radius - suspensionDrop;
    const z = dimensions.width * 0.5;

    return [
      { position: [frontX, y, z] as [number, number, number], name: 'FL' },
      { position: [frontX, y, -z] as [number, number, number], name: 'FR' },
      { position: [rearX, y, z] as [number, number, number], name: 'RL' },
      { position: [rearX, y, -z] as [number, number, number], name: 'RR' },
    ];
  }, [dimensions, wheelSize.radius, suspensionDrop]);

  // Car body material
  const bodyMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      metalness: 0.8,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    });
  }, [color]);

  // Glass material
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

  // Wheel material
  const wheelMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(wheelConfig.finish),
      metalness: 0.9,
      roughness: 0.3,
    });
  }, [wheelConfig.finish]);

  // Tire material
  const tireMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1a1a1a',
      metalness: 0,
      roughness: 0.9,
    });
  }, []);

  const baseY = wheelSize.radius + 0.1 - suspensionDrop;

  return (
    <group ref={groupRef} position={[0, baseY, 0]}>
      {/* Main body */}
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[dimensions.length, dimensions.height * 0.4, dimensions.width]} />
        <primitive object={bodyMaterial} />
      </mesh>

      {/* Cabin */}
      <mesh castShadow position={[dimensions.length * 0.05, dimensions.height * 0.5, 0]}>
        <boxGeometry
          args={[
            dimensions.length * 0.55,
            dimensions.cabinHeight,
            dimensions.width * 0.9,
          ]}
        />
        <primitive object={bodyMaterial} />
      </mesh>

      {/* Windshield */}
      <mesh position={[dimensions.length * 0.28, dimensions.height * 0.55, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[dimensions.length * 0.15, dimensions.cabinHeight * 0.8, dimensions.width * 0.85]} />
        <primitive object={glassMaterial} />
      </mesh>

      {/* Rear window */}
      <mesh position={[-dimensions.length * 0.22, dimensions.height * 0.55, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[dimensions.length * 0.12, dimensions.cabinHeight * 0.7, dimensions.width * 0.85]} />
        <primitive object={glassMaterial} />
      </mesh>

      {/* Wheels */}
      {wheelPositions.map(({ position, name }, index) => (
        <group key={name} position={position}>
          {/* Tire */}
          <mesh
            ref={(el) => {
              if (el) wheelRefs.current[index] = el;
            }}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <torusGeometry args={[wheelSize.radius, wheelSize.radius * 0.35, 16, 32]} />
            <primitive object={tireMaterial} />
          </mesh>

          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[wheelSize.radius * 0.7, wheelSize.radius * 0.7, wheelSize.width, 16]} />
            <primitive object={wheelMaterial} />
          </mesh>

          {/* Rim spokes (simple design) */}
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} rotation={[0, 0, (Math.PI * 2 * i) / 5 + Math.PI / 2]}>
              <boxGeometry args={[wheelSize.radius * 0.6, wheelSize.width * 0.5, 0.02]} />
              <primitive object={wheelMaterial} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Headlights */}
      <mesh position={[dimensions.length * 0.48, 0.2, dimensions.width * 0.35]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[dimensions.length * 0.48, 0.2, -dimensions.width * 0.35]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
      </mesh>

      {/* Taillights */}
      <mesh position={[-dimensions.length * 0.48, 0.2, dimensions.width * 0.35]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-dimensions.length * 0.48, 0.2, -dimensions.width * 0.35]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}
