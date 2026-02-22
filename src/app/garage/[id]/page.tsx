'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

/**
 * Redirects to the maintenance page
 * The vehicle detail functionality has been consolidated into the maintenance page
 */
export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;

  useEffect(() => {
    router.replace(`/garage/${vehicleId}/maintenance`);
  }, [router, vehicleId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Redirecting...</div>
    </div>
  );
}
