'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useVehicleContext } from '@/contexts/AppContext';
import { KnownIssue } from '@/schemas/knownIssue.schema';

interface VehicleChatLinkProps {
  /** Fallback make from the article slug */
  make: string;
  /** Fallback model from the article slug */
  model: string;
  /** Known issues to pass through to symptom chat via sessionStorage */
  issues?: KnownIssue[];
  className?: string;
  children: React.ReactNode;
}

/**
 * Builds a symptom chat link using the user's full YMMT from AppContext.
 * Stores known issues in sessionStorage so symptom chat can reference them
 * (same mechanism as the KnownIssuesBriefing in the Get Started flow).
 */
export function VehicleChatLink({ make, model, issues, className, children }: VehicleChatLinkProps) {
  const router = useRouter();
  const { selectedVehicle } = useVehicleContext();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    // Store known issues in sessionStorage for symptom chat to reference
    if (issues && issues.length > 0) {
      sessionStorage.setItem('acknowledgedKnownIssues', JSON.stringify(issues));
    }

    // Only use AppContext vehicle if it matches this article's make/model
    // Otherwise pass the article's make/model and let chat ask for year/trim
    const vehicleMatchesArticle = selectedVehicle &&
      selectedVehicle.make.toLowerCase() === make.toLowerCase() &&
      selectedVehicle.model.toLowerCase() === model.toLowerCase();

    let href: string;
    if (vehicleMatchesArticle) {
      href = `/symptom-chat?year=${selectedVehicle.year}&make=${encodeURIComponent(selectedVehicle.make)}&model=${encodeURIComponent(selectedVehicle.model)}&trim=${encodeURIComponent(selectedVehicle.trim)}`;
    } else {
      href = `/symptom-chat?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
    }

    router.push(href);
  }, [selectedVehicle, make, model, issues, router]);

  return (
    <a href="#" onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
