'use client';

import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PresentationControls } from '@react-three/drei';
import { CarModel } from './CarModel';

export interface WheelConfig {
  diameter: number; // inches (16-22)
  width: number; // inches (7-12)
  offset: number; // mm (-20 to 50)
  style: string; // wheel style ID
  finish: string; // color/finish
}

export interface SuspensionConfig {
  drop: number; // inches (0-4 for lowered, -4 to 0 for lifted)
}

export interface CarViewerProps {
  bodyType?: 'sedan' | 'coupe' | 'truck' | 'suv' | 'hatchback';
  color?: string;
  wheelConfig?: WheelConfig;
  suspensionConfig?: SuspensionConfig;
  className?: string;
  interactive?: boolean;
}

/**
 * 3D Car Viewer Component
 *
 * Epic 5, Stories 5.6 & 5.7: 3D Visualization
 * Displays a 3D car model with customizable wheels and suspension.
 */
export function CarViewer({
  bodyType = 'sedan',
  color = '#1a1a1a',
  wheelConfig,
  suspensionConfig,
  className = '',
  interactive = true,
}: CarViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className={`w-full aspect-[16/9] bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl overflow-hidden ${className}`}>
      <Canvas
        ref={canvasRef}
        camera={{ position: [4, 1.5, 4], fov: 45 }}
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
            shadow-mapSize={[2048, 2048]}
          />
          <spotLight
            position={[-10, 10, -5]}
            angle={0.15}
            penumbra={1}
            intensity={0.5}
          />

          {/* Car Model */}
          {interactive ? (
            <PresentationControls
              global
              rotation={[0.1, 0.4, 0]}
              polar={[-Math.PI / 4, Math.PI / 4]}
              azimuth={[-Math.PI / 4, Math.PI / 4]}
            >
              <CarModel
                bodyType={bodyType}
                color={color}
                wheelConfig={wheelConfig}
                suspensionConfig={suspensionConfig}
              />
            </PresentationControls>
          ) : (
            <CarModel
              bodyType={bodyType}
              color={color}
              wheelConfig={wheelConfig}
              suspensionConfig={suspensionConfig}
            />
          )}

          {/* Ground shadow */}
          <ContactShadows
            position={[0, -0.5, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
          />

          {/* Environment for reflections */}
          <Environment preset="city" />

          {/* Camera controls */}
          {interactive && (
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={3}
              maxDistance={10}
              maxPolarAngle={Math.PI / 2.1}
              minPolarAngle={0.1}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

function LoadingPlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[2, 0.5, 4]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
}
