'use client';

/**
 * AnimatedBackground - Static automotive-themed background
 *
 * Floating automotive parts and tools scattered across the background.
 * Static (no animation) to ensure smooth performance on mobile devices.
 * All coordinates are pre-calculated to avoid hydration mismatches.
 */

// Pre-calculated positions for brake rotor bolt holes (5 points at 72° intervals, radius 22)
const rotorBolts = [
  { cx: 22, cy: 0 },
  { cx: 6.8, cy: 20.9 },
  { cx: -17.8, cy: 12.9 },
  { cx: -17.8, cy: -12.9 },
  { cx: 6.8, cy: -20.9 },
];

// Pre-calculated positions for brake rotor cooling lines (12 points at 30° intervals)
const rotorLines = [
  { x1: 35, y1: 0, x2: 75, y2: 0 },
  { x1: 30.3, y1: 17.5, x2: 65, y2: 37.5 },
  { x1: 17.5, y1: 30.3, x2: 37.5, y2: 65 },
  { x1: 0, y1: 35, x2: 0, y2: 75 },
  { x1: -17.5, y1: 30.3, x2: -37.5, y2: 65 },
  { x1: -30.3, y1: 17.5, x2: -65, y2: 37.5 },
  { x1: -35, y1: 0, x2: -75, y2: 0 },
  { x1: -30.3, y1: -17.5, x2: -65, y2: -37.5 },
  { x1: -17.5, y1: -30.3, x2: -37.5, y2: -65 },
  { x1: 0, y1: -35, x2: 0, y2: -75 },
  { x1: 17.5, y1: -30.3, x2: 37.5, y2: -65 },
  { x1: 30.3, y1: -17.5, x2: 65, y2: -37.5 },
];

// Pre-calculated positions for wheel lug nuts (5 points at 72° intervals, radius 25)
const wheelLugs = [
  { cx: 25, cy: 0, angle: 0 },
  { cx: 7.7, cy: 23.8, angle: 72 },
  { cx: -20.2, cy: 14.7, angle: 144 },
  { cx: -20.2, cy: -14.7, angle: 216 },
  { cx: 7.7, cy: -23.8, angle: 288 },
];

export function AnimatedBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Subtle gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />

      {/* Static floating parts - increased opacity for visibility */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.08]"
        viewBox="0 0 1200 1200"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Large gear - top left */}
        <g transform="translate(80, 120) rotate(15)">
          <circle cx="0" cy="0" r="70" fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-800" />
          <circle cx="0" cy="0" r="25" fill="currentColor" className="text-gray-800" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <rect
              key={angle}
              x="-8"
              y="-88"
              width="16"
              height="24"
              fill="currentColor"
              className="text-gray-800"
              transform={`rotate(${angle})`}
            />
          ))}
        </g>

        {/* Wrench - top center */}
        <g transform="translate(500, 80) rotate(-20)">
          <rect x="-8" y="-60" width="16" height="120" rx="3" fill="currentColor" className="text-gray-700" />
          <circle cx="0" cy="-75" r="25" fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-700" />
          <rect x="-15" y="55" width="30" height="35" rx="4" fill="currentColor" className="text-gray-700" />
        </g>

        {/* Oil filter - top right */}
        <g transform="translate(1050, 150)">
          <rect x="-25" y="-45" width="50" height="90" rx="10" fill="currentColor" className="text-gray-700" />
          <rect x="-30" y="-50" width="60" height="15" rx="3" fill="currentColor" className="text-gray-600" />
          <rect x="-30" y="35" width="60" height="15" rx="3" fill="currentColor" className="text-gray-600" />
          <ellipse cx="0" cy="0" rx="15" ry="25" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-500" />
        </g>

        {/* Piston - left side */}
        <g transform="translate(100, 500) rotate(10)">
          <rect x="-35" y="-55" width="70" height="90" rx="6" fill="currentColor" className="text-gray-700" />
          <rect x="-10" y="35" width="20" height="70" fill="currentColor" className="text-gray-700" />
          <circle cx="0" cy="105" r="15" fill="none" stroke="currentColor" strokeWidth="5" className="text-gray-700" />
          <line x1="-30" y1="-30" x2="30" y2="-30" stroke="currentColor" strokeWidth="3" className="text-gray-500" />
          <line x1="-30" y1="-10" x2="30" y2="-10" stroke="currentColor" strokeWidth="3" className="text-gray-500" />
          <line x1="-30" y1="10" x2="30" y2="10" stroke="currentColor" strokeWidth="3" className="text-gray-500" />
        </g>

        {/* Spark plug - center left */}
        <g transform="translate(250, 350) rotate(-15)">
          <rect x="-12" y="-45" width="24" height="55" rx="4" fill="currentColor" className="text-gray-700" />
          <polygon points="-18,-45 18,-45 12,-55 -12,-55" fill="currentColor" className="text-gray-600" />
          <rect x="-8" y="10" width="16" height="35" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-700" />
          <path d="M-5 50 L0 65 L5 50" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-700" />
        </g>

        {/* Small gear - center */}
        <g transform="translate(600, 400) rotate(25)">
          <circle cx="0" cy="0" r="40" fill="none" stroke="currentColor" strokeWidth="7" className="text-gray-700" />
          <circle cx="0" cy="0" r="15" fill="currentColor" className="text-gray-700" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <rect
              key={angle}
              x="-5"
              y="-52"
              width="10"
              height="16"
              fill="currentColor"
              className="text-gray-700"
              transform={`rotate(${angle})`}
            />
          ))}
        </g>

        {/* Brake rotor - right side (using pre-calculated positions) */}
        <g transform="translate(1000, 500)">
          <circle cx="0" cy="0" r="80" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-700" />
          <circle cx="0" cy="0" r="55" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-600" />
          <circle cx="0" cy="0" r="30" fill="currentColor" className="text-gray-700" />
          {rotorBolts.map((bolt, i) => (
            <circle
              key={i}
              cx={bolt.cx}
              cy={bolt.cy}
              r="5"
              fill="currentColor"
              className="text-gray-500"
            />
          ))}
          {rotorLines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-500"
            />
          ))}
        </g>

        {/* Oil can - bottom left */}
        <g transform="translate(150, 900) rotate(5)">
          <ellipse cx="0" cy="0" rx="40" ry="55" fill="currentColor" className="text-gray-700" />
          <rect x="-15" y="-80" width="30" height="30" rx="3" fill="currentColor" className="text-gray-700" />
          <rect x="-8" y="-110" width="16" height="35" fill="currentColor" className="text-gray-600" />
          <rect x="-25" y="-25" width="50" height="6" fill="currentColor" className="text-gray-500" />
        </g>

        {/* Socket wrench - bottom center */}
        <g transform="translate(550, 1000) rotate(-10)">
          <rect x="-10" y="-80" width="20" height="160" rx="4" fill="currentColor" className="text-gray-700" />
          <rect x="-20" y="70" width="40" height="25" rx="5" fill="currentColor" className="text-gray-700" />
          <polygon points="-25,-80 25,-80 20,-95 -20,-95" fill="currentColor" className="text-gray-600" />
        </g>

        {/* Tire/wheel - bottom right (using pre-calculated positions) */}
        <g transform="translate(1000, 950)">
          <circle cx="0" cy="0" r="75" fill="none" stroke="currentColor" strokeWidth="25" className="text-gray-700" />
          <circle cx="0" cy="0" r="35" fill="currentColor" className="text-gray-600" />
          {wheelLugs.map((lug, i) => (
            <ellipse
              key={i}
              cx={lug.cx}
              cy={lug.cy}
              rx="8"
              ry="12"
              fill="currentColor"
              className="text-gray-500"
              transform={`rotate(${lug.angle})`}
            />
          ))}
        </g>

        {/* Medium gear - bottom center-left */}
        <g transform="translate(350, 800) rotate(-30)">
          <circle cx="0" cy="0" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-700" />
          <circle cx="0" cy="0" r="18" fill="currentColor" className="text-gray-700" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <rect
              key={angle}
              x="-6"
              y="-65"
              width="12"
              height="18"
              fill="currentColor"
              className="text-gray-700"
              transform={`rotate(${angle})`}
            />
          ))}
        </g>

        {/* Connecting rod - right center */}
        <g transform="translate(850, 700) rotate(20)">
          <rect x="-12" y="-70" width="24" height="140" rx="5" fill="currentColor" className="text-gray-700" />
          <circle cx="0" cy="-70" r="20" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-700" />
          <circle cx="0" cy="70" r="25" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-700" />
        </g>

        {/* Small bolt - scattered */}
        <g transform="translate(400, 200)">
          <polygon points="0,-15 13,-7.5 13,7.5 0,15 -13,7.5 -13,-7.5" fill="currentColor" className="text-gray-600" />
          <circle cx="0" cy="0" r="6" fill="currentColor" className="text-gray-500" />
        </g>

        <g transform="translate(750, 300)">
          <polygon points="0,-12 10,-6 10,6 0,12 -10,6 -10,-6" fill="currentColor" className="text-gray-600" />
          <circle cx="0" cy="0" r="5" fill="currentColor" className="text-gray-500" />
        </g>

        <g transform="translate(900, 850)">
          <polygon points="0,-15 13,-7.5 13,7.5 0,15 -13,7.5 -13,-7.5" fill="currentColor" className="text-gray-600" />
          <circle cx="0" cy="0" r="6" fill="currentColor" className="text-gray-500" />
        </g>
      </svg>
    </div>
  );
}
