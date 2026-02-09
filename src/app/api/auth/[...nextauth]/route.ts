import { handlers } from '@/lib/auth';

/**
 * NextAuth.js API Route Handler
 *
 * Epic 4: User Accounts & Sync
 * Story 4.1: Authentication Setup
 *
 * Handles all auth-related API endpoints:
 * - POST /api/auth/signin
 * - POST /api/auth/signout
 * - GET /api/auth/session
 * - GET /api/auth/csrf
 * etc.
 */

export const { GET, POST } = handlers;
