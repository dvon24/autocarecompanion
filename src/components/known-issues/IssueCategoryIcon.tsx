import type { ReactNode } from 'react';
import type { IssueCategory } from '@/schemas/knownIssue.schema';

interface IconProps {
  className?: string;
}

function IconFrame({
  className = 'h-5 w-5',
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        {children}
      </g>
    </svg>
  );
}

/**
 * Restrained, monochrome symbols for Known Issues navigation and category
 * headers. They replace colorful emoji so every icon shares the same visual
 * language as the severity/caution symbols.
 */
export function IssueCategoryIcon({
  category,
  className,
}: IconProps & { category: IssueCategory }) {
  switch (category) {
    case 'engine':
      return (
        <IconFrame className={className}>
          <circle cx="12" cy="12" r="3.25" />
          <path d="M12 2.75v2.1M12 19.15v2.1M2.75 12h2.1M19.15 12h2.1M5.46 5.46l1.49 1.49M17.05 17.05l1.49 1.49M18.54 5.46l-1.49 1.49M6.95 17.05l-1.49 1.49" />
        </IconFrame>
      );
    case 'transmission':
      return (
        <IconFrame className={className}>
          <path d="M4 7h13m0 0-3-3m3 3-3 3M20 17H7m0 0 3 3m-3-3 3-3" />
        </IconFrame>
      );
    case 'drivetrain':
      return (
        <IconFrame className={className}>
          <circle cx="5" cy="12" r="2.25" />
          <circle cx="19" cy="12" r="2.25" />
          <path d="M7.25 12h3l1.75-3 1.75 6 1.75-3h1.25" />
        </IconFrame>
      );
    case 'electrical':
      return (
        <IconFrame className={className}>
          <path d="m13.5 2.75-7 10h5l-1 8.5 7-11h-5l1-7.5Z" />
        </IconFrame>
      );
    case 'brakes':
      return (
        <IconFrame className={className}>
          <circle cx="12" cy="12" r="8.25" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.75v2M20.25 12h-2M12 20.25v-2M3.75 12h2" />
        </IconFrame>
      );
    case 'suspension':
      return (
        <IconFrame className={className}>
          <path d="M8 3v3l8 2-8 3 8 3-8 3v4M5 3h6M5 21h6" />
        </IconFrame>
      );
    case 'cooling':
      return (
        <IconFrame className={className}>
          <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.8 5.2 12 7.4l2.2-2.2M9.8 18.8l2.2-2.2 2.2 2.2" />
        </IconFrame>
      );
    case 'fuel':
      return (
        <IconFrame className={className}>
          <path d="M5 21V5.5A2.5 2.5 0 0 1 7.5 3h6A2.5 2.5 0 0 1 16 5.5V21M4 21h13M8 7h5M16 8h1.5l2 2.5V17a1.5 1.5 0 0 1-3 0v-3" />
        </IconFrame>
      );
    case 'interior':
      return (
        <IconFrame className={className}>
          <path d="M8 3v8.5a3 3 0 0 0 3 3h6M6 21v-5.5M18 21v-6.5M8 9h6a3 3 0 0 1 3 3v2.5" />
        </IconFrame>
      );
    case 'exterior':
      return (
        <IconFrame className={className}>
          <path d="m4 14 1.7-5.1A3 3 0 0 1 8.55 7h6.9a3 3 0 0 1 2.85 1.9L20 14M3 14h18v4H3zM6 18v2M18 18v2M7 14h.01M17 14h.01" />
        </IconFrame>
      );
    case 'body':
      return (
        <IconFrame className={className}>
          <path d="M4 6.5h16v11H4zM8 6.5V4h8v2.5M8 17.5V20M16 17.5V20M4 11h16" />
        </IconFrame>
      );
    case 'safety':
      return (
        <IconFrame className={className}>
          <path d="M12 3 5 6v5c0 4.4 2.75 7.8 7 10 4.25-2.2 7-5.6 7-10V6l-7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </IconFrame>
      );
    case 'exhaust':
      return (
        <IconFrame className={className}>
          <path d="M3 14h8l2-3h3M16 8c1.5 0 1.5 2 3 2s1.5-2 3-2M16 13c1.5 0 1.5 2 3 2s1.5-2 3-2M5 14v4M9 14v4" />
        </IconFrame>
      );
    case 'steering':
      return (
        <IconFrame className={className}>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="2.25" />
          <path d="M4 10h16M12 14.25V20" />
        </IconFrame>
      );
    case 'hvac':
      return (
        <IconFrame className={className}>
          <circle cx="12" cy="12" r="2" />
          <path d="M12 10c-1-4.5 1-7 3.5-6.5 2.2.5 2.4 3.6.5 5.5-1.1 1.1-2.5 1.2-4 1ZM14 12c4.5-1 7 1 6.5 3.5-.5 2.2-3.6 2.4-5.5.5-1.1-1.1-1.2-2.5-1-4ZM12 14c1 4.5-1 7-3.5 6.5-2.2-.5-2.4-3.6-.5-5.5 1.1-1.1 2.5-1.2 4-1ZM10 12c-4.5 1-7-1-6.5-3.5C4 6.3 7.1 6.1 9 8c1.1 1.1 1.2 2.5 1 4Z" />
        </IconFrame>
      );
    case 'emissions':
      return (
        <IconFrame className={className}>
          <path d="M19.5 4.5C12 4.5 6 7.5 6 13c0 3.5 2.5 6 6 6 5.5 0 7.5-6 7.5-14.5Z" />
          <path d="M4 21c2.5-6 6.5-9.5 12-12" />
        </IconFrame>
      );
    case 'other':
    default:
      return (
        <IconFrame className={className}>
          <path d="M7 4h10a2 2 0 0 1 2 2v15H5V6a2 2 0 0 1 2-2Z" />
          <path d="M9 4V2.75h6V4M8.5 9h7M8.5 13h7M8.5 17h4" />
        </IconFrame>
      );
  }
}

export function RecallIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M12 3.5 2.75 20h18.5L12 3.5Z" />
      <path d="M12 9v4.5M12 17h.01" />
    </IconFrame>
  );
}

export function FaqIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.8 9a2.35 2.35 0 1 1 3.7 1.92c-.95.67-1.5 1.15-1.5 2.33M12 17h.01" />
    </IconFrame>
  );
}
