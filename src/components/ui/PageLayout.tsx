'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatedBackground } from './AnimatedBackground';
import { ScrollReveal } from './ScrollReveal';
// UserMenu replaced by the global FloatingAuthButton — see the comment
// inside the header below.
// import { UserMenu } from '@/components/auth/UserMenu';

/**
 * PageLayout - Shared layout with animated background
 *
 * Provides consistent styling across all pages:
 * - Animated engine-themed background
 * - Header with logo and navigation
 * - Optional footer
 * - Gradient fade for content sections
 */

type PageLayoutProps = {
  children: ReactNode;
  /** Show the animated background (default: true) */
  showBackground?: boolean;
  /** Show the header (default: true) */
  showHeader?: boolean;
  /** Show the footer (default: false) */
  showFooter?: boolean;
  /** Custom header content (replaces default) */
  headerContent?: ReactNode;
  /** Back link configuration */
  backLink?: {
    href: string;
    label: string;
  };
  /** Additional class for the main content area */
  contentClassName?: string;
  /** Whether to show gradient separator before content */
  showGradientSeparator?: boolean;
};

export function PageLayout({
  children,
  showBackground = true,
  showHeader = true,
  showFooter = false,
  headerContent,
  backLink,
  contentClassName = '',
  showGradientSeparator = false,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-white font-[system-ui,sans-serif] relative overflow-hidden">
      {/* Animated Engine Background */}
      {showBackground && <AnimatedBackground />}

      {/* Subtle gradient blobs for depth */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: 'translate(20%, -30%)',
          zIndex: 1,
        }}
      />
      <div
        className="absolute top-1/4 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: 'translate(-50%, 0%)',
          zIndex: 1,
        }}
      />

      {/* Main content */}
      <main className="relative flex flex-col min-h-screen" style={{ zIndex: 2 }}>
        {/* Header */}
        {showHeader && (
          <header className="px-6 py-4 border-b border-gray-100/50 backdrop-blur-sm bg-white/50 relative z-40">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              {headerContent || (
                <>
                  <ScrollReveal delay={0} duration={600} direction="down" distance={15}>
                    <Link href="/" className="flex items-center gap-2">
                      <Image
                        src="/og-image.png"
                        alt="Au7o mascot"
                        width={28}
                        height={28}
                        className="rounded-lg"
                      />
                      <span className="text-2xl font-bold text-gray-900 tracking-tight">
                        Au<span className="text-blue-600">7</span>o
                      </span>
                    </Link>
                  </ScrollReveal>
                  <ScrollReveal delay={100} duration={600} direction="down" distance={15}>
                    <div className="flex items-center gap-4">
                      {backLink && (
                        <Link
                          href={backLink.href}
                          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {backLink.label}
                        </Link>
                      )}
                      {/* UserMenu removed — the global FloatingAuthButton
                          in src/app/layout.tsx now sits in the top-right
                          next to the Translate widget on every page,
                          making this in-header duplicate redundant. Was
                          causing the "two avatars" visual bug on /account
                          and other PageLayout-wrapped pages. */}
                    </div>
                  </ScrollReveal>
                </>
              )}
            </div>
          </header>
        )}

        {/* Gradient separator if needed */}
        {showGradientSeparator && (
          <div
            className="relative h-24 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.8) 50%, white 100%)',
              zIndex: 3,
            }}
          />
        )}

        {/* Page content */}
        <div className={`flex-1 ${contentClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <footer className="px-6 py-8 border-t border-gray-200 bg-gray-50/80 backdrop-blur-sm relative" style={{ zIndex: 3 }}>
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/og-image.png"
                  alt="Au7o mascot"
                  width={24}
                  height={24}
                  className="rounded-lg"
                />
                <span className="text-xl font-semibold text-gray-900">
                  Au<span className="text-blue-600">7</span>o
                </span>
              </Link>
              <p className="text-gray-400 text-sm">
                Built for DIY mechanics. Privacy-first.
              </p>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}

/**
 * ContentCard - Card with subtle background for content sections
 */
type ContentCardProps = {
  children: ReactNode;
  className?: string;
};

export function ContentCard({ children, className = '' }: ContentCardProps) {
  return (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
