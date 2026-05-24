/**
 * Embeds a Termly-managed policy document (Privacy, Cookie, Terms, etc.)
 *
 * Implementation: plain iframe pointing at Termly's policy-viewer URL.
 *
 * Why iframe and not the script-based embed:
 * Termly offers two integration paths — a JS embed
 * (https://app.termly.io/embed-policy.min.js) that DOM-injects policy
 * HTML, and a hosted policy-viewer iframe. The script embed kept
 * silently failing because the resource-blocker that TermlyCMP loads
 * at the layout root (with autoBlock=on) was intercepting the embed
 * script as a third-party domain — the dataId div sat empty at the
 * "minHeight: 300px" reservation and policy text never appeared.
 *
 * The iframe path bypasses the script entirely. Termly serves the
 * same policy content at:
 *   https://app.termly.io/policy-viewer/policy.html?policyUUID=<id>
 * which renders first-party from their CDN and isn't affected by the
 * resource-blocker. No script load order, no DOM mutation timing,
 * no SPA-navigation re-init problem.
 *
 * Tradeoff: iframe height needs to be set explicitly. Started at 1600px
 * which covers most policies; long ones may scroll within the frame
 * (acceptable). Could swap to postMessage-based auto-resize if needed.
 */
export default function TermlyEmbed({ dataId }: { dataId: string }) {
  const src = `https://app.termly.io/policy-viewer/policy.html?policyUUID=${encodeURIComponent(dataId)}`;

  return (
    <iframe
      src={src}
      title="Termly policy"
      style={{
        width: '100%',
        height: '1600px',
        border: 'none',
        display: 'block',
      }}
      loading="lazy"
    />
  );
}
