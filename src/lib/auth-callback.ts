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
    || /[\x00-\x20\x7f]/.test(value)
  ) {
    return fallback;
  }
  try {
    const parsed = new URL(value, 'https://au7o.invalid');
    if (parsed.origin !== 'https://au7o.invalid' || parsed.pathname.startsWith('//')) return fallback;
    return parsed.pathname + parsed.search + parsed.hash;
  } catch { return fallback; }
}

export function signinHref(callbackUrl: string): string {
  return `/auth/signin?callbackUrl=${encodeURIComponent(safeInternalCallback(callbackUrl))}`;
}
