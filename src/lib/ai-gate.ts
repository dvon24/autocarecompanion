/**
 * AI processing gate — single source of truth for the GDPR Art. 21
 * right-to-object opt-out. Every AI endpoint (/api/chat, /api/hub-chat,
 * /api/guide, /api/guide/help, /api/parts) calls one of these helpers
 * before invoking OpenAI / Anthropic so an opted-out user can never
 * cause their data to be sent to a third-party AI provider.
 *
 * Anonymous users can't opt out (no account → nothing to set the flag
 * on). Their data still flows to AI services; their lawful basis is
 * legitimate interest plus the cookie-consent they gave for tracking.
 * The opt-out is only meaningful for signed-in users who have a User
 * row we can persist the preference on.
 *
 * Returns null when the user is allowed to proceed (anonymous OR
 * signed-in with opt-out=false). Returns a NextResponse 403 when the
 * user is signed in AND has opted out, ready to be returned directly
 * from the API route.
 */

import { NextResponse } from 'next/server';
import { auth } from './auth';
import { prisma } from './db';

export interface AiGateResult {
  blocked: false;
  userId: string | null;
}

export type AiGateBlock = NextResponse;

export async function checkAiGate(): Promise<AiGateResult | AiGateBlock> {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  if (!userId) {
    // Anonymous: no opt-out possible. Allowed.
    return { blocked: false, userId: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiProcessingOptOut: true },
  });

  if (user?.aiProcessingOptOut) {
    return NextResponse.json(
      {
        error: 'ai_optout',
        message:
          'You have opted out of AI processing on this account. ' +
          'Visit Account Settings to re-enable chat, parts lookup, ' +
          'and AI-generated repair guides.',
      },
      { status: 403 },
    );
  }

  return { blocked: false, userId };
}

export function isAiGateBlocked(
  result: AiGateResult | AiGateBlock,
): result is AiGateBlock {
  return result instanceof NextResponse;
}
