export const AUTH_SESSION_COOKIE_BASES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
] as const;

export const SESSION_MARKER = 'au7o.sess';

/** Auth.js appends `.0`, `.1`, ... when a JWT is too large for one cookie. */
export function hasAuthSessionCookie(cookieNames: Iterable<string>): boolean {
  for (const name of cookieNames) {
    if (AUTH_SESSION_COOKIE_BASES.some((base) => name === base || name.startsWith(`${base}.`))) {
      return true;
    }
  }
  return false;
}
