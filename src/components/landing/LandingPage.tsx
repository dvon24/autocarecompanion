'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ScrollSyncedFeatures } from '@/components/ui/ScrollSyncedFeatures';
import { EmailCapture } from '@/components/ui/EmailCapture';
import { HeroVehicleSearch } from '@/components/discovery/HeroVehicleSearch';
import { ShareButtons } from '@/components/shared/ShareButtons';

interface TrendingIssue {
  id: string;
  make: string;
  model: string;
  title: string;
  category: string;
  severity: string;
  reportCount: number;
  yearRange: string;
  slug: string;
}

const fallbackIssues: TrendingIssue[] = [
  { id: 'ford-f150-cam-phaser', make: 'Ford', model: 'F-150', title: '5.0L Coyote Cam Phaser Tick/Rattle', category: 'Engine', severity: 'high', reportCount: 0, yearRange: '2018–2023', slug: 'ford-f-150' },
  { id: 'honda-civic-ac', make: 'Honda', model: 'Civic', title: 'AC Condenser Premature Failure', category: 'HVAC', severity: 'high', reportCount: 0, yearRange: '2016–2021', slug: 'honda-civic' },
  { id: 'dodge-challenger-diff', make: 'Dodge', model: 'Challenger', title: 'Rear Differential Whine/Clunk', category: 'Drivetrain', severity: 'high', reportCount: 0, yearRange: '2015–2023', slug: 'dodge-challenger' },
  { id: 'toyota-rav4-trans', make: 'Toyota', model: 'RAV4', title: 'Transmission Hesitation on Acceleration', category: 'Transmission', severity: 'high', reportCount: 0, yearRange: '2019–2023', slug: 'toyota-rav4' },
  { id: 'chevy-camaro-shudder', make: 'Chevrolet', model: 'Camaro', title: '8-Speed Transmission Shudder (8L90)', category: 'Transmission', severity: 'high', reportCount: 0, yearRange: '2016–2023', slug: 'chevrolet-camaro' },
  { id: 'bmw-3-vanos', make: 'BMW', model: '3 Series', title: 'VANOS Solenoid Seal Oil Leak', category: 'Engine', severity: 'high', reportCount: 0, yearRange: '2012–2019', slug: 'bmw-3-series' },
];

const severityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
};

const categoryColors: Record<string, string> = {
  Engine: 'bg-orange-50 text-orange-700 border-orange-200',
  Transmission: 'bg-purple-50 text-purple-700 border-purple-200',
  Electrical: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Suspension: 'bg-green-50 text-green-700 border-green-200',
  Brakes: 'bg-red-50 text-red-700 border-red-200',
  Drivetrain: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  HVAC: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Fuel: 'bg-amber-50 text-amber-700 border-amber-200',
};

function getCategoryStyle(category: string): string {
  return categoryColors[category] || 'bg-gray-50 text-gray-700 border-gray-200';
}

interface SiteStats {
  totalIssues: number;
  totalMakes: number;
  totalModels: number;
}

export default function LandingPage({ trendingIssues = [], stats }: { trendingIssues?: TrendingIssue[]; stats?: SiteStats }) {
  const issues = trendingIssues.length > 0 ? trendingIssues : fallbackIssues;
  const totalIssues = stats?.totalIssues ?? 3600;
  const totalMakes = stats?.totalMakes ?? 34;
  const totalModels = stats?.totalModels ?? 640;
  return (
    <div className="min-h-screen bg-white font-[system-ui,sans-serif] relative overflow-hidden flex flex-col">
      {/* Animated Engine Background - Only visible in hero section */}
      <AnimatedBackground />

      {/* Subtle gradient blobs for depth */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: 'translate(20%, -30%)',
          zIndex: 1,
        }}
      />
      <div
        className="absolute top-1/4 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: 'translate(-50%, 0%)',
          zIndex: 1,
        }}
      />

      {/* Main content */}
      <main className="relative flex flex-col flex-1" style={{ zIndex: 2 }}>
        {/* Header */}
        <header className="px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <ScrollReveal delay={0} duration={800} direction="down" distance={20}>
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/og-image.png"
                  alt="Au7o mascot"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-2xl font-bold text-gray-900 tracking-tight">
                  Au<span className="text-blue-600">7</span>o
                </span>
              </Link>
            </ScrollReveal>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 lg:py-24 relative">
          {/* Stats pills — above headline */}
          <ScrollReveal delay={200} duration={800}>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full text-sm text-gray-600 font-medium shadow-sm">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {totalIssues.toLocaleString()}+ Issues
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full text-sm text-gray-600 font-medium shadow-sm">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {totalMakes} Makes
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full text-sm text-gray-600 font-medium shadow-sm">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {totalModels}+ Models
              </span>
            </div>
          </ScrollReveal>

          {/* Main headline */}
          <ScrollReveal delay={300} duration={1000} distance={40}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center leading-[1.1] tracking-tight text-gray-900 mb-4 max-w-4xl">
              Know your car&apos;s
              <br />
              weak spots.
            </h1>
          </ScrollReveal>

          {/* Subheadline */}
          <ScrollReveal delay={400} duration={1000} distance={30}>
            <p className="text-lg sm:text-xl text-gray-500 text-center max-w-2xl mb-8 leading-relaxed">
              {totalIssues.toLocaleString()}+ documented problems across {totalModels}+ models. Symptoms, repair costs, and real solutions — before you get to the shop.
            </p>
          </ScrollReveal>

          {/* Vehicle Search */}
          <ScrollReveal delay={500} duration={800}>
            <div className="w-full max-w-3xl mb-4">
              <HeroVehicleSearch />
            </div>
          </ScrollReveal>
        </section>

        {/* Footer */}
        <footer
          className="px-6 py-12 relative bg-white"
          style={{ zIndex: 3 }}
        >
          <div className="max-w-5xl mx-auto">

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 mb-8">
              <Link href="/known-issues" className="hover:text-gray-600 transition-colors">Known Issues</Link>
              {/* Parts Finder hidden until verified */}
              <Link href="/about" className="hover:text-gray-600 transition-colors">About</Link>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
              <Link href="/cookies" className="hover:text-gray-600 transition-colors">Cookie Policy</Link>
              <a href="#" className="termly-display-preferences hover:text-gray-600 transition-colors">Consent Preferences</a>
              <Link href="/copyright" className="hover:text-gray-600 transition-colors">Copyright Policy</Link>
              <Link href="/feedback" className="hover:text-gray-600 transition-colors">Send Feedback</Link>
            </div>

            {/* Share + Follow */}
            <div className="flex justify-center mb-8">
              <ShareButtons url="https://au7o.io" title="Au7o - Know Your Car's Weak Spots" />
            </div>

            {/* AI content disclaimer */}
            <div className="flex items-start gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg max-w-2xl mx-auto mb-8">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-gray-400 leading-relaxed">
                Vehicle data and repair guidance on this site are compiled with AI assistance and may contain errors. Always verify with your service manual or a qualified mechanic.
              </p>
            </div>

            {/* Footer bottom */}
            <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/og-image.png"
                  alt="Au7o mascot"
                  width={28}
                  height={28}
                  className="rounded-lg"
                />
                <span className="text-xl font-semibold text-gray-900">
                  Au<span className="text-blue-600">7</span>o
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Built for DIY mechanics. Your vehicle selections are stored locally in your browser.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
