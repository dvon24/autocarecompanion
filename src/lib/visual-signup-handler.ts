import { NextRequest, NextResponse } from 'next/server';
import { parseVisualSignup } from './visual-signup';
import { isAllowedSubscriptionRegion } from './pricing/region';

type AcceptedSignup = NonNullable<ReturnType<typeof parseVisualSignup>>;
export function createVisualSignupHandler(deps: {
  rateLimit: (request: NextRequest)=>Response | null;
  validateEmail: (email: string)=>Promise<{ok: boolean; reason?: string}>;
  save: (input: AcceptedSignup)=>Promise<void>;
}) {
  return async function POST(request: NextRequest) {
    if (!isAllowedSubscriptionRegion(request.headers.get('x-vercel-ip-country'))) {
      return NextResponse.json({ error: 'region_unavailable', message: 'Visual signups are available in the US only.' }, { status: 403 });
    }
    const denied = deps.rateLimit(request);
    if (denied) return denied;
    const body = await request.json().catch(()=>null);
    if (body?.company) return NextResponse.json({success:true});
    const input = parseVisualSignup(body);
    if (!input) return NextResponse.json({error:'Enter a valid email and confirm US availability and email consent.'},{status:400});
    try {
      const check = await deps.validateEmail(input.email);
      if (!check.ok) return NextResponse.json({error:check.reason || 'Invalid email address'},{status:400});
      await deps.save(input);
      return NextResponse.json({success:true});
    } catch {
      return NextResponse.json({error:'We could not save your signup. Please try again later.'},{status:503});
    }
  };
}
