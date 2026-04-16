'use client';

import { useEffect, useRef } from 'react';

/**
 * Embeds a Termly-managed policy document (Privacy, Cookie, Terms, etc.)
 * Loads the Termly embed SDK and renders into a named div.
 * Handles re-initialization on navigation between policy pages.
 */
export default function TermlyEmbed({ dataId }: { dataId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load script if not already present
    if (!document.getElementById('termly-jssdk')) {
      const script = document.createElement('script');
      script.id = 'termly-jssdk';
      script.src = 'https://app.termly.io/embed-policy.min.js';
      document.body.appendChild(script);
    } else {
      // Script already loaded — re-trigger embed for this data-id
      // Termly looks for [data-name="termly-embed"] divs on script load
      // For subsequent navigations, we need to re-run the embed
      const existing = document.getElementById('termly-jssdk');
      if (existing) {
        existing.remove();
        const script = document.createElement('script');
        script.id = 'termly-jssdk';
        script.src = 'https://app.termly.io/embed-policy.min.js';
        document.body.appendChild(script);
      }
    }
  }, [dataId]);

  return <div ref={containerRef} data-name="termly-embed" data-id={dataId} style={{ minHeight: '300px' }} />;
}
