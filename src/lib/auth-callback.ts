const DEFAULT_CALLBACK = '/';

/**
 * Keep auth return paths same-origin. Account callback query strings are
 * user-controlled and must never become an open redirect.
 */
export function safeInternalCallback(
  value: string | null | undefined,
  fallback = DEFAULT_CALLBACK,
): string {
  if (
    !value
    || !value.startsWith('/')
    || value.startsWith('//')
    || value.includes('\\')
    || /[\r\n]/.test(value)
  ) {
    return fallback;
  }
  return value;
}

export function signupHref(callbackUrl: string): string {
  return `/auth/signup?callbackUrl=${encodeURIComponent(safeInternalCallback(callbackUrl))}`;
}

export function signinHref(callbackUrl: string): string {
  return `/auth/signin?callbackUrl=${encodeURIComponent(safeInternalCallback(callbackUrl))}`;
}
