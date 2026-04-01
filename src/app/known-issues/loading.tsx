export default function KnownIssuesLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header skeleton */}
      <header className="px-6 py-4 border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 h-8 bg-gray-100 rounded animate-pulse" />
            <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Title skeleton */}
        <div className="w-64 h-4 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="w-96 h-8 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="w-72 h-4 bg-gray-100 rounded animate-pulse mb-8" />

        {/* Search skeleton */}
        <div className="w-full h-12 bg-gray-100 rounded-lg animate-pulse mb-8" />

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="w-32 h-5 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="space-y-2">
                <div className="w-full h-3 bg-gray-100 rounded animate-pulse" />
                <div className="w-3/4 h-3 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="flex gap-2 mt-3">
                <div className="w-16 h-5 bg-gray-100 rounded-full animate-pulse" />
                <div className="w-20 h-5 bg-gray-100 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
