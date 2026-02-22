'use client';

import Link from 'next/link';
import Image from 'next/image';

interface BuildCardProps {
  build: {
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
      name?: string | null;
      image?: string | null;
    };
    _count?: {
      modifications: number;
    };
    modifications?: Array<{
      cost?: number | null;
    }>;
  };
}

export function BuildCard({ build }: BuildCardProps) {
  const displayName = build.nickname || `${build.year} ${build.make} ${build.model}`;
  const slug = build.showcaseSlug || build.id;
  const modCount = build._count?.modifications ?? build.modifications?.length ?? 0;
  const totalInvested = build.modifications?.reduce(
    (sum, mod) => sum + (mod.cost || 0),
    0
  ) ?? 0;

  return (
    <Link href={`/builds/${slug}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all hover:shadow-lg hover:border-blue-300">
        {/* Vehicle Image/Placeholder */}
        <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900">
          {build.imageUrl ? (
            <Image
              src={build.imageUrl}
              alt={displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-32 h-16 rounded-lg opacity-50"
                style={{ backgroundColor: build.color || '#3B82F6' }}
              />
            </div>
          )}

          {/* Mod count badge */}
          {modCount > 0 && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
              <span className="text-white text-xs font-medium">
                {modCount} mod{modCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Build Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {displayName}
          </h3>
          {build.nickname && (
            <p className="text-sm text-gray-500 mt-0.5">
              {build.year} {build.make} {build.model}
            </p>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            {/* Owner */}
            {build.user && (
              <div className="flex items-center gap-2">
                {build.user.image ? (
                  <Image
                    src={build.user.image}
                    alt={build.user.name || 'User'}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-[10px] text-gray-500">
                      {build.user.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <span className="text-xs text-gray-500 truncate max-w-[100px]">
                  {build.user.name || 'Anonymous'}
                </span>
              </div>
            )}

            {/* Total invested */}
            {totalInvested > 0 && (
              <span className="text-xs text-gray-500">
                ${totalInvested.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
