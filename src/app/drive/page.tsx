import { DriveClient } from '@/components/drive/DriveClient';

export const metadata = {
  title: 'Drive',
  description: 'Voice-driven route planning from Au7o.',
};

export default function DrivePage() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  if (!mapboxToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md rounded-2xl bg-white border border-gray-200 p-8 text-center shadow">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Drive is offline</h1>
          <p className="text-sm text-gray-600">
            The Mapbox token isn&apos;t configured. Set <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> in your environment and redeploy.
          </p>
        </div>
      </div>
    );
  }

  return <DriveClient mapboxToken={mapboxToken} />;
}
