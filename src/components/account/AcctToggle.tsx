/**
 * Pure visual toggle pill ported from BMAD au7o(4)/13-Account.jsx.
 *
 * IMPORTANT (adversarial-verify fix): the BMAD source hardcodes
 * "green when on". For neutral on/off prefs that's fine. For the
 * AI-processing opt-out toggle, "on" historically means "opted out"
 * (a restrictive/objected state) and the existing UI uses RED for that
 * to signal the safety-relevant semantic — never green when objected.
 *
 * The `tone` prop lets the consumer pick which color "on" renders as
 * without changing the on/off state binding:
 *   - tone="positive"  → green when on  (default; matches BMAD)
 *   - tone="negative"  → red when on    (AI opt-out, etc.)
 *
 * Track stays neutral when off either way. This is presentational
 * only — the consumer remains responsible for label copy that
 * matches the persisted preference.
 */
export function AcctToggle({
  on,
  tone = 'positive',
}: {
  on: boolean;
  tone?: 'positive' | 'negative';
}) {
  const onBg = tone === 'negative' ? '#DC2626' : '#10B981';
  return (
    <span
      style={{
        width: 38,
        height: 22,
        borderRadius: 999,
        background: on ? onBg : '#E5E7EB',
        position: 'relative',
        flexShrink: 0,
        display: 'inline-block',
        transition: 'background-color 120ms ease',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: on ? 18 : 2,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 120ms ease',
        }}
      />
    </span>
  );
}
