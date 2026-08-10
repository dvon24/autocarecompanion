import { TwinHero } from '@/components/home/TwinHero';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { SiteHeader } from '@/components/shared/SiteHeader';
import { TwinPlayground } from '@/components/twin/stage/TwinPlayground';

interface Props {
  stats?: {
    totalIssues: number;
    totalMakes: number;
    totalModels: number;
  };
}

/** The approved Vehicle Twin homepage composition, matching /dev/hero. */
export default function LandingPage({ stats }: Props) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'var(--paper, #F7F6F2)',
        color: 'var(--ink, #0B1220)',
        fontFamily: 'var(--font-geist-sans, system-ui, -apple-system, sans-serif)',
      }}
    >
      <SiteHeader
        ctaLabel="Reserve my spot"
        ctaShortLabel="Reserve"
        ctaHref="#reserve"
      />
      <TwinHero stage={<TwinPlayground />} issueCount={stats?.totalIssues} />
      <SiteFooter />
    </div>
  );
}
