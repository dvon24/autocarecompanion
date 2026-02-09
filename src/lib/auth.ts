import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

/**
 * Auth Configuration
 *
 * Epic 4: User Accounts & Sync
 * Story 4.1: Authentication Setup
 *
 * Uses NextAuth.js v5 (Auth.js) with credentials provider.
 * In production, this would connect to a real database.
 * For now, uses localStorage-based mock authentication.
 */

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        // In production, this would:
        // 1. Query database for user by email
        // 2. Verify password hash
        // 3. Return user object or null

        // For development/demo, accept any valid email/password combo
        // Password must be at least 6 characters
        if (password.length >= 6) {
          // Generate a consistent user ID based on email
          const userId = `user_${Buffer.from(email).toString('base64').slice(0, 12)}`;

          return {
            id: userId,
            email: email,
            name: email.split('@')[0],
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
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
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
  }
}
