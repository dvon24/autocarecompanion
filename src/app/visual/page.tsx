import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { KNOWN_ISSUE_TWIN_VISUALS } from '@/lib/known-issue-twin-visuals';
export const dynamic = 'force-dynamic';
export default async function VisualLibrary() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin?callbackUrl=/visual');
  if (!session.user.capabilities?.visual) redirect('/subscribe?product=visual');
  // A Hub demo alone is not a reviewed Visual. Empty mappings (Aviator)
  // remain excluded; article routes retain their publication/region gates.
  const visuals = KNOWN_ISSUE_TWIN_VISUALS.filter(visual => Object.keys(visual.mappings).length > 0);
  return <main className="min-h-screen bg-[#F7F6F2] text-[#0B1220]"><div className="mx-auto max-w-5xl px-5 py-10">
    <nav aria-label="Member navigation" className="mb-8 flex flex-wrap gap-5 text-sm font-semibold text-blue-700"><Link href="/account">Account</Link><Link href="/demo/hub?vehicle=xt6">Test Hub · Free demo</Link></nav>
    <h1 className="text-3xl font-semibold">Visual Known Issues</h1>
    <p className="my-4 text-slate-600">Your plan includes every available visual known-issue model. The free Hub demo uses sample data; a personal Hub is a separate plan for an available vehicle.</p>
    <div className="grid gap-5 sm:grid-cols-2">{visuals.map(visual => {
      const label = `${visual.year} ${visual.identity.make} ${visual.identity.model}`;
      return <article key={visual.twinId} className="min-w-0 rounded-2xl border border-[#E3DFD4] bg-white p-4">
        <img src={visual.base} width={visual.width} height={visual.height} alt={label} className="aspect-video w-full object-contain" />
        <h2 className="mt-3 font-semibold">{label}</h2>
        <Link className="mt-3 inline-block text-blue-700 underline" href={visual.returnPath}>Explore its visual known issues</Link>
      </article>;
    })}</div>
  </div></main>;
}
