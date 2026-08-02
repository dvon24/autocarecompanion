import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { loginIpLimiter, loginEmailLimiter, getClientIp } from './rate-limit';

/**
 * Auth Configuration
 *
 * Epic 5: User Accounts & Monetization
 * Uses NextAuth.js v5 with Prisma adapter for database sessions.
 * Supports Google OAuth and email/password authentication.
 */

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth (optional - only if credentials are set)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // Auto-link Google to an existing same-email account. Safe here:
            // Google verifies email ownership, so there's no takeover risk.
            // Without this, anyone who already signed up with email/password
            // (e.g. Devon's own account) gets "OAuthAccountNotLinked" when they
            // try the Google button — which surfaces as the generic error.
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),

    // Email/Password
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        const parsed = LoginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        // Abuse brake. This endpoint had none, and it is the one automated
        // traffic actually targets — every attempt costs a DB lookup, and a
        // real address costs a bcrypt compare on top.
        //
        // Rate-limited attempts return null, i.e. the same "invalid
        // credentials" a wrong password gives. That is deliberate: telling an
        // attacker they hit a limit tells them the address was worth guessing.
        //
        // Best-effort by design — in-memory, so it resets on a cold start.
        // Same tolerance as every other limiter here; it blunts sustained
        // hammering from one source without an external dependency.
        const ip = request instanceof Request ? getClientIp(request) : 'unknown';
        const emailKey = email.toLowerCase();
        if (ip !== 'unknown' && !loginIpLimiter.check(ip).success) return null;
        if (!loginEmailLimiter.check(emailKey).success) return null;

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            subscriptionStatus: true,
          },
        });

        if (!user) {
          return null;
        }

        // If user has no password hash, they signed up via OAuth
        if (!user.passwordHash) {
          return null;
        }

        // Verify password
        const passwordValid = await bcrypt.compare(password, user.passwordHash);

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          subscriptionStatus: user.subscriptionStatus,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.subscriptionStatus = user.subscriptionStatus;
      }

      // Update session when triggered
      if (trigger === 'update' && session) {
        token.subscriptionStatus = session.subscriptionStatus;
      }

      // Refresh subscription status from database periodically
      if (token.id && !user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { subscriptionStatus: true },
        });
        if (dbUser) {
          token.subscriptionStatus = dbUser.subscriptionStatus;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.subscriptionStatus = token.subscriptionStatus as string | null;
        session.user.isPremium = token.subscriptionStatus === 'active';
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
});

/**
 * Type augmentation for session user
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      subscriptionStatus?: string | null;
      isPremium?: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    subscriptionStatus?: string | null;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    subscriptionStatus?: string | null;
  }
}
