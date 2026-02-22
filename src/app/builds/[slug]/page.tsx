'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ModList, ModSummary, ShareButton } from '@/components/showcase';

// Dynamic import for 3D viewer to avoid SSR issues
const CarViewer = dynamic(
  () => import('@/components/3d').then((mod) => mod.CarViewer),
  { ssr: false, loading: () => <div className="w-full h-[400px] bg-gray-900 rounded-xl animate-pulse" /> }
);

interface Modification {
  id: string;
  category: string;
  name: string;
  brand?: string | null;
  partNumber?: string | null;
  description?: string | null;
  cost?: number | null;
  installDate?: string | null;
  imageUrl?: string | null;
  modelData?: Record<string, unknown> | null;
}

interface Build {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  nickname?: string | null;
  color?: string | null;
  imageUrl?: string | null;
  showcaseSlug?: string | null;
  currentMileage?: number | null;
  user?: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
  modifications: Modification[];
}

export default function BuildDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [build, setBuild] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [show3D, setShow3D] = useState(true);

  useEffect(() => {
    fetchBuild();
  }, [resolvedParams.slug]);

  const fetchBuild = async () => {
    try {
      const response = await fetch(`/api/builds/${resolvedParams.slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Build not found');
        } else {
          setError('Failed to load build');
        }
        return;
      }
      const data = await response.json();
      setBuild(data.build);
    } catch (err) {
      console.error('Error fetching build:', err);
      setError('Failed to load build');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-[400px] bg-gray-200 rounded-xl" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !build) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Build not found'}
          </h1>
          <p className="text-gray-600 mb-6">
            This build may have been removed or made private.
          </p>
          <Link
            href="/builds"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Browse Builds
          </Link>
        </div>
      </div>
    );
  }

  const displayName = build.nickname || `${build.year} ${build.make} ${build.model}`;
  const totalInvested = build.modifications.reduce(
    (sum, mod) => sum + (mod.cost || 0),
    0
  );

  // Extract wheel config from modifications for 3D viewer
  const wheelMod = build.modifications.find((m) => m.category === 'wheels');
  const wheelConfig = wheelMod?.modelData as {
    diameter?: number;
    width?: number;
    offset?: number;
    color?: string;
    style?: string;
  } | undefined;

  // Determine body type for 3D model
  const getBodyType = () => {
    const modelLower = build.model.toLowerCase();
    if (modelLower.includes('truck') || modelLower.includes('f-150') || modelLower.includes('silverado')) {
      return 'truck';
    }
    if (modelLower.includes('suv') || modelLower.includes('explorer') || modelLower.includes('tahoe')) {
      return 'suv';
    }
    return 'sedan';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/builds"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Builds
            </Link>
            <ShareButton
              slug={build.showcaseSlug || build.id}
              title={displayName}
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 3D Viewer / Image Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-end gap-2 mb-2">
            <button
              onClick={() => setShow3D(true)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                show3D
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              3D View
            </button>
            {build.imageUrl && (
              <button
                onClick={() => setShow3D(false)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  !show3D
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Photo
              </button>
            )}
          </div>

          {show3D ? (
            <CarViewer
              bodyType={getBodyType()}
              color={build.color || '#1a1a1a'}
              wheelConfig={wheelConfig ? {
                diameter: wheelConfig.diameter || 18,
                width: wheelConfig.width || 8.5,
                offset: wheelConfig.offset || 35,
                style: wheelConfig.style || 'sport-5spoke',
                finish: wheelConfig.color || '#333333',
              } : undefined}
              className="rounded-xl overflow-hidden"
            />
          ) : (
            build.imageUrl && (
              <div className="relative h-[400px] bg-gray-900 rounded-xl overflow-hidden">
                <Image
                  src={build.imageUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              </div>
            )
          )}
        </div>

        {/* Build Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayName}</h1>
          {build.nickname && (
            <p className="text-lg text-gray-500">
              {build.year} {build.make} {build.model}
              {build.trim && ` ${build.trim}`}
            </p>
          )}

          {/* Owner */}
          {build.user && (
            <div className="flex items-center gap-3 mt-4">
              {build.user.image ? (
                <Image
                  src={build.user.image}
                  alt={build.user.name || 'Owner'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-medium">
                    {build.user.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {build.user.name || 'Anonymous'}
                </p>
                <p className="text-sm text-gray-500">Owner</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="mb-8">
          <ModSummary modifications={build.modifications} />
        </div>

        {/* Quick Stats */}
        {build.currentMileage && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
            <div className="flex items-center gap-2 text-gray-600">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span>Current Mileage:</span>
              <span className="font-semibold text-gray-900">
                {build.currentMileage.toLocaleString()} miles
              </span>
            </div>
          </div>
        )}

        {/* Modifications List */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Modifications</h2>
          <ModList modifications={build.modifications} showCosts />
        </div>

        {/* Total Investment */}
        {totalInvested > 0 && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 text-center">
            <p className="text-sm text-blue-600 font-medium mb-1">
              Total Investment
            </p>
            <p className="text-3xl font-bold text-blue-700">
              ${totalInvested.toLocaleString()}
            </p>
          </div>
        )}
      </main>

      {/* CTA */}
      <div className="bg-white border-t border-gray-200 py-8 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Want to showcase your build?
          </h3>
          <p className="text-gray-600 mb-4">
            Add your vehicle to the garage and share your modifications with the community.
          </p>
          <Link
            href="/garage"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to My Garage
          </Link>
        </div>
      </div>
    </div>
  );
}
