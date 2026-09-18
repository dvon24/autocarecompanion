import { NextRequest, NextResponse } from 'next/server';

const validToken = (request: NextRequest) => {
  const token = request.nextUrl.searchParams.get('token');
  return token && /^[A-Za-z0-9_-]{32}$/.test(token) ? token : null;
};

export function createVisualUnsubscribeHandlers(unsubscribe: (token: string)=>Promise<void>) {
  return {
    GET(request: NextRequest) {
      const token = validToken(request);
      if (!token) return new NextResponse('This unsubscribe link is incomplete.',{status:400});
      // GET is safe for mail-preview crawlers. The token's alphabet is validated
      // before insertion into this same-site form; it reveals no email address.
      return new NextResponse(`<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Visual email preferences · Au7o</title></head><body style="font:16px system-ui;background:#faf8f2;padding:32px;color:#172033"><main style="max-width:440px;margin:auto"><h1>Stop Visual launch emails?</h1><p>Your Hub reservation and article alerts will stay unchanged.</p><form method="post" action="/api/visual-signup/unsubscribe?token=${token}"><button style="padding:12px 18px;border:0;border-radius:24px;background:#172033;color:white">Unsubscribe from Visual emails</button></form></main></body></html>`,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
    },
    async POST(request: NextRequest) {
      const token = validToken(request);
      if (!token) return new NextResponse('This unsubscribe link is incomplete.',{status:400});
      try {
        await unsubscribe(token);
        return new NextResponse('Your request has been processed. If this link matched a Visual launch signup, it is now unsubscribed. Hub reservations and article alerts are unchanged.',{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
      } catch {
        return new NextResponse('We could not process this request. Please retry the same link.',{status:503});
      }
    },
  };
}
