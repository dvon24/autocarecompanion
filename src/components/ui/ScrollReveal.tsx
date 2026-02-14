'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * ScrollReveal - Scroll-triggered animation wrapper
 *
 * Uses IntersectionObserver to trigger animations when elements
 * enter the viewport. Supports staggered timing and various effects.
 */

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';

type ScrollRevealProps = {
  children: ReactNode;
  /** Delay in ms before animation starts (use for staggering) */
  delay?: number;
  /** Duration of the animation in ms */
  duration?: number;
  /** Direction the element animates from */
  direction?: RevealDirection;
  /** Distance to travel during animation in pixels */
  distance?: number;
  /** Threshold for triggering (0-1) */
  threshold?: number;
  /** Additional className */
  className?: string;
  /** Whether to only animate once */
  once?: boolean;
};

export function ScrollReveal({
  children,
  delay = 0,
  duration = 600,
  direction = 'up',
  distance = 30,
  threshold = 0.1,
  className = '',
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, once]);

  // Calculate initial transform based on direction
  const getInitialTransform = (): string => {
    switch (direction) {
      case 'up':
        return `translateY(${distance}px)`;
      case 'down':
        return `translateY(-${distance}px)`;
      case 'left':
        return `translateX(${distance}px)`;
      case 'right':
        return `translateX(-${distance}px)`;
      case 'none':
        return 'none';
      default:
        return `translateY(${distance}px)`;
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate(0, 0)' : getInitialTransform(),
        transition: `opacity ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
        transitionDelay: `${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

/**
 * FeatureCard - Animated feature card with hover effects
 *
 * Designed for the three feature cards on the landing page.
 * Includes subtle hover interactions (lift, glow, tilt).
 */

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  /** Delay for staggered reveal (in ms) */
  delay?: number;
};

export function FeatureCard({ icon, title, description, href, delay = 0 }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  // Calculate subtle tilt based on mouse position
  const tiltX = isHovered ? (mousePos.y - 0.5) * -8 : 0;
  const tiltY = isHovered ? (mousePos.x - 0.5) * 8 : 0;

  return (
    <ScrollReveal delay={delay} direction="up" distance={40}>
      <a
        ref={cardRef}
        href={href}
        className="group block rounded-xl overflow-hidden border border-gray-200 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setMousePos({ x: 0.5, y: 0.5 });
        }}
        onMouseMove={handleMouseMove}
        style={{
          background: 'linear-gradient(to bottom, #f3f4f6 0%, #f3f4f6 40%, #ffffff 70%, #ffffff 100%)',
          transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${isHovered ? -8 : 0}px)`,
          boxShadow: isHovered
            ? '0 20px 40px -10px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.1)'
            : '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform, box-shadow',
        }}
      >
        {/* Glow effect on hover */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)`,
          }}
        />

        {/* Icon area */}
        <div className="h-40 flex items-center justify-center relative">
          <div
            style={{
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          >
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 relative">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-3">
            {description}
          </p>
          <span className="inline-flex items-center text-sm text-gray-600 font-medium group-hover:text-blue-600 transition-colors">
            Learn more
            <svg
              className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </a>
    </ScrollReveal>
  );
}
