/** Explicit notification also handles Next navigation and an unchanged hash. */
export const KNOWN_ISSUE_OPEN_EVENT = 'au7o:open-known-issue';

export function subscribeKnownIssueNavigation(reveal: () => void): () => void {
  const events = ['hashchange', 'popstate', KNOWN_ISSUE_OPEN_EVENT];
  events.forEach(event => window.addEventListener(event, reveal));
  return () => events.forEach(event => window.removeEventListener(event, reveal));
}

export function currentKnownIssueAnchor(): string {
  try { return decodeURIComponent(window.location.hash.slice(1)); } catch { return ''; }
}

export function openKnownIssueArticle(issueId: string): void {
  const hash = `#${encodeURIComponent(issueId)}`;
  if (window.location.hash !== hash) window.history.pushState(null, '', hash);
  window.dispatchEvent(new CustomEvent(KNOWN_ISSUE_OPEN_EVENT));
}
