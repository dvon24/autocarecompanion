'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Check if device is mobile/low-power
 */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return true; // SSR - assume mobile for safety

  // Check for touch device
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Check screen width
  const isSmallScreen = window.innerWidth < 768;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return hasTouch || isSmallScreen || prefersReducedMotion;
}

/**
 * AnimatedBackground - Engine-themed animated background
 *
 * Creates an elegant animation system with automotive/mechanical elements:
 * - Pistons (rectangular with connecting rod)
 * - Brake rotors (circles with slots)
 * - Gears (circles with teeth)
 * - Engine blocks (abstract rectangular shapes)
 *
 * All shapes are minimalist, geometric, and abstract.
 */

type ShapeType = 'piston' | 'rotor' | 'gear' | 'engineBlock' | 'sparkPlug';

type Shape = {
  id: number;
  type: ShapeType;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  speed: number;
  depth: number;
  phase: number;
  rotationSpeed: number;
};

type MousePosition = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
};

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<Shape[]>([]);
  const mouseRef = useRef<MousePosition>({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(true); // Default to mobile (no animation) until checked

  // Check for mobile on mount
  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  // Don't render anything on mobile - improves performance significantly
  if (isMobile) {
    return null;
  }

  // Initialize shapes
  const initShapes = useCallback((width: number, height: number) => {
    const shapes: Shape[] = [];
    const shapeTypes: ShapeType[] = ['piston', 'rotor', 'gear', 'engineBlock', 'sparkPlug'];

    // Create 15-20 shapes distributed across the canvas
    const shapeCount = Math.max(15, Math.floor((width * height) / 80000));

    for (let i = 0; i < shapeCount; i++) {
      const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
      shapes.push({
        id: i,
        type,
        x: 0.05 + Math.random() * 0.9, // Keep away from edges
        y: 0.05 + Math.random() * 0.9,
        size: type === 'engineBlock' ? 60 + Math.random() * 40 : 30 + Math.random() * 50,
        rotation: Math.random() * Math.PI * 2,
        opacity: 0.25 + Math.random() * 0.15, // Much more visible: 25-40% opacity
        speed: 0.00008 + Math.random() * 0.00012, // Much slower for smooth motion
        depth: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.0002, // Slower rotation
      });
    }

    shapesRef.current = shapes;
  }, []);

  // Draw piston shape
  const drawPiston = (ctx: CanvasRenderingContext2D, size: number) => {
    const headWidth = size * 0.6;
    const headHeight = size * 0.3;
    const rodWidth = size * 0.15;
    const rodHeight = size * 0.5;

    // Piston head (rounded rectangle)
    ctx.beginPath();
    ctx.roundRect(-headWidth / 2, -headHeight - rodHeight / 2, headWidth, headHeight, 4);
    ctx.stroke();

    // Connecting rod
    ctx.beginPath();
    ctx.rect(-rodWidth / 2, -rodHeight / 2, rodWidth, rodHeight);
    ctx.stroke();

    // Wrist pin circles
    ctx.beginPath();
    ctx.arc(0, -headHeight / 2 - rodHeight / 2, size * 0.08, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, rodHeight / 2, size * 0.1, 0, Math.PI * 2);
    ctx.stroke();
  };

  // Draw brake rotor shape
  const drawRotor = (ctx: CanvasRenderingContext2D, size: number) => {
    const outerRadius = size / 2;
    const innerRadius = size * 0.25;
    const slotCount = 6;

    // Outer circle
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Ventilation slots
    for (let i = 0; i < slotCount; i++) {
      const angle = (i / slotCount) * Math.PI * 2;
      const startR = innerRadius + (outerRadius - innerRadius) * 0.2;
      const endR = outerRadius * 0.85;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * startR, Math.sin(angle) * startR);
      ctx.lineTo(Math.cos(angle) * endR, Math.sin(angle) * endR);
      ctx.stroke();
    }

    // Center hub holes
    const holeCount = 5;
    const holeRadius = size * 0.04;
    const holeDistance = innerRadius * 0.6;
    for (let i = 0; i < holeCount; i++) {
      const angle = (i / holeCount) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * holeDistance, Math.sin(angle) * holeDistance, holeRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  // Draw gear shape
  const drawGear = (ctx: CanvasRenderingContext2D, size: number) => {
    const outerRadius = size / 2;
    const innerRadius = size * 0.35;
    const teethCount = 12;
    const toothDepth = size * 0.12;

    // Draw gear teeth
    ctx.beginPath();
    for (let i = 0; i < teethCount; i++) {
      const angle1 = (i / teethCount) * Math.PI * 2;
      const angle2 = ((i + 0.3) / teethCount) * Math.PI * 2;
      const angle3 = ((i + 0.5) / teethCount) * Math.PI * 2;
      const angle4 = ((i + 0.8) / teethCount) * Math.PI * 2;

      if (i === 0) {
        ctx.moveTo(Math.cos(angle1) * (outerRadius - toothDepth), Math.sin(angle1) * (outerRadius - toothDepth));
      }
      ctx.lineTo(Math.cos(angle2) * outerRadius, Math.sin(angle2) * outerRadius);
      ctx.lineTo(Math.cos(angle3) * outerRadius, Math.sin(angle3) * outerRadius);
      ctx.lineTo(Math.cos(angle4) * (outerRadius - toothDepth), Math.sin(angle4) * (outerRadius - toothDepth));
    }
    ctx.closePath();
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Center hole
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2);
    ctx.stroke();
  };

  // Draw engine block shape (abstract)
  const drawEngineBlock = (ctx: CanvasRenderingContext2D, size: number) => {
    const width = size * 0.8;
    const height = size * 0.6;

    // Main block
    ctx.beginPath();
    ctx.roundRect(-width / 2, -height / 2, width, height, 3);
    ctx.stroke();

    // Cylinder bores (circles on top)
    const cylinderCount = 4;
    const cylinderRadius = width / (cylinderCount * 2.5);
    const cylinderY = -height / 2 - cylinderRadius * 0.3;
    for (let i = 0; i < cylinderCount; i++) {
      const x = -width / 2 + (width / cylinderCount) * (i + 0.5);
      ctx.beginPath();
      ctx.arc(x, cylinderY, cylinderRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Bolt holes in corners
    const boltOffset = 6;
    const boltRadius = 2;
    const corners = [
      [-width / 2 + boltOffset, -height / 2 + boltOffset],
      [width / 2 - boltOffset, -height / 2 + boltOffset],
      [-width / 2 + boltOffset, height / 2 - boltOffset],
      [width / 2 - boltOffset, height / 2 - boltOffset],
    ];
    corners.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, boltRadius, 0, Math.PI * 2);
      ctx.stroke();
    });
  };

  // Draw spark plug shape
  const drawSparkPlug = (ctx: CanvasRenderingContext2D, size: number) => {
    const bodyHeight = size * 0.5;
    const bodyWidth = size * 0.2;
    const hexHeight = size * 0.15;
    const hexWidth = size * 0.3;
    const electrodeLength = size * 0.25;

    // Ceramic body (rectangle)
    ctx.beginPath();
    ctx.rect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);
    ctx.stroke();

    // Hex nut (hexagon shape simplified as rectangle)
    ctx.beginPath();
    ctx.rect(-hexWidth / 2, -bodyHeight / 2 - hexHeight, hexWidth, hexHeight);
    ctx.stroke();

    // Terminal on top
    ctx.beginPath();
    ctx.moveTo(0, -bodyHeight / 2 - hexHeight);
    ctx.lineTo(0, -bodyHeight / 2 - hexHeight - size * 0.15);
    ctx.stroke();

    // Electrode at bottom
    ctx.beginPath();
    ctx.moveTo(0, bodyHeight / 2);
    ctx.lineTo(0, bodyHeight / 2 + electrodeLength);
    ctx.stroke();

    // Ground electrode (L-shaped)
    ctx.beginPath();
    ctx.moveTo(-bodyWidth / 2, bodyHeight / 2 + electrodeLength * 0.5);
    ctx.lineTo(-bodyWidth / 2 - size * 0.1, bodyHeight / 2 + electrodeLength * 0.5);
    ctx.lineTo(-bodyWidth / 2 - size * 0.1, bodyHeight / 2 + electrodeLength);
    ctx.stroke();
  };

  // Draw a single shape
  const drawShape = useCallback((
    ctx: CanvasRenderingContext2D,
    shape: Shape,
    width: number,
    height: number,
    time: number,
    mouse: MousePosition
  ) => {
    const { type, x, y, size, rotation, opacity, depth, phase, speed, rotationSpeed } = shape;

    // Calculate position with very gentle idle drift (slower, smoother motion)
    const driftX = Math.sin(time * speed * 0.5 + phase) * 15;
    const driftY = Math.cos(time * speed * 0.4 + phase * 1.3) * 12;

    // Mouse parallax effect (gentler)
    const parallaxStrength = depth * 25;
    const mouseOffsetX = (mouse.x - 0.5) * parallaxStrength;
    const mouseOffsetY = (mouse.y - 0.5) * parallaxStrength;

    const posX = x * width + driftX + mouseOffsetX;
    const posY = y * height + driftY + mouseOffsetY;

    // Very slow continuous rotation for gears and rotors
    let currentRotation = rotation + time * rotationSpeed * 0.5;
    if (type === 'gear' || type === 'rotor') {
      currentRotation += time * 0.00008; // Very slow continuous spin
    }

    // Subtle pulsing opacity (gentler)
    const pulseOpacity = opacity * (0.92 + Math.sin(time * 0.0003 + phase) * 0.08);

    ctx.save();
    ctx.translate(posX, posY);
    ctx.rotate(currentRotation);
    ctx.globalAlpha = pulseOpacity;

    // Blue/gray color palette
    ctx.strokeStyle = 'rgba(100, 130, 170, 1)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (type) {
      case 'piston':
        drawPiston(ctx, size);
        break;
      case 'rotor':
        drawRotor(ctx, size);
        break;
      case 'gear':
        drawGear(ctx, size);
        break;
      case 'engineBlock':
        drawEngineBlock(ctx, size);
        break;
      case 'sparkPlug':
        drawSparkPlug(ctx, size);
        break;
    }

    ctx.restore();
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const time = performance.now();

    // Smooth mouse interpolation (gentler for less jitter)
    const mouse = mouseRef.current;
    mouse.x += (mouse.targetX - mouse.x) * 0.02;
    mouse.y += (mouse.targetY - mouse.y) * 0.02;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all shapes
    shapesRef.current.forEach((shape) => {
      drawShape(ctx, shape, width, height, time, mouse);
    });

    timeRef.current = time;
    frameRef.current = requestAnimationFrame(animate);
  }, [drawShape]);

  // Setup canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      initShapes(rect.width, rect.height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / window.innerWidth;
      mouseRef.current.targetY = e.clientY / window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    timeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, [animate, initShapes]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}
