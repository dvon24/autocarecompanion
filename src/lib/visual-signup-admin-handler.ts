import { NextResponse } from 'next/server';

export function createVisualSignupAdminHandler(authorize: ()=>Promise<boolean>, load: ()=>Promise<unknown>) {
  return async function GET() {
    if (!await authorize()) return NextResponse.json({error:'Not authorized'},{status:403});
    try { return NextResponse.json(await load(),{headers:{'Cache-Control':'private, no-store'}}); }
    catch { return NextResponse.json({error:'Visual signup data is unavailable. Check the release migration before enabling signups.'},{status:503}); }
  };
}
