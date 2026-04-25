'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

/**
 * Google Translate Website Widget
 *
 * Styled wrapper around Google Translate that matches the Au7o theme.
 * Uses CSS overrides to restyle the injected Google iframe/elements.
 */
export function GoogleTranslate() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Define the callback Google Translate expects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).googleTranslateElementInit = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* CSS overrides for Google Translate widget */}
      <style jsx global>{`
        /* Hide Google Translate top bar that pushes page down */
        .skiptranslate > iframe {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
        /* Style the select dropdown */
        #google_translate_element select {
          appearance: none;
          -webkit-appearance: none;
          background: transparent;
          border: none;
          color: #374151;
          font-size: 13px;
          font-family: inherit;
          padding: 6px 28px 6px 8px;
          cursor: pointer;
          outline: none;
          width: 100%;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
        }
        #google_translate_element select:focus {
          outline: none;
        }
        /* Hide Google branding inside the widget */
        #google_translate_element .goog-logo-link,
        #google_translate_element .goog-te-gadget > span {
          display: none !important;
        }
        #google_translate_element .goog-te-gadget {
          font-size: 0;
          line-height: 0;
        }
        /* Hide "Powered by" text */
        .goog-te-gadget .goog-te-gadget-simple {
          background: transparent !important;
          border: none !important;
        }
      `}</style>

      {/* Google Translate element - always in DOM, visibility toggled */}
      <div className="fixed top-3 right-[calc(0.75rem+40px)] z-[9999]">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5
            text-xs font-medium rounded-full
            shadow-sm border transition-all duration-200
            ${open
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-white/90 backdrop-blur-sm border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }
          `}
          aria-label="Translate page"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span className="hidden sm:inline">Translate</span>
        </button>

        {/* Dropdown panel - always rendered, toggled with visibility */}
        <div
          className={`absolute top-full right-0 mt-1.5 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[160px] transition-opacity duration-150 ${
            open ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
        >
          <div id="google_translate_element" />
        </div>
      </div>

      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
