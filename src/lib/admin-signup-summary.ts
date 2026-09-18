import { NextResponse } from 'next/server';

type Counts = { total: number; active: number };
export type MembershipCounts = Record<'hub' | 'visual', { verifiedAccounts: number; paid: number; trialing: number }>;
export type SignupSummary = {
  hub: Counts | null;
  visual: Counts | null;
  memberships?: MembershipCounts | null;
};

export function createAdminSignupSummaryHandler(deps: {
  authorize: () => Promise<Response | null>;
  hub: () => Promise<Counts>;
  visual: () => Promise<Counts>;
  memberships?: () => Promise<MembershipCounts>;
}) {
  return async function GET() {
    const denied = await deps.authorize();
    if (denied) return denied;
    const capture = async (load: () => Promise<Counts>) => {
      try {
        const result = await load();
        if (!Number.isSafeInteger(result.total) || !Number.isSafeInteger(result.active)
          || result.active < 0 || result.total < result.active) return null;
        return result;
      } catch { return null; }
    };
    const [hub, visual] = await Promise.all([capture(deps.hub), capture(deps.visual)]);
    let memberships: MembershipCounts | null = null;
    if(deps.memberships)try{const counts=await deps.memberships();if(Object.values(counts).every(value=>Object.values(value).every(n=>Number.isSafeInteger(n)&&n>=0)))memberships=counts;}catch{/* Missing migration or DB outage is unavailable, not zero. */}
    return NextResponse.json({ hub, visual, ...(deps.memberships ? { memberships } : {}) } satisfies SignupSummary, { headers: { 'Cache-Control': 'private, no-store' } });
  };
}
