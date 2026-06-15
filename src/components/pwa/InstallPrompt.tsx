'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'au7o-install-dismissed';
const DISMISS_DAYS = 7;

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as any).standalone === true
  );
}

function wasRecentlyDismissed(): boolean {
  if (typeof localStorage === 'undefined') return false;
  const ts = localStorage.getItem(DISMISS_KEY);
  if (!ts) return false;
  const ageMs = Date.now() - parseInt(ts, 10);
  return ageMs < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [showIOSSheet, setShowIOSSheet] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    const onInstalled = () => {
      // GA4: the app was actually added to the home screen / installed.
      trackEvent('pwa_installed', { platform: isIOS() ? 'ios' : 'android' });
      setShow(false);
      setInstallEvent(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    // iOS doesn't fire beforeinstallprompt — show the button anyway with manual instructions
    if (isIOS()) {
      setIos(true);
      setShow(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShow(false);
    setShowIOSSheet(false);
  };

  const handleInstall = async () => {
    if (ios) {
      // GA4: user tapped Install on iOS (shows the manual A2HS sheet).
      trackEvent('pwa_install_click', { platform: 'ios' });
      setShowIOSSheet(true);
      return;
    }
    if (!installEvent) return;
    // GA4: user tapped Install (before the native chooser resolves).
    trackEvent('pwa_install_click', { platform: 'android' });
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    trackEvent('pwa_install_outcome', { platform: 'android', outcome });
    if (outcome === 'accepted') {
      setShow(false);
      setInstallEvent(null);
    } else {
      dismiss();
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Banner */}
      {/* bottom-20 + z-[60]: the known-issues MobileBottomBar is fixed
          bottom-0 z-50 at ~60px tall — at bottom-4 z-40 this banner rendered
          BEHIND it with its buttons covered, on the highest-traffic mobile
          pages (2026-06-12 review finding). */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] w-[min(92vw,440px)] rounded-2xl border border-blue-200 bg-white shadow-lg shadow-blue-200/40 px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500 flex-shrink-0 flex items-center justify-center text-white text-xl font-bold">
          A
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">Install Au7o</p>
          <p className="text-xs text-gray-600 truncate">Add to your home screen — works offline.</p>
        </div>
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors flex-shrink-0"
        >
          Install
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1 flex-shrink-0"
        >
          ×
        </button>
      </div>

      {/* iOS instructions sheet */}
      {showIOSSheet && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={dismiss}>
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:w-[min(92vw,420px)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-3">Add Au7o to Home Screen</h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">1</span>
                <span>Tap the <strong>Share</strong> button in Safari <span aria-hidden>(square with arrow up)</span>.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">2</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">3</span>
                <span>Tap <strong>Add</strong>. Au7o will appear on your home screen like any other app.</span>
              </li>
            </ol>
            <button
              onClick={dismiss}
              className="mt-5 w-full py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
