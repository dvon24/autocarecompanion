'use client';

/**
 * AnimatedBackground - Static automotive-themed background
 *
 * Lightweight static background with subtle automotive shapes.
 * No animations to ensure smooth performance on all devices.
 */

export function AnimatedBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Subtle gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />

      {/* Static decorative shapes */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03]"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Gear shape - top left */}
        <g transform="translate(100, 150)">
          <circle cx="0" cy="0" r="60" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-900" />
          <circle cx="0" cy="0" r="20" fill="currentColor" className="text-gray-900" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <rect
              key={angle}
              x="-6"
              y="-75"
              width="12"
              height="20"
              fill="currentColor"
              className="text-gray-900"
              transform={`rotate(${angle})`}
            />
          ))}
        </g>

        {/* Piston shape - right side */}
        <g transform="translate(850, 400)">
          <rect x="-30" y="-50" width="60" height="80" rx="4" fill="currentColor" className="text-gray-900" />
          <rect x="-8" y="30" width="16" height="60" fill="currentColor" className="text-gray-900" />
          <circle cx="0" cy="90" r="12" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-900" />
        </g>

        {/* Rotor shape - bottom left */}
        <g transform="translate(200, 800)">
          <circle cx="0" cy="0" r="70" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-900" />
          <circle cx="0" cy="0" r="25" fill="currentColor" className="text-gray-900" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <rect
              key={angle}
              x="-2"
              y="-65"
              width="4"
              height="35"
              fill="currentColor"
              className="text-gray-900"
              transform={`rotate(${angle})`}
            />
          ))}
        </g>

        {/* Engine block - center right */}
        <g transform="translate(750, 700)">
          <rect x="-40" y="-60" width="80" height="100" rx="4" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-900" />
          <rect x="-30" y="-50" width="25" height="25" rx="2" fill="currentColor" className="text-gray-900" />
          <rect x="5" y="-50" width="25" height="25" rx="2" fill="currentColor" className="text-gray-900" />
          <rect x="-30" y="-15" width="25" height="25" rx="2" fill="currentColor" className="text-gray-900" />
          <rect x="5" y="-15" width="25" height="25" rx="2" fill="currentColor" className="text-gray-900" />
        </g>

        {/* Small gear - top right */}
        <g transform="translate(900, 100)">
          <circle cx="0" cy="0" r="35" fill="none" stroke="currentColor" strokeWidth="5" className="text-gray-900" />
          <circle cx="0" cy="0" r="12" fill="currentColor" className="text-gray-900" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <rect
              key={angle}
              x="-4"
              y="-45"
              width="8"
              height="14"
              fill="currentColor"
              className="text-gray-900"
              transform={`rotate(${angle})`}
            />
          ))}
        </g>

        {/* Spark plug - bottom center */}
        <g transform="translate(500, 900)">
          <rect x="-12" y="-40" width="24" height="50" rx="3" fill="currentColor" className="text-gray-900" />
          <rect x="-8" y="10" width="16" height="30" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-900" />
          <path d="M-4 45 L0 55 L4 45" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-900" />
        </g>
      </svg>
    </div>
  );
}
