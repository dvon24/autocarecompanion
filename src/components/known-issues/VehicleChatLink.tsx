'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useVehicleContext } from '@/contexts/AppContext';
import { KnownIssue } from '@/schemas/knownIssue.schema';
import { vehicleSlug } from '@/lib/vehicle-slug';

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

    // Was routing to /symptom-chat (the legacy chat surface). Now goes
    // to the /vehicle/[slug] hub — the rich conversational surface that
    // has photo, video, known issues, and maintenance in one place.
    // Falls back to a current-year slug if we only have make+model.
    let href: string;
    if (vehicleMatchesArticle && selectedVehicle) {
      href = `/vehicle/${vehicleSlug(selectedVehicle.year, selectedVehicle.make, selectedVehicle.model, selectedVehicle.trim || null)}`;
    } else {
      href = `/vehicle/${vehicleSlug(new Date().getFullYear(), make, model)}`;
    }

    router.push(href);
  }, [selectedVehicle, make, model, issues, router]);

  return (
    <a href="#" onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
