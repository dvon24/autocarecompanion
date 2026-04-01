export default function ArticleLoading() {
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
        {/* Breadcrumb skeleton */}
        <div className="flex gap-2 mb-6">
          <div className="w-10 h-4 bg-gray-100 rounded animate-pulse" />
          <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
          <div className="w-16 h-4 bg-gray-100 rounded animate-pulse" />
          <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Title skeleton */}
        <div className="w-full max-w-xl h-9 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="w-72 h-4 bg-gray-100 rounded animate-pulse mb-6" />

        {/* GEO summary skeleton */}
        <div className="border-l-4 border-blue-200 pl-5 mb-10 space-y-2">
          <div className="w-full h-3 bg-gray-100 rounded animate-pulse" />
          <div className="w-full h-3 bg-gray-100 rounded animate-pulse" />
          <div className="w-3/4 h-3 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Two-column layout */}
        <div className="lg:flex lg:gap-10">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:block lg:w-56 xl:w-64 flex-shrink-0">
            <div className="space-y-3">
              <div className="w-24 h-3 bg-gray-100 rounded animate-pulse" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-100 rounded animate-pulse" />
                  <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="w-6 h-4 bg-gray-50 rounded animate-pulse ml-auto" />
                </div>
              ))}
            </div>
          </aside>

          {/* Content skeleton */}
          <div className="min-w-0 flex-1">
            <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gray-100 rounded animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="w-48 h-5 bg-gray-200 rounded animate-pulse" />
                      <div className="w-32 h-3 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="w-5 h-5 bg-gray-100 rounded animate-pulse flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
