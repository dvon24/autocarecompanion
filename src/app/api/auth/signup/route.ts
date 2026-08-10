import { NextResponse } from 'next/server';

/** Public account creation is closed. Keep a deterministic server-side
 * boundary so old clients, cached pages, and hand-crafted requests cannot
 * create a user even if they bypass the browser route. */
export async function POST() {
  return NextResponse.json(
    { error: 'Account creation is currently unavailable.' },
    { status: 410 },
  );
}
