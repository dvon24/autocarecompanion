'use client';

interface CommunityResourcesFallbackProps {
  vehicle: {
    year: number;
    make: string;
    model: string;
  };
  problem: string;
  onDismiss?: () => void;
}

/**
 * Fallback component shown when guide generation fails
 * Suggests community resources for uncommon/complex issues
 */
export function CommunityResourcesFallback({
  vehicle,
  problem,
  onDismiss,
}: CommunityResourcesFallbackProps) {
  const { year, make, model } = vehicle;
  const vehicleStr = `${year} ${make} ${model}`;
  const searchQuery = encodeURIComponent(`${vehicleStr} ${problem}`);

  // Forum URLs by make
  const getForumUrl = (make: string): { name: string; url: string } | null => {
    const forums: Record<string, { name: string; url: string }> = {
      honda: { name: 'Honda-Tech', url: 'https://honda-tech.com/forums/' },
      toyota: { name: 'Toyota Nation', url: 'https://www.toyotanation.com/forums/' },
      ford: { name: 'Ford Truck Enthusiasts', url: 'https://www.ford-trucks.com/forums/' },
      chevrolet: { name: 'GM-Trucks', url: 'https://www.gm-trucks.com/forums/' },
      chevy: { name: 'GM-Trucks', url: 'https://www.gm-trucks.com/forums/' },
      gmc: { name: 'GM-Trucks', url: 'https://www.gm-trucks.com/forums/' },
      dodge: { name: 'DodgeForum', url: 'https://www.dodgeforum.com/' },
      ram: { name: 'RAM Forum', url: 'https://www.ramforum.com/' },
      jeep: { name: 'JeepForum', url: 'https://www.jeepforum.com/' },
      subaru: { name: 'NASIOC', url: 'https://forums.nasioc.com/' },
      mazda: { name: 'MazdaForum', url: 'https://www.mazdaforum.com/' },
      nissan: { name: 'NissanClub', url: 'https://www.nissanclub.com/' },
      bmw: { name: 'Bimmerfest', url: 'https://www.bimmerfest.com/forums/' },
      mercedes: { name: 'MBWorld', url: 'https://mbworld.org/forums/' },
      audi: { name: 'AudiWorld', url: 'https://www.audiworld.com/forums/' },
      volkswagen: { name: 'VWVortex', url: 'https://www.vwvortex.com/' },
      vw: { name: 'VWVortex', url: 'https://www.vwvortex.com/' },
      hyundai: { name: 'Hyundai Forums', url: 'https://www.hyundai-forums.com/' },
      kia: { name: 'Kia Forum', url: 'https://www.kiaforum.com/' },
    };
    return forums[make.toLowerCase()] || null;
  };

  const makeSpecificForum = getForumUrl(make);

  const resources = [
    {
      name: 'Google Search',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      ),
      url: `https://www.google.com/search?q=${searchQuery}`,
      description: 'Search for solutions and discussions',
    },
    {
      name: 'Reddit',
      icon: (
        <svg className="w-5 h-5" fill="#FF4500" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      ),
      url: `https://www.reddit.com/search/?q=${searchQuery}`,
      description: 'r/MechanicAdvice, r/CarTalk discussions',
    },
    {
      name: 'YouTube',
      icon: (
        <svg className="w-5 h-5" fill="#FF0000" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      url: `https://www.youtube.com/results?search_query=${searchQuery}+repair`,
      description: 'Video tutorials and walkthroughs',
    },
    {
      name: 'NHTSA Complaints',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      url: `https://www.nhtsa.gov/vehicle/${year}/${make}/${model}`,
      description: 'Official safety complaints and recalls',
    },
  ];

  // Add make-specific forum if available
  if (makeSpecificForum) {
    resources.splice(2, 0, {
      name: makeSpecificForum.name,
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      url: makeSpecificForum.url,
      description: `${make} owner community forum`,
    });
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            This looks like an uncommon issue
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            We couldn&apos;t generate a standard repair guide for this problem.
            For complex issues like this, we recommend checking community resources
            where other owners may have shared their solutions.
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search context */}
      <div className="bg-white/60 rounded-lg px-3 py-2 mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Searching for</p>
        <p className="text-sm font-medium text-gray-800">{vehicleStr} - {problem}</p>
      </div>

      {/* Resource links */}
      <div className="space-y-2">
        {resources.map((resource) => (
          <a
            key={resource.name}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-amber-300 hover:shadow-sm transition-all group"
          >
            <div className="flex-shrink-0">{resource.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 group-hover:text-amber-700 transition-colors">
                {resource.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{resource.description}</p>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-4 pt-4 border-t border-amber-200/50">
        <p className="text-xs text-gray-500 mb-2">Tips for searching:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-amber-500">•</span>
            Include specific symptoms (noise type, when it occurs)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">•</span>
            Add your mileage if the issue is mileage-related
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">•</span>
            Check for TSBs (Technical Service Bulletins) from the manufacturer
          </li>
        </ul>
      </div>
    </div>
  );
}
