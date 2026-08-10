/** Client-safe country display helper. Keep this separate from the server-only
 * subscription gate, which imports the private founder allowlist. */
export function regionDisplayName(country: string | null | undefined): string {
  if (!country) return 'your region';
  try {
    const names = new Intl.DisplayNames(['en'], { type: 'region' });
    return names.of(country) ?? country;
  } catch {
    return country;
  }
}
