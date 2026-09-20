/** Preview-only guard. Unset in production; an explicitly empty list denies all. */
export function stagingRecipientAllowed(to: string, allowlist: string | undefined): boolean {
  if (allowlist === undefined) return true;
  const email = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  if (!email.test(to.trim())) return false;
  const allowed = allowlist.split(',').map(value => value.trim().toLowerCase());
  if (!allowed.length || allowed.some(value => !email.test(value))) return false;
  return allowed.includes(to.trim().toLowerCase());
}
