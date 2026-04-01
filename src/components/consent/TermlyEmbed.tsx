'use client';

import { useEffect } from 'react';

/**
 * Embeds a Termly-managed policy document (Privacy, Cookie, Terms, etc.)
 * by loading the Termly embed SDK and rendering into a named div.
 */
export default function TermlyEmbed({ dataId }: { dataId: string }) {
  useEffect(() => {
    if (document.getElementById('termly-jssdk')) return;
    const script = document.createElement('script');
    script.id = 'termly-jssdk';
    script.src = 'https://app.termly.io/embed-policy.min.js';
    document.body.appendChild(script);
  }, []);

  return <div data-name="termly-embed" data-id={dataId} />;
}
