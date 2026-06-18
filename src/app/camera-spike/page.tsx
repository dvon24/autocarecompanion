import type { Metadata } from 'next';
import { CameraSpikeClient } from '@/components/diagnose/CameraSpikeClient';

// Internal spike — NOT indexed, not linked from anywhere. Proves the live
// on-device camera-guidance loop (the foundation of the Live AI Mechanic).
export const metadata: Metadata = {
  title: 'Camera Spike (internal)',
  robots: { index: false, follow: false },
};

export default function CameraSpikePage() {
  return <CameraSpikeClient />;
}
