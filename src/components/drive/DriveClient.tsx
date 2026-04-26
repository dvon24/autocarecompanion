'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { VehiclePicker, type DriveVehicle } from './VehiclePicker';

const LS_VEHICLE = 'au7o-drive-vehicle';
const LS_PREFS = 'au7o-drive-prefs';
const LS_HISTORY = 'au7o-drive-history';
const LS_VOICE = 'au7o-drive-voice-mode';
const LS_FAVORITES = 'au7o-drive-favorites';
const LS_LANGUAGE = 'au7o-drive-language';

type DriveLanguage = 'en' | 'de';

function detectInitialLanguage(): DriveLanguage {
  if (typeof navigator === 'undefined') return 'en';
  const lang = (navigator.language || '').toLowerCase();
  if (lang.startsWith('de')) return 'de';
  return 'en';
}

const LANG_LABELS: Record<DriveLanguage, { code: string; voicePrefix: string; flag: string }> = {
  en: { code: 'en-US', voicePrefix: 'en', flag: '🇺🇸' },
  de: { code: 'de-DE', voicePrefix: 'de', flag: '🇩🇪' },
};

type VoiceMode = 'all' | 'alerts' | 'mute';

type SpeechRecognitionType = typeof window extends { SpeechRecognition: infer T } ? T : any;

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

interface FuelStop {
  name: string;
  lng: number;
  lat: number;
  milesFromStart: number;
}

interface ParkingOption {
  name: string;
  lng: number;
  lat: number;
  walkingBlocks: number;
}

interface SpeedLimitEntry {
  speed: number | null;
  unit: 'mph' | 'km/h' | null;
  unknown?: boolean;
  none?: boolean;
}

interface NavStep {
  instruction: string;
  distance: number;
  duration: number;
  location: [number, number];
  voice?: Array<{ distanceAlongGeometry: number; announcement: string }>;
}

interface TripIntelligence {
  tripType: 'commute' | 'errand' | 'road_trip' | 'scenic' | 'unknown';
  suggestions: string[];
  delayWarning: string;
  breakRecommendation: string;
}

interface RouteResponse {
  intent?: 'navigate' | 'clarify' | 'chat';
  destination?: string;
  origin?: { lng: number; lat: number };
  destinationCoords?: { lng: number; lat: number };
  geometry?: GeoJSON.LineString;
  miles?: number;
  minutes?: number;
  summary?: string;
  reply?: string;
  fuelStops?: FuelStop[];
  parkingOptions?: ParkingOption[];
  speedLimits?: SpeedLimitEntry[];
  steps?: NavStep[];
  tripIntelligence?: TripIntelligence | null;
  fuelNeeded?: { gallons: number; tankPercent: number | null; mpgUsed: number } | null;
  isRoundTrip?: boolean;
  routePreferences?: { avoidHighways: boolean; avoidTolls: boolean; avoidFerries: boolean };
  preferenceUpdate?: string;
  error?: string;
  message?: string;
}

interface ConvoTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface ActiveRoute {
  destination: string;
  miles: number;
  minutes: number;
  destinationCoords?: { lng: number; lat: number };
}

/**
 * Pick the most natural-sounding voice the browser exposes for the requested
 * language. Defaults are usually the most robotic stock voice; OS-installed
 * Enhanced/Neural voices sound dramatically better and we should use them
 * when present.
 */
function pickBestVoice(language: DriveLanguage): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const preferredEn = [
    'Samantha (Enhanced)', 'Samantha', 'Ava (Enhanced)', 'Ava',
    'Daniel (Enhanced)', 'Daniel', 'Karen (Enhanced)', 'Karen',
    'Moira (Enhanced)', 'Tessa', 'Alex',
    'Google US English', 'Google UK English Female', 'Google UK English Male',
    'Microsoft Aria Online (Natural)', 'Microsoft Guy Online (Natural)',
    'Microsoft Jenny Online (Natural)', 'Microsoft Davis Online (Natural)',
  ];
  const preferredDe = [
    'Anna (Enhanced)', 'Anna', 'Markus (Enhanced)', 'Markus',
    'Petra (Enhanced)', 'Petra', 'Yannick (Enhanced)', 'Yannick',
    'Google Deutsch',
    'Microsoft Katja Online (Natural)', 'Microsoft Conrad Online (Natural)',
    'Microsoft Florian Online (Natural)',
  ];
  const preferredNames = language === 'de' ? preferredDe : preferredEn;
  const qualityKeywords = ['enhanced', 'premium', 'natural', 'neural', 'siri', 'wavenet'];
  const langPrefix = LANG_LABELS[language].voicePrefix;
  const scored = voices.map((v) => {
    let score = 0;
    if (v.lang.startsWith(langPrefix)) score += 100;
    if (preferredNames.some((n) => v.name === n)) score += 80;
    else if (preferredNames.some((n) => v.name.includes(n))) score += 50;
    const nameLower = v.name.toLowerCase();
    if (qualityKeywords.some((k) => nameLower.includes(k))) score += 30;
    if (v.localService) score += 10;
    if (v.default) score += 5;
    return { voice: v, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.score > 100 ? scored[0].voice : voices.find((v) => v.lang.startsWith(langPrefix)) || voices[0];
}

let _cachedVoice: SpeechSynthesisVoice | null = null;
let _cachedVoiceLang: DriveLanguage | null = null;
function resolveVoice(language: DriveLanguage): SpeechSynthesisVoice | null {
  if (_cachedVoice && _cachedVoiceLang === language) return _cachedVoice;
  _cachedVoice = pickBestVoice(language);
  _cachedVoiceLang = language;
  return _cachedVoice;
}

function speak(text: string, mode: VoiceMode = 'all', priority: 'alert' | 'normal' = 'normal', language: DriveLanguage = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (mode === 'mute') return;
  if (mode === 'alerts' && priority !== 'alert') return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voice = resolveVoice(language);
    if (voice) utter.voice = voice;
    utter.lang = LANG_LABELS[language].code;
    utter.rate = 0.95; // slightly slower than default for in-car clarity
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
  } catch { /* ignore */ }
}

export function DriveClient({ mapboxToken }: { mapboxToken: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const originMarker = useRef<mapboxgl.Marker | null>(null);
  const destMarker = useRef<mapboxgl.Marker | null>(null);
  const fuelMarkers = useRef<mapboxgl.Marker[]>([]);
  const parkingMarkers = useRef<mapboxgl.Marker[]>([]);

  const [origin, setOrigin] = useState<{ lng: number; lat: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [driverSpeedMph, setDriverSpeedMph] = useState<number | null>(null);
  const routeCoordsRef = useRef<[number, number][]>([]);
  const speedLimitsRef = useRef<SpeedLimitEntry[]>([]);
  const [currentLimit, setCurrentLimit] = useState<SpeedLimitEntry | null>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [busy, setBusy] = useState(false);
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<ConvoTurn[]>([]);
  const [lastReply, setLastReply] = useState<string>('');
  const [typedInput, setTypedInput] = useState<string>('');
  // Active route mirror for the API so Claude can answer "how long is this trip?"
  const activeRouteRef = useRef<ActiveRoute | null>(null);
  // Garage-aware state — persisted to localStorage so no login is needed.
  const [vehicle, setVehicleState] = useState<DriveVehicle | null>(null);
  const driverPrefsRef = useRef<string>('');
  const routeHistoryRef = useRef<Array<{ destination: string; miles: number; minutes: number; at: number }>>([]);

  // UI shell state — collapsible bottom card + voice mode.
  const [bottomExpanded, setBottomExpanded] = useState(true);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('all');
  const [language, setLanguage] = useState<DriveLanguage>('en');
  // True when the driver has touched the map recently. Pauses auto-recenter
  // so they can pan/zoom freely while in follow mode.
  const userPanningRef = useRef<boolean>(false);
  const lastUserPanAtRef = useRef<number>(0);
  // Active-navigation state: when 'following', the camera tracks the driver and
  // voice maneuvers are spoken at trigger distances.
  const [following, setFollowing] = useState(false);
  const stepsRef = useRef<NavStep[]>([]);
  const currentStepIdxRef = useRef<number>(0);
  const spokenAnnouncementsRef = useRef<Set<string>>(new Set());
  const [currentStepInstruction, setCurrentStepInstruction] = useState<string>('');
  // Reroute infrastructure — preserves the original destination + prefs across
  // route changes so the driver can drift off and snap back to the SAME goal.
  const originalDestRef = useRef<{ lng: number; lat: number; placeName: string } | null>(null);
  const originalRoutePrefsRef = useRef<{ avoidHighways: boolean; avoidTolls: boolean; avoidFerries: boolean }>({ avoidHighways: false, avoidTolls: false, avoidFerries: false });
  const isRoundTripRef = useRef<boolean>(false);
  const lastRerouteAtRef = useRef<number>(0);
  const offRouteSinceRef = useRef<number | null>(null);
  const isReroutingRef = useRef<boolean>(false);
  const routeFetchedAtRef = useRef<number>(0);
  const [liveMinutes, setLiveMinutes] = useState<number | null>(null);

  interface AlternateRoute {
    geometry: GeoJSON.LineString;
    miles: number;
    minutes: number;
    summary: string;
    steps: NavStep[];
  }
  // The faster alternate Mapbox suggested on the most recent re-fetch (if any).
  const [pendingAlternate, setPendingAlternate] = useState<{ alt: AlternateRoute; savesMin: number } | null>(null);
  const [tripIntelligence, setTripIntelligence] = useState<TripIntelligence | null>(null);

  // Autocomplete state for the destination input.
  interface Suggestion { name: string; placeFormatted: string; mapboxId: string; featureType: string }
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestSessionRef = useRef<string>('');
  const suggestAbortRef = useRef<AbortController | null>(null);
  const suggestDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced fetch of Mapbox SearchBox suggestions whenever the user types.
  useEffect(() => {
    if (!suggestSessionRef.current) {
      suggestSessionRef.current = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    }
    if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current);
    const q = typedInput.trim();
    if (q.length < 2 || !origin) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    suggestDebounceRef.current = setTimeout(() => {
      suggestAbortRef.current?.abort();
      const controller = new AbortController();
      suggestAbortRef.current = controller;
      const params = new URLSearchParams({
        q,
        lng: String(origin.lng),
        lat: String(origin.lat),
        session_token: suggestSessionRef.current,
      });
      fetch(`/api/drive/suggest?${params.toString()}`, { signal: controller.signal })
        .then((r) => r.ok ? r.json() : { suggestions: [] })
        .then((d: { suggestions?: Suggestion[] }) => {
          setSuggestions(d.suggestions || []);
          setShowSuggestions((d.suggestions || []).length > 0);
        })
        .catch(() => { /* aborted or network — silent */ });
    }, 200);
    return () => {
      if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current);
    };
  }, [typedInput, origin]);


  // Load persisted state once on mount.
  useEffect(() => {
    try {
      const v = localStorage.getItem(LS_VEHICLE);
      if (v) setVehicleState(JSON.parse(v));
      driverPrefsRef.current = localStorage.getItem(LS_PREFS) || '';
      const h = localStorage.getItem(LS_HISTORY);
      if (h) routeHistoryRef.current = JSON.parse(h);
      const vm = localStorage.getItem(LS_VOICE) as VoiceMode | null;
      if (vm === 'all' || vm === 'alerts' || vm === 'mute') setVoiceMode(vm);
      const ls = localStorage.getItem(LS_LANGUAGE) as DriveLanguage | null;
      if (ls === 'en' || ls === 'de') setLanguage(ls);
      else setLanguage(detectInitialLanguage());
    } catch { /* ignore */ }

    // Some browsers (Chrome, Safari) load TTS voices asynchronously.
    // Reset the cached pick whenever the list changes so we end up
    // with the best available voice once they arrive.
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const onVoicesChanged = () => { _cachedVoice = null; };
      window.speechSynthesis.addEventListener?.('voiceschanged', onVoicesChanged);
      // Trigger initial fetch — Safari sometimes requires this.
      window.speechSynthesis.getVoices();
      return () => window.speechSynthesis.removeEventListener?.('voiceschanged', onVoicesChanged);
    }
  }, []);

  const cycleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next: DriveLanguage = prev === 'en' ? 'de' : 'en';
      try { localStorage.setItem(LS_LANGUAGE, next); } catch { /* ignore */ }
      _cachedVoice = null; _cachedVoiceLang = null;
      return next;
    });
  }, []);

  const cycleVoiceMode = useCallback(() => {
    setVoiceMode((prev) => {
      const next: VoiceMode = prev === 'all' ? 'alerts' : prev === 'alerts' ? 'mute' : 'all';
      try { localStorage.setItem(LS_VOICE, next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const [routeRating, setRouteRating] = useState<'love' | 'up' | 'down' | null>(null);
  const [ratingToast, setRatingToast] = useState<string>('');

  const rateCurrentRoute = useCallback((rating: 'love' | 'up' | 'down') => {
    if (!route?.destination || typeof route.miles !== 'number') return;
    setRouteRating(rating);
    const verb = rating === 'love' ? 'Loved' : rating === 'up' ? 'Liked' : 'Disliked';
    const tripTypeLabel = route.isRoundTrip ? 'round trip' : 'route';
    const note = `${verb} a ${route.miles} mi ${tripTypeLabel} to ${route.destination} on ${new Date().toISOString().slice(0, 10)}.`;
    // Save the rating event to localStorage.
    try {
      const arr = JSON.parse(localStorage.getItem(LS_FAVORITES) || '[]');
      arr.push({
        rating,
        destination: route.destination,
        miles: route.miles,
        minutes: route.minutes,
        isRoundTrip: !!route.isRoundTrip,
        at: Date.now(),
      });
      localStorage.setItem(LS_FAVORITES, JSON.stringify(arr.slice(-50)));
    } catch { /* ignore */ }
    // Inject as a durable preference Claude sees on every future turn.
    const prev = driverPrefsRef.current ? driverPrefsRef.current + '\n' : '';
    driverPrefsRef.current = (prev + note).slice(-2000);
    try { localStorage.setItem(LS_PREFS, driverPrefsRef.current); } catch { /* ignore */ }
    // Toast feedback for the driver.
    const toast = rating === 'love' ? '❤️ Saved as favorite' : rating === 'up' ? '👍 Got it — more like this' : '👎 Got it — fewer like this';
    setRatingToast(toast);
    setTimeout(() => setRatingToast(''), 2200);
  }, [route]);

  const saveRouteToHistory = useCallback(() => {
    const r = activeRouteRef.current;
    if (!r?.destination || typeof r.miles !== 'number' || typeof r.minutes !== 'number') return;
    // De-dupe: don't append the same destination twice in a row.
    const last = routeHistoryRef.current[routeHistoryRef.current.length - 1];
    if (last && last.destination === r.destination && Date.now() - last.at < 5 * 60_000) return;
    routeHistoryRef.current = [...routeHistoryRef.current, {
      destination: r.destination,
      miles: r.miles,
      minutes: r.minutes,
      at: Date.now(),
    }].slice(-30);
    try { localStorage.setItem(LS_HISTORY, JSON.stringify(routeHistoryRef.current)); } catch { /* ignore */ }
  }, []);

  const recenterOnDriver = useCallback(() => {
    const map = mapRef.current;
    if (!map || !origin) return;
    userPanningRef.current = false; // tapping recenter explicitly resumes follow
    map.flyTo({ center: [origin.lng, origin.lat], zoom: 16, pitch: 60, speed: 1.4, essential: true });
  }, [origin]);

  // Periodic traffic re-fetch + ETA decrement while following.
  useEffect(() => {
    if (!following) return;
    const refetchTimer = setInterval(() => {
      if (origin && originalDestRef.current) reroute('periodic');
    }, 150_000); // every 2.5 min
    const etaTimer = setInterval(() => {
      const minutes = activeRouteRef.current?.minutes;
      const fetchedAt = routeFetchedAtRef.current;
      if (!minutes || !fetchedAt) return;
      const elapsedMin = (Date.now() - fetchedAt) / 60_000;
      const projected = Math.max(0, Math.round(minutes - elapsedMin));
      setLiveMinutes(projected);
    }, 30_000);
    return () => { clearInterval(refetchTimer); clearInterval(etaTimer); };
    // reroute is stable enough (depends on origin + voiceMode) that we don't
    // need to recreate timers on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [following]);

  // Reroute helper — called both on off-route detection and on the periodic
  // refresh timer. Hits /api/drive/reroute (no Claude, no geocoding) and
  // updates the active route + map without showing a "planning" spinner.
  const reroute = useCallback(async (reason: 'off_route' | 'periodic') => {
    if (isReroutingRef.current) return;
    if (!origin || !originalDestRef.current) return;
    // Throttle: at most 1 reroute every 25s regardless of trigger.
    if (Date.now() - lastRerouteAtRef.current < 25_000) return;
    isReroutingRef.current = true;
    lastRerouteAtRef.current = Date.now();
    try {
      const res = await fetch('/api/drive/reroute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination: originalDestRef.current,
          isRoundTrip: isRoundTripRef.current,
          routePreferences: originalRoutePrefsRef.current,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.error || !data.geometry) return;

      // Compute traffic delta vs. the previously-known minutes.
      const oldMinutes = activeRouteRef.current?.minutes ?? data.minutes;
      const minutesDelta = data.minutes - oldMinutes;

      // Update everything that depends on the route.
      const map = mapRef.current;
      if (map && originalDestRef.current) {
        const applyLayer = () => {
          const src = map.getSource('route') as mapboxgl.GeoJSONSource | undefined;
          if (src) src.setData({ type: 'Feature', geometry: data.geometry, properties: {} });
        };
        if (map.isStyleLoaded()) applyLayer();
        else map.once('load', applyLayer);
      }
      routeCoordsRef.current = (data.geometry.coordinates as [number, number][]) || [];
      speedLimitsRef.current = data.speedLimits || [];
      stepsRef.current = data.steps || [];
      currentStepIdxRef.current = 0;
      spokenAnnouncementsRef.current.clear();
      setCurrentStepInstruction(data.steps?.[0]?.instruction || '');
      activeRouteRef.current = activeRouteRef.current ? {
        ...activeRouteRef.current,
        miles: data.miles,
        minutes: data.minutes,
      } : null;
      setRoute((prev) => prev ? { ...prev, miles: data.miles, minutes: data.minutes, geometry: data.geometry, steps: data.steps, speedLimits: data.speedLimits } : prev);
      routeFetchedAtRef.current = Date.now();
      setLiveMinutes(data.minutes);

      // Spoken alert when meaningfully relevant.
      if (reason === 'off_route') {
        speak('Rerouting.', voiceMode, 'alert', language);
      } else if (minutesDelta >= 5) {
        speak(`Traffic added about ${minutesDelta} minutes. New ETA ${data.minutes} minutes.`, voiceMode, 'alert', language);
      } else if (minutesDelta <= -5) {
        speak(`Traffic cleared. New ETA ${data.minutes} minutes.`, voiceMode, 'alert', language);
      }

      // Faster-alternate detection: surface a 'switch?' prompt only when
      // Mapbox returned an alternate that's at least 5 min faster than the
      // route we're currently on. Skip on off-route reroutes (we just snapped
      // to a fresh path; no point second-guessing it immediately).
      if (reason === 'periodic' && Array.isArray(data.alternates) && data.alternates.length > 0) {
        let bestAlt: AlternateRoute | null = null;
        for (const a of data.alternates as AlternateRoute[]) {
          if (typeof a?.minutes !== 'number') continue;
          if (a.minutes < data.minutes - 4 && (!bestAlt || a.minutes < bestAlt.minutes)) bestAlt = a;
        }
        if (bestAlt) {
          const savesMin = data.minutes - bestAlt.minutes;
          setPendingAlternate({ alt: bestAlt, savesMin });
          speak(`Faster route via ${bestAlt.summary} saves about ${savesMin} minutes. Tap Switch to take it.`, voiceMode, 'alert', language);
        } else {
          setPendingAlternate(null);
        }
      }
    } catch { /* silent */ }
    finally { isReroutingRef.current = false; }
  }, [origin, voiceMode]);

  // Switch to a previously-suggested alternate route. Wipes the pending prompt
  // and re-uses the normal reroute pipeline so all the side-effects (steps,
  // speed limits, route line, ETA) stay consistent.
  const switchToAlternate = useCallback(() => {
    const pending = pendingAlternate;
    if (!pending) return;
    setPendingAlternate(null);
    const map = mapRef.current;
    if (map) {
      const applyLayer = () => {
        const src = map.getSource('route') as mapboxgl.GeoJSONSource | undefined;
        if (src) src.setData({ type: 'Feature', geometry: pending.alt.geometry, properties: {} });
      };
      if (map.isStyleLoaded()) applyLayer();
      else map.once('load', applyLayer);
    }
    routeCoordsRef.current = (pending.alt.geometry.coordinates as [number, number][]) || [];
    stepsRef.current = pending.alt.steps || [];
    currentStepIdxRef.current = 0;
    spokenAnnouncementsRef.current.clear();
    setCurrentStepInstruction(pending.alt.steps?.[0]?.instruction || '');
    activeRouteRef.current = activeRouteRef.current ? {
      ...activeRouteRef.current,
      miles: pending.alt.miles,
      minutes: pending.alt.minutes,
    } : null;
    setRoute((prev) => prev ? { ...prev, miles: pending.alt.miles, minutes: pending.alt.minutes, geometry: pending.alt.geometry, steps: pending.alt.steps } : prev);
    routeFetchedAtRef.current = Date.now();
    setLiveMinutes(pending.alt.minutes);
    lastRerouteAtRef.current = Date.now();
    speak(`Switched to faster route. ${pending.alt.minutes} minutes.`, voiceMode, 'alert', language);
  }, [pendingAlternate, voiceMode]);

  const clearStoredPreferences = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!window.confirm('Clear all saved driving preferences and trip history?\n\nThis wipes anything Au7o has learned about how you like to drive on this device. You\'ll start fresh.')) return;
    driverPrefsRef.current = '';
    routeHistoryRef.current = [];
    try {
      localStorage.removeItem(LS_PREFS);
      localStorage.removeItem(LS_HISTORY);
      localStorage.removeItem(LS_FAVORITES);
    } catch { /* ignore */ }
    setRatingToast('Saved preferences cleared');
    setTimeout(() => setRatingToast(''), 2200);
  }, []);

  // End the current trip: cancel TTS, exit follow mode, wipe route line +
  // every overlay marker, reset trip-intelligence + steps so the bottom
  // card returns to the empty 'pick a destination' state.
  const endTrip = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setFollowing(false);
    const map = mapRef.current;
    if (map) {
      try {
        if (map.getLayer('route-line')) map.removeLayer('route-line');
        if (map.getSource('route')) map.removeSource('route');
      } catch { /* noop */ }
      destMarker.current?.remove();
      destMarker.current = null;
      fuelMarkers.current.forEach((m) => m.remove());
      fuelMarkers.current = [];
      parkingMarkers.current.forEach((m) => m.remove());
      parkingMarkers.current = [];
    }
    setRoute(null);
    activeRouteRef.current = null;
    routeCoordsRef.current = [];
    speedLimitsRef.current = [];
    stepsRef.current = [];
    currentStepIdxRef.current = 0;
    spokenAnnouncementsRef.current.clear();
    setCurrentStepInstruction('');
    setTripIntelligence(null);
    setCurrentLimit(null);
    setLastReply('');
    setTranscript('');
    setTypedInput('');
    setBottomExpanded(true);
    // Reset reroute state so the next trip starts clean.
    originalDestRef.current = null;
    isRoundTripRef.current = false;
    originalRoutePrefsRef.current = { avoidHighways: false, avoidTolls: false, avoidFerries: false };
    offRouteSinceRef.current = null;
    lastRerouteAtRef.current = 0;
    routeFetchedAtRef.current = 0;
    setLiveMinutes(null);
    setPendingAlternate(null);
  }, []);

  const setVehicle = useCallback((v: DriveVehicle | null) => {
    setVehicleState(v);
    try {
      if (v) localStorage.setItem(LS_VEHICLE, JSON.stringify(v));
      else localStorage.removeItem(LS_VEHICLE);
    } catch { /* ignore */ }
  }, []);

  const recognitionRef = useRef<any>(null);
  // Ref-shim around submitTranscript so map event handlers (registered once
  // on mount) can call the latest version without re-binding.
  const submitTranscriptRef = useRef<((text: string, trustedDestination?: { lng: number; lat: number; placeName: string }) => void) | null>(null);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported on this device.');
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;
        setOrigin({ lng, lat });
        setLocationError(null);

        // Browser geolocation gives speed in m/s (null if unavailable/parked).
        if (typeof pos.coords.speed === 'number' && !Number.isNaN(pos.coords.speed)) {
          setDriverSpeedMph(Math.max(0, pos.coords.speed * 2.23694));
        }

        // Resolve current speed limit by finding the nearest route segment.
        const coords = routeCoordsRef.current;
        const limits = speedLimitsRef.current;
        if (coords.length > 1 && limits.length > 0) {
          let bestIdx = 0;
          let bestDist = Infinity;
          for (let i = 0; i < coords.length; i++) {
            const [cLng, cLat] = coords[i];
            const dLng = cLng - lng;
            const dLat = cLat - lat;
            const d = dLng * dLng + dLat * dLat;
            if (d < bestDist) { bestDist = d; bestIdx = i; }
          }
          const segIdx = Math.min(bestIdx, limits.length - 1);
          setCurrentLimit(limits[segIdx] || null);
        }

        // Follow-mode: keep the camera centered on the driver, oriented along their heading.
        // Skip while the user is actively touching the map so they can pan/zoom freely.
        const map = mapRef.current;
        if (map && following && !userPanningRef.current) {
          const heading = (typeof pos.coords.heading === 'number' && !Number.isNaN(pos.coords.heading))
            ? pos.coords.heading
            : map.getBearing();
          map.easeTo({
            center: [lng, lat],
            bearing: heading,
            pitch: 60,
            zoom: Math.max(map.getZoom(), 17),
            duration: 800,
            essential: true,
          });
        }

        // Turn-by-turn: walk through pending maneuver steps and speak voice prompts
        // at the right trigger distances. Once we've passed a step, advance.
        const steps = stepsRef.current;
        if (steps.length > 0 && following) {
          // Haversine distance to the next maneuver point.
          const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
            const R = 6371_000;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLng = (lng2 - lng1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
            return 2 * R * Math.asin(Math.sqrt(a));
          };
          const idx = currentStepIdxRef.current;
          const step = steps[idx];
          if (step) {
            setCurrentStepInstruction(step.instruction);
            const distToManeuver = haversine(lat, lng, step.location[1], step.location[0]);
            // Mapbox voiceInstructions trigger when the driver is within
            // distanceAlongGeometry meters of the maneuver point.
            for (const v of step.voice || []) {
              if (distToManeuver <= v.distanceAlongGeometry) {
                const key = `${idx}:${v.distanceAlongGeometry}`;
                if (!spokenAnnouncementsRef.current.has(key)) {
                  spokenAnnouncementsRef.current.add(key);
                  speak(v.announcement, voiceMode, 'alert', language);
                }
              }
            }
            // Once we're <30 m from the maneuver, advance to the next step.
            if (distToManeuver < 30 && idx < steps.length - 1) {
              currentStepIdxRef.current = idx + 1;
              spokenAnnouncementsRef.current.clear();
            }
          }
        }

        // Off-route detection: if we've drifted > 60m from the route line for
        // 8+ seconds, trigger an auto-reroute.
        if (following && coords.length > 1) {
          const haver = (lat1: number, lng1: number, lat2: number, lng2: number) => {
            const R = 6371_000;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLng = (lng2 - lng1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
            return 2 * R * Math.asin(Math.sqrt(a));
          };
          let nearestMeters = Infinity;
          for (let i = 0; i < coords.length; i++) {
            const d = haver(lat, lng, coords[i][1], coords[i][0]);
            if (d < nearestMeters) nearestMeters = d;
          }
          if (nearestMeters > 60) {
            if (offRouteSinceRef.current == null) offRouteSinceRef.current = Date.now();
            else if (Date.now() - offRouteSinceRef.current > 8000) {
              offRouteSinceRef.current = null;
              reroute('off_route');
            }
          } else {
            offRouteSinceRef.current = null;
          }
        }
      },
      (err) => setLocationError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [following, voiceMode, reroute]);

  // Map init
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    mapboxgl.accessToken = mapboxToken;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      // Mapbox Standard ships with 3D buildings + dynamic lighting baked in.
      style: 'mapbox://styles/mapbox/standard',
      center: origin ? [origin.lng, origin.lat] : [-98.5, 39.5],
      zoom: origin ? 16 : 11,
      pitch: origin ? 60 : 0,
      bearing: 0,
      antialias: true,
    });
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

    // Defensive resize — if the container laid out after map init, the canvas
    // can be stuck at 0x0. Force a resize on the next frames.
    requestAnimationFrame(() => map.resize());
    setTimeout(() => map.resize(), 200);
    setTimeout(() => map.resize(), 1000);

    // User-gesture detection: pause auto-recenter for 10s after the driver
    // touches the map (drag, pinch-zoom, rotate, pitch). Resumes silently
    // after a quiet period or instantly when they tap the recenter button.
    const markUserPan = () => {
      userPanningRef.current = true;
      lastUserPanAtRef.current = Date.now();
    };
    map.on('dragstart', markUserPan);
    map.on('zoomstart', markUserPan);
    map.on('rotatestart', markUserPan);
    map.on('pitchstart', markUserPan);
    const resumeTimer = setInterval(() => {
      if (userPanningRef.current && Date.now() - lastUserPanAtRef.current > 10_000) {
        userPanningRef.current = false;
      }
    }, 1000);

    // POI clicks via Mapbox's Interactions API — the official path for
    // tapping the built-in POI featureset on Standard Style. Falls back to
    // a manual queryRenderedFeatures handler if addInteraction isn't
    // available on this SDK version.
    const showPoiPopup = (name: string, coords: [number, number]) => {
      const popup = new mapboxgl.Popup({ offset: 12, closeOnClick: true })
        .setLngLat(coords)
        .setHTML(`
          <div style="font:600 13px system-ui;padding:4px 4px 6px;color:#111;">${name.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</div>
          <button id="drive-poi-route" style="width:100%;padding:7px 10px;background:#2563eb;color:#fff;border:0;border-radius:8px;font:700 12px system-ui;cursor:pointer;">Route here →</button>
        `)
        .addTo(map);
      requestAnimationFrame(() => {
        const btn = document.getElementById('drive-poi-route');
        if (btn) btn.onclick = () => {
          popup.remove();
          submitTranscriptRef.current?.(name, { lng: coords[0], lat: coords[1], placeName: name });
        };
      });
    };

    let interactionsRegistered = false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m: any = map;
      if (typeof m.addInteraction === 'function') {
        m.addInteraction('au7o-poi-click', {
          type: 'click',
          target: { featuresetId: 'poi', importId: 'basemap' },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handler: (e: any) => {
            const f = e?.feature;
            const name = f?.properties?.name_en || f?.properties?.name;
            const coords = f?.geometry?.coordinates as [number, number] | undefined;
            if (name && coords) showPoiPopup(String(name), coords);
          },
        });
        interactionsRegistered = true;
      }
    } catch { /* fall through to manual handler */ }

    // Fallback manual handler if Interactions API unavailable.
    if (!interactionsRegistered) {
      const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
        const pad = 6;
        const bbox: [mapboxgl.PointLike, mapboxgl.PointLike] = [
          [e.point.x - pad, e.point.y - pad],
          [e.point.x + pad, e.point.y + pad],
        ];
        const features = map.queryRenderedFeatures(bbox);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const poi: any = features.find((f: any) => {
          const p = f.properties || {};
          return (p.name || p.name_en) && f.geometry?.type === 'Point';
        });
        if (!poi) return;
        const name = String(poi.properties.name_en || poi.properties.name);
        const coords = poi.geometry.coordinates as [number, number];
        showPoiPopup(name, coords);
      };
      map.on('click', handleMapClick);
    }

    // On style load, add terrain + atmosphere so distant landscape looks volumetric.
    map.on('style.load', () => {
      if (!map.getSource('mapbox-dem')) {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
      }
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.3 });
      // Let Standard style's built-in atmosphere render — overriding space-color
      // to black made the globe appear to be a void at low zooms.
      // Standard style uses a config API for lighting / themes.
      try {
        map.setConfigProperty('basemap', 'lightPreset', 'day');
        map.setConfigProperty('basemap', 'show3dObjects', true);
      } catch { /* older mapbox-gl versions */ }

      // Building transparency — try every approach Mapbox supports because
      // Standard's internal layer naming has shifted across SDK versions:
      //  1. Standard config knob 'show3dBuildings' (correct name per docs;
      //     the singular 'show3dObjects' is a no-op).
      //  2. Direct setPaintProperty on the 'building' fill-extrusion layer.
      //  3. Iterate every fill-extrusion layer and apply a zoom-aware
      //     opacity expression as a fallback.
      try { map.setConfigProperty('basemap', 'show3dBuildings', true); } catch { /* noop */ }
      const opacityExpr: mapboxgl.ExpressionSpecification = [
        'interpolate', ['linear'], ['zoom'],
        14, 1.0,
        16, 0.45,
        18, 0.15,
      ];
      const tryOpacity = (id: string, prop: 'fill-opacity' | 'fill-extrusion-opacity') => {
        try { map.setPaintProperty(id, prop, opacityExpr); return true; } catch { return false; }
      };
      tryOpacity('building', 'fill-extrusion-opacity');
      tryOpacity('building', 'fill-opacity');
      try {
        for (const layer of (map.getStyle()?.layers || [])) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const t = (layer as any).type;
          if (t === 'fill-extrusion') tryOpacity(layer.id, 'fill-extrusion-opacity');
        }
      } catch { /* noop */ }
    });

    mapRef.current = map;
    return () => { clearInterval(resumeTimer); map.remove(); mapRef.current = null; };
  // mapboxToken never changes; origin handled in separate effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapboxToken]);

  // Origin marker & initial zoom to user location
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !origin) return;
    if (!originMarker.current) {
      const el = document.createElement('div');
      el.className = 'drive-origin-marker';
      el.style.cssText = 'width:14px;height:14px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 2px #3b82f6;';
      originMarker.current = new mapboxgl.Marker({ element: el }).setLngLat([origin.lng, origin.lat]).addTo(map);
      map.resize();
      map.flyTo({ center: [origin.lng, origin.lat], zoom: 16, pitch: 60, speed: 1.2, essential: true });
    } else {
      originMarker.current.setLngLat([origin.lng, origin.lat]);
    }
  }, [origin]);

  // Render route on the map
  const drawRoute = useCallback((geometry: GeoJSON.LineString, destCoords: { lng: number; lat: number }, destLabel: string) => {
    const map = mapRef.current;
    if (!map) return;

    const applyLayer = () => {
      if (map.getSource('route')) {
        (map.getSource('route') as mapboxgl.GeoJSONSource).setData({ type: 'Feature', geometry, properties: {} });
      } else {
        map.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', geometry, properties: {} },
        });
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          // Mapbox Standard exposes layer slots; 'top' renders the route
          // above 3D buildings so the line is visible when zoomed in.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          slot: 'top' as any,
          paint: {
            'line-color': '#3b82f6',
            'line-width': 6,
            'line-opacity': 0.9,
          },
          layout: { 'line-cap': 'round', 'line-join': 'round' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      }
      if (destMarker.current) destMarker.current.remove();
      // Pin + always-visible label so the driver instantly knows what they're going to.
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px;pointer-events:auto;';
      const label = document.createElement('div');
      label.style.cssText = 'background:#111;color:#fff;font-size:11px;font-weight:700;line-height:1;padding:4px 8px;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,.35);max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      label.textContent = (destLabel || 'Destination').split(',')[0].slice(0, 30);
      const pin = document.createElement('div');
      pin.style.cssText = 'width:22px;height:22px;border-radius:50%;background:#ef4444;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);';
      wrap.appendChild(label);
      wrap.appendChild(pin);
      destMarker.current = new mapboxgl.Marker({ element: wrap, anchor: 'bottom' })
        .setLngLat([destCoords.lng, destCoords.lat])
        .setPopup(new mapboxgl.Popup({ offset: 22 }).setText(destLabel))
        .addTo(map);

      // Fit to route bounds
      const coords = geometry.coordinates as [number, number][];
      if (coords.length > 1) {
        const bounds = coords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coords[0], coords[0]));
        map.fitBounds(bounds, { padding: 80, duration: 900 });
      }
    };

    if (map.isStyleLoaded()) applyLayer();
    else map.once('load', applyLayer);
  }, []);

  const submitTranscript = useCallback(async (text: string, trustedDestination?: { lng: number; lat: number; placeName: string }) => {
    if (!text || !origin) return;
    setBusy(true);
    setErrorMsg(null);
    const nextUserTurn: ConvoTurn = { role: 'user', content: text };
    try {
      const res = await fetch('/api/drive/plan-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          origin,
          conversationHistory: [...history, nextUserTurn].slice(-10),
          currentRoute: activeRouteRef.current,
          vehicle,
          driverPreferences: driverPrefsRef.current || null,
          routeHistory: routeHistoryRef.current.slice(-10),
          trustedDestination: trustedDestination || null,
          language,
        }),
      });
      const data = (await res.json()) as RouteResponse;
      if (!res.ok || data.error) {
        const msg = data.message || data.error || `Route failed (${res.status})`;
        setErrorMsg(msg);
        speak(msg, voiceMode, 'alert', language);
        return;
      }

      const spoken = data.reply || data.summary || '';
      if (spoken) {
        setLastReply(spoken);
        speak(spoken, voiceMode, 'normal', language);
      }

      // Record the turn so follow-ups ("the other one") can resolve.
      setHistory((prev) => {
        const trimmed = [...prev, nextUserTurn];
        if (spoken) trimmed.push({ role: 'assistant', content: spoken });
        return trimmed.slice(-20);
      });

      // Persist any preference update Claude surfaced (e.g., "user likes scenic roads").
      if (data.preferenceUpdate && typeof data.preferenceUpdate === 'string') {
        const prev = driverPrefsRef.current ? driverPrefsRef.current + '\n' : '';
        driverPrefsRef.current = (prev + data.preferenceUpdate).slice(-2000);
        try { localStorage.setItem(LS_PREFS, driverPrefsRef.current); } catch { /* ignore */ }
      }

      // Only actually draw/update the route when Claude asked to navigate.
      if (data.intent === 'navigate' && data.geometry && data.destinationCoords && data.destination) {
        setRoute(data);
        drawRoute(data.geometry, data.destinationCoords, data.destination);
        // Cache the route geometry + per-segment speed limits so the GPS watcher
        // can look up the current limit as the driver moves.
        routeCoordsRef.current = (data.geometry.coordinates as [number, number][]) || [];
        speedLimitsRef.current = data.speedLimits || [];
        stepsRef.current = data.steps || [];
        currentStepIdxRef.current = 0;
        spokenAnnouncementsRef.current.clear();
        setCurrentStepInstruction((data.steps?.[0]?.instruction) || '');
        setTripIntelligence(data.tripIntelligence || null);
        setFollowing(false); // user must hit Drive to enter follow mode
        setBottomExpanded(true); // show pre-trip intelligence panel before driver hits Drive
        setCurrentLimit(null);
        setRouteRating(null); // fresh route, no rating yet
        // Snapshot the original destination + prefs so reroutes target the SAME goal.
        if (data.destinationCoords) {
          originalDestRef.current = {
            lng: data.destinationCoords.lng,
            lat: data.destinationCoords.lat,
            placeName: data.destination || '',
          };
        }
        isRoundTripRef.current = !!data.isRoundTrip;
        if (data.routePreferences) {
          originalRoutePrefsRef.current = {
            avoidHighways: !!data.routePreferences.avoidHighways,
            avoidTolls: !!data.routePreferences.avoidTolls,
            avoidFerries: !!data.routePreferences.avoidFerries,
          };
        }
        routeFetchedAtRef.current = Date.now();
        setLiveMinutes(data.minutes ?? null);
        offRouteSinceRef.current = null;
        lastRerouteAtRef.current = Date.now(); // initial route counts as "just fetched"
        setPendingAlternate(null); // wipe any leftover prompt from a previous trip
        if (typeof data.miles === 'number' && typeof data.minutes === 'number') {
          activeRouteRef.current = {
            destination: data.destination,
            miles: data.miles,
            minutes: data.minutes,
            destinationCoords: data.destinationCoords,
          };
          // Route history append moved to the Drive button — only save trips
          // the user actually committed to driving.
        }
        // Refresh fuel-stop markers.
        const map = mapRef.current;
        if (map) {
          fuelMarkers.current.forEach((m) => m.remove());
          fuelMarkers.current = [];
          (data.fuelStops || []).forEach((stop) => {
            const el = document.createElement('div');
            el.style.cssText = 'width:28px;height:28px;border-radius:50%;background:#f59e0b;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-size:14px;';
            el.textContent = '⛽';
            const popup = new mapboxgl.Popup({ offset: 22 }).setText(`${stop.name} — ${stop.milesFromStart} mi in`);
            const marker = new mapboxgl.Marker({ element: el }).setLngLat([stop.lng, stop.lat]).setPopup(popup).addTo(map);
            fuelMarkers.current.push(marker);
          });

          // Refresh parking markers.
          parkingMarkers.current.forEach((m) => m.remove());
          parkingMarkers.current = [];
          (data.parkingOptions || []).forEach((spot) => {
            const el = document.createElement('div');
            el.style.cssText = 'width:28px;height:28px;border-radius:6px;background:#2563eb;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px;';
            el.textContent = 'P';
            const popup = new mapboxgl.Popup({ offset: 22 }).setText(`${spot.name} — ~${spot.walkingBlocks} block${spot.walkingBlocks === 1 ? '' : 's'} walk`);
            const marker = new mapboxgl.Marker({ element: el }).setLngLat([spot.lng, spot.lat]).setPopup(popup).addTo(map);
            parkingMarkers.current.push(marker);
          });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setErrorMsg(msg);
      speak(msg, voiceMode, 'alert', language);
    } finally {
      setBusy(false);
      // Keep the bottom card expanded after a new plan so the trip
      // intelligence + Drive button are immediately visible. Driver can
      // tap Hide to collapse to the compact ETA pill.
    }
  }, [origin, drawRoute, history, vehicle, voiceMode, language]);

  // Keep the ref pointed at the latest submitTranscript so map event handlers
  // call the up-to-date closure.
  useEffect(() => { submitTranscriptRef.current = submitTranscript; }, [submitTranscript]);

  const pickSuggestion = useCallback(async (s: Suggestion) => {
    const text = s.placeFormatted ? `${s.name}, ${s.placeFormatted}` : s.name;
    setTypedInput('');
    setSuggestions([]);
    setShowSuggestions(false);
    // Retrieve the EXACT coords for this specific suggestion via SearchBox.
    // This bypasses re-geocoding (which can fuzzy-match to the wrong town).
    let trusted: { lng: number; lat: number; placeName: string } | undefined;
    if (s.mapboxId) {
      try {
        const params = new URLSearchParams({
          action: 'retrieve',
          id: s.mapboxId,
          session_token: suggestSessionRef.current,
        });
        const r = await fetch(`/api/drive/suggest?${params.toString()}`);
        if (r.ok) {
          const d = await r.json();
          if (typeof d.lng === 'number' && typeof d.lat === 'number') {
            trusted = { lng: d.lng, lat: d.lat, placeName: d.placeName || text };
          }
        }
      } catch { /* fall back to fuzzy geocode */ }
    }
    submitTranscript(text, trusted);
  }, [submitTranscript]);

  // Pin the new language deps onto startListening below by depending on them.
  void language;

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setErrorMsg('Voice input not supported in this browser. Try Chrome or Safari.');
      return;
    }
    const rec = new SR();
    rec.lang = LANG_LABELS[language].code;
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = '';
    rec.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setTranscript(finalText || interim);
    };
    rec.onerror = (e: any) => {
      setErrorMsg(`Mic error: ${e.error || 'unknown'}`);
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      const text = finalText.trim();
      if (text) submitTranscript(text);
    };
    recognitionRef.current = rec;
    setTranscript('');
    setListening(true);
    rec.start();
  }, [submitTranscript, language]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return (
    <div
      className="relative w-full bg-gray-950 overflow-hidden"
      style={{ height: '100vh' }}
    >
      <div ref={mapContainer} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />

      {/* Vehicle picker — top-left */}
      <div className="absolute top-4 left-4 z-10">
        <VehiclePicker value={vehicle} onChange={setVehicle} />
      </div>

      {/* Speed-limit badge — fixed sizing so the SVG/circle never distort */}
      {currentLimit && (currentLimit.speed != null || currentLimit.none) && (() => {
        const overBy = (() => {
          if (!currentLimit.speed || !driverSpeedMph) return 0;
          const limitMph = currentLimit.unit === 'km/h' ? currentLimit.speed * 0.621371 : currentLimit.speed;
          return driverSpeedMph - limitMph;
        })();
        const over = overBy > 3;
        return (
          <div className="absolute top-16 left-4 z-10 flex items-center gap-2">
            <div
              className={`relative flex-shrink-0 rounded-full border-[3px] shadow-lg bg-white transition-colors ${
                over ? 'border-red-600 animate-pulse' : 'border-black'
              }`}
              style={{ width: 56, height: 56 }}
              aria-label="Current speed limit"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center text-black px-1">
                {currentLimit.none ? (
                  <span className="text-[9px] font-bold leading-tight text-center">NO LIMIT</span>
                ) : (
                  <>
                    <span className="text-[7px] font-bold leading-none">SPEED LIMIT</span>
                    <span className="text-xl font-black leading-none mt-0.5">{currentLimit.speed}</span>
                    <span className="text-[7px] font-semibold leading-none mt-0.5">{currentLimit.unit?.toUpperCase()}</span>
                  </>
                )}
              </div>
            </div>
            {driverSpeedMph != null && driverSpeedMph > 1 && (
              <div className={`px-2 py-1 rounded-lg text-xs font-bold shadow ${over ? 'bg-red-600 text-white' : 'bg-white/90 text-gray-800'}`}>
                {Math.round(driverSpeedMph)} mph
              </div>
            )}
          </div>
        );
      })()}

      {/* Right-side controls — voice toggle + recenter. Pushed BELOW the
          Mapbox NavigationControl (zoom +/- + pitch) so the right edge
          becomes a single clean vertical stack. */}
      <div className="absolute top-44 right-2 z-10 flex flex-col gap-2">
        <button
          onClick={cycleVoiceMode}
          aria-label={`Voice ${voiceMode}`}
          title={`Voice: ${voiceMode}`}
          className="w-11 h-11 rounded-full bg-white/95 backdrop-blur shadow-md border border-gray-200 flex items-center justify-center text-lg hover:bg-white"
        >
          {voiceMode === 'all' ? '🔊' : voiceMode === 'alerts' ? '🔔' : '🔇'}
        </button>
        <button
          onClick={recenterOnDriver}
          disabled={!origin}
          aria-label="Recenter on me"
          title="Recenter on me"
          className="w-11 h-11 rounded-full bg-white/95 backdrop-blur shadow-md border border-gray-200 flex items-center justify-center hover:bg-white disabled:opacity-50"
        >
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </button>
        <button
          onClick={cycleLanguage}
          aria-label={`Language: ${language}`}
          title={`Voice language: ${language === 'de' ? 'Deutsch' : 'English'} — tap to switch`}
          className="w-11 h-11 rounded-full bg-white/95 backdrop-blur shadow-md border border-gray-200 flex items-center justify-center hover:bg-white text-base font-bold text-gray-800"
        >
          {LANG_LABELS[language].flag}
        </button>
        <button
          onClick={clearStoredPreferences}
          aria-label="Clear saved preferences"
          title="Clear saved preferences and trip history"
          className="w-11 h-11 rounded-full bg-white/95 backdrop-blur shadow-md border border-gray-200 flex items-center justify-center hover:bg-white text-lg"
        >
          🧹
        </button>
      </div>

      {/* Top status pill — only shown when there's NO active route (locating, error). Once a route is set, the bottom card carries the info instead. */}
      {!route?.summary && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 max-w-[60vw]">
          {locationError && (
            <div className="px-3 py-1.5 rounded-full bg-amber-500/90 text-white text-xs font-medium shadow-lg truncate">
              {locationError}
            </div>
          )}
          {!locationError && !origin && (
            <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-gray-700 text-xs shadow-lg">
              Locating you…
            </div>
          )}
        </div>
      )}

      {/* Transient transcript ('what I just heard you say') and errors only.
          The assistant's reply is no longer shown as a floating pill —
          it lives inside the bottom card's conversation log instead. */}
      {(transcript || errorMsg || ratingToast) && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-10 max-w-[92vw] flex flex-col gap-2 items-center pointer-events-none"
          style={{ bottom: bottomExpanded ? 180 : 110 }}
        >
          {errorMsg && (
            <div className="px-4 py-3 rounded-xl text-sm font-medium shadow-lg bg-red-600 text-white max-w-md text-center">
              {errorMsg}
            </div>
          )}
          {!errorMsg && transcript && (
            <div className="px-4 py-2 rounded-xl text-sm font-medium shadow-lg bg-white/95 backdrop-blur text-gray-900 max-w-md text-center">
              &ldquo;{transcript}&rdquo;
            </div>
          )}
          {ratingToast && (
            <div className="px-4 py-2 rounded-xl text-sm font-medium shadow-lg bg-gray-900/90 text-white max-w-md text-center">
              {ratingToast}
            </div>
          )}
        </div>
      )}

      {/* Active turn-by-turn banner (top center, only while following) */}
      {following && currentStepInstruction && !pendingAlternate && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 max-w-[88vw]">
          <div className="px-4 py-2 rounded-2xl bg-blue-600/95 backdrop-blur text-white shadow-xl text-center">
            <p className="text-sm font-semibold leading-tight">{currentStepInstruction}</p>
          </div>
        </div>
      )}

      {/* Faster-route prompt (top center, takes priority over the maneuver banner) */}
      {following && pendingAlternate && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 max-w-[92vw] w-[min(92vw,520px)]">
          <div className="rounded-2xl bg-amber-500/95 backdrop-blur text-white shadow-xl p-3">
            <p className="text-sm font-semibold leading-tight mb-1">⚡ Faster route — saves {pendingAlternate.savesMin} min</p>
            <p className="text-xs opacity-90 leading-snug truncate mb-2">via {pendingAlternate.alt.summary}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={switchToAlternate}
                className="flex-1 py-2 rounded-lg bg-white text-amber-700 font-bold text-sm"
              >
                Switch
              </button>
              <button
                type="button"
                onClick={() => setPendingAlternate(null)}
                className="px-4 py-2 rounded-lg bg-white/20 text-white font-medium text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom card — collapsible. Collapsed shows ETA/distance; expanded shows input + mic. */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-[min(92vw,520px)] transition-opacity ${
          busy ? 'opacity-40 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Always-visible: route summary chip / planning state — also acts as expand toggle when collapsed */}
        {route?.summary && !bottomExpanded && (
          <div className="w-full mb-2 flex gap-2 items-stretch">
            <button
              type="button"
              onClick={() => setBottomExpanded(true)}
              className="flex-1 min-w-0 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur shadow-xl border border-gray-200 flex items-center justify-between gap-3 text-left"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-gray-900">
                  <span className="text-base font-bold">{liveMinutes ?? route.minutes} min</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-sm font-medium text-gray-700">{route.miles} mi</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{route.destination}</p>
              </div>
              <span className="text-xs text-blue-600 font-medium flex-shrink-0 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" /></svg>
                Search
              </span>
            </button>
            {/* Drive / Stop button — Drive enters follow mode, Stop ends the trip entirely */}
            <button
              type="button"
              onClick={() => {
                if (following) {
                  endTrip();
                } else {
                  saveRouteToHistory();
                  setFollowing(true);
                  recenterOnDriver();
                  if (stepsRef.current[0]?.instruction) {
                    speak(stepsRef.current[0].instruction, voiceMode, 'alert', language);
                  }
                }
              }}
              className={`px-5 py-2.5 rounded-2xl shadow-xl text-sm font-bold transition-colors flex-shrink-0 ${
                following
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {following ? 'Stop' : 'Drive'}
            </button>
          </div>
        )}

        {/* Expanded: collapse handle, route summary line if any, input + mic */}
        {bottomExpanded && (
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-gray-200 p-3">
            {route?.summary && (
              <>
                <button
                  type="button"
                  onClick={() => setBottomExpanded(false)}
                  className="w-full flex items-center justify-between gap-2 mb-2 px-1"
                >
                  <div className="min-w-0 text-left">
                    <span className="text-sm font-semibold text-gray-900">{liveMinutes ?? route.minutes} min · {route.miles} mi</span>
                    <p className="text-[11px] text-gray-500 truncate">{route.destination}</p>
                  </div>
                  <span className="text-[11px] text-gray-400 flex-shrink-0">Hide ▾</span>
                </button>
                {/* Rate-this-route row — feeds back into Claude's driverPreferences */}
                <div className="flex items-center justify-end gap-2 mb-2 px-1">
                  <button
                    type="button"
                    onClick={() => rateCurrentRoute('love')}
                    aria-label="Save as favorite"
                    className={`text-base px-2 py-1 rounded-lg transition-colors ${routeRating === 'love' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    {routeRating === 'love' ? '❤️' : '🤍'}
                  </button>
                  <button
                    type="button"
                    onClick={() => rateCurrentRoute('up')}
                    aria-label="Like this route"
                    className={`text-base px-2 py-1 rounded-lg transition-colors ${routeRating === 'up' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-green-600'}`}
                  >
                    👍
                  </button>
                  <button
                    type="button"
                    onClick={() => rateCurrentRoute('down')}
                    aria-label="Dislike this route"
                    className={`text-base px-2 py-1 rounded-lg transition-colors ${routeRating === 'down' ? 'bg-gray-200 text-gray-700' : 'text-gray-400 hover:text-gray-700'}`}
                  >
                    👎
                  </button>
                </div>
              </>
            )}

            {/* Conversation log — last few turns so the driver can see context */}
            {history.length > 0 && (
              <div className="mb-3 max-h-32 overflow-y-auto space-y-1.5 px-1">
                {history.slice(-6).map((turn, i) => (
                  <div key={`${i}-${turn.role}`} className={`text-xs leading-snug ${turn.role === 'user' ? 'text-gray-900 font-medium' : 'text-blue-700'}`}>
                    <span className="text-gray-400 mr-1">{turn.role === 'user' ? 'You:' : 'Au7o:'}</span>
                    {turn.content}
                  </div>
                ))}
              </div>
            )}

            {/* Trip Intelligence — Au7o's eyes-forward analysis of the planned route */}
            {(tripIntelligence && (tripIntelligence.suggestions.length > 0 || tripIntelligence.delayWarning || tripIntelligence.breakRecommendation) || route?.fuelNeeded) && (
              <div className="mb-3 p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide mb-1.5">💡 Trip plan</p>
                {route?.isRoundTrip && (
                  <p className="text-xs text-gray-700 mb-1.5 leading-snug">🔄 Round trip — distance + ETA include the return leg</p>
                )}
                {(route?.routePreferences?.avoidHighways || route?.routePreferences?.avoidTolls || route?.routePreferences?.avoidFerries) && (
                  <p className="text-xs text-gray-700 mb-1.5 leading-snug">
                    🛣️ Routed to avoid {[
                      route.routePreferences.avoidHighways && 'highways',
                      route.routePreferences.avoidTolls && 'tolls',
                      route.routePreferences.avoidFerries && 'ferries',
                    ].filter(Boolean).join(', ')}
                  </p>
                )}
                {route?.fuelNeeded && (
                  <p className="text-xs text-gray-700 mb-1.5 leading-snug">
                    ⛽ ≈ {route.fuelNeeded.gallons} gal needed
                    {route.fuelNeeded.tankPercent != null ? ` (~${route.fuelNeeded.tankPercent}% of tank)` : ''}
                    {' '}at {route.fuelNeeded.mpgUsed} mpg combined
                  </p>
                )}
                {tripIntelligence?.delayWarning && (
                  <p className="text-xs text-amber-800 mb-1.5 leading-snug">⚠️ {tripIntelligence.delayWarning}</p>
                )}
                {tripIntelligence?.breakRecommendation && (
                  <p className="text-xs text-gray-700 mb-1.5 leading-snug">☕ {tripIntelligence.breakRecommendation}</p>
                )}
                {tripIntelligence?.suggestions.map((s, i) => (
                  <p key={i} className="text-xs text-gray-700 mb-1 leading-snug">• {s}</p>
                ))}
              </div>
            )}

            {/* Drive + Clear when route exists and we're not yet following */}
            {route?.summary && !following && (
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={endTrip}
                  className="px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-base font-semibold shadow-sm"
                  aria-label="Clear route"
                  title="Clear this route and start over"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveRouteToHistory();
                    setFollowing(true);
                    recenterOnDriver();
                    if (stepsRef.current[0]?.instruction) {
                      speak(stepsRef.current[0].instruction, voiceMode, 'alert', language);
                    }
                    setBottomExpanded(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-base font-bold shadow"
                >
                  Drive →
                </button>
              </div>
            )}
            {/* Autocomplete suggestions dropdown — appears above the input */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="mb-2 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden max-h-72 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s.mapboxId || `${s.name}-${s.placeFormatted}`}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickSuggestion(s)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                    {s.placeFormatted && <p className="text-[11px] text-gray-500 truncate">{s.placeFormatted}</p>}
                  </button>
                ))}
              </div>
            )}
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const text = typedInput.trim();
                if (!text || busy || !origin) return;
                setTypedInput('');
                setShowSuggestions(false);
                submitTranscript(text);
              }}
            >
              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                placeholder="Type or speak a destination"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                disabled={busy || !origin}
                // 16px font prevents iOS Safari from auto-zooming on focus.
                style={{ fontSize: 16 }}
                className="flex-1 min-w-0 bg-gray-50 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none disabled:opacity-50 border border-gray-100"
              />
              <button
                type="submit"
                disabled={!typedInput.trim() || busy || !origin}
                aria-label="Send destination"
                className="w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                disabled={busy || !origin}
                aria-label={listening ? 'Stop listening' : 'Start voice input'}
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  listening ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:opacity-40`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
                  <path d="M19 11a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7 7 0 006 6.92V21a1 1 0 102 0v-3.08A7 7 0 0019 11z" />
                </svg>
              </button>
            </form>
            <p className="text-[11px] text-gray-400 text-center mt-2">
              {busy ? 'Planning…' : listening ? 'Listening — tap mic to stop' : route?.summary ? 'Tap “Hide ▾” to minimize' : 'Type a destination or tap the mic'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
