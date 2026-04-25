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
}

/**
 * Pick the most natural-sounding voice the browser exposes. Defaults are
 * usually the most robotic stock voice; OS-installed Enhanced/Neural voices
 * sound dramatically better and we should use them when present.
 */
function pickBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Known-good voice names across iOS, Android, macOS, Windows Edge.
  const preferredNames = [
    'Samantha (Enhanced)', 'Samantha', 'Ava (Enhanced)', 'Ava',
    'Daniel (Enhanced)', 'Daniel', 'Karen (Enhanced)', 'Karen',
    'Moira (Enhanced)', 'Tessa', 'Alex',
    'Google US English', 'Google UK English Female', 'Google UK English Male',
    'Microsoft Aria Online (Natural)', 'Microsoft Guy Online (Natural)',
    'Microsoft Jenny Online (Natural)', 'Microsoft Davis Online (Natural)',
  ];
  const qualityKeywords = ['enhanced', 'premium', 'natural', 'neural', 'siri', 'wavenet'];
  const langs = ['en-US', 'en-GB', 'en'];
  const scored = voices.map((v) => {
    let score = 0;
    if (langs.some((l) => v.lang.startsWith(l))) score += 100;
    if (preferredNames.some((n) => v.name === n)) score += 80;
    else if (preferredNames.some((n) => v.name.includes(n))) score += 50;
    const nameLower = v.name.toLowerCase();
    if (qualityKeywords.some((k) => nameLower.includes(k))) score += 30;
    if (v.localService) score += 10;
    if (v.default) score += 5;
    return { voice: v, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.score > 100 ? scored[0].voice : voices[0];
}

let _cachedVoice: SpeechSynthesisVoice | null = null;
function resolveVoice(): SpeechSynthesisVoice | null {
  if (_cachedVoice) return _cachedVoice;
  _cachedVoice = pickBestVoice();
  return _cachedVoice;
}

function speak(text: string, mode: VoiceMode = 'all', priority: 'alert' | 'normal' = 'normal') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (mode === 'mute') return;
  if (mode === 'alerts' && priority !== 'alert') return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voice = resolveVoice();
    if (voice) utter.voice = voice;
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
  // Active-navigation state: when 'following', the camera tracks the driver and
  // voice maneuvers are spoken at trigger distances.
  const [following, setFollowing] = useState(false);
  const stepsRef = useRef<NavStep[]>([]);
  const currentStepIdxRef = useRef<number>(0);
  const spokenAnnouncementsRef = useRef<Set<string>>(new Set());
  const [currentStepInstruction, setCurrentStepInstruction] = useState<string>('');
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

  const recenterOnDriver = useCallback(() => {
    const map = mapRef.current;
    if (!map || !origin) return;
    map.flyTo({ center: [origin.lng, origin.lat], zoom: 16, pitch: 60, speed: 1.4, essential: true });
  }, [origin]);

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
  }, []);

  const setVehicle = useCallback((v: DriveVehicle | null) => {
    setVehicleState(v);
    try {
      if (v) localStorage.setItem(LS_VEHICLE, JSON.stringify(v));
      else localStorage.removeItem(LS_VEHICLE);
    } catch { /* ignore */ }
  }, []);

  const recognitionRef = useRef<any>(null);

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
        const map = mapRef.current;
        if (map && following) {
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
                  speak(v.announcement, voiceMode, 'alert');
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
      },
      (err) => setLocationError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [following, voiceMode]);

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
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
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
          paint: {
            'line-color': '#3b82f6',
            'line-width': 6,
            'line-opacity': 0.85,
          },
          layout: { 'line-cap': 'round', 'line-join': 'round' },
        });
      }
      if (destMarker.current) destMarker.current.remove();
      const el = document.createElement('div');
      el.style.cssText = 'width:18px;height:18px;border-radius:50%;background:#ef4444;border:3px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.3);';
      destMarker.current = new mapboxgl.Marker({ element: el })
        .setLngLat([destCoords.lng, destCoords.lat])
        .setPopup(new mapboxgl.Popup({ offset: 20 }).setText(destLabel))
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

  const submitTranscript = useCallback(async (text: string) => {
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
        }),
      });
      const data = (await res.json()) as RouteResponse;
      if (!res.ok || data.error) {
        const msg = data.message || data.error || `Route failed (${res.status})`;
        setErrorMsg(msg);
        speak(msg, voiceMode, 'alert');
        return;
      }

      const spoken = data.reply || data.summary || '';
      if (spoken) {
        setLastReply(spoken);
        speak(spoken, voiceMode, 'normal');
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
        if (typeof data.miles === 'number' && typeof data.minutes === 'number') {
          activeRouteRef.current = {
            destination: data.destination,
            miles: data.miles,
            minutes: data.minutes,
          };
          // Append to route history so future "nice drive" asks can avoid repeats.
          const entry = {
            destination: data.destination,
            miles: data.miles,
            minutes: data.minutes,
            at: Date.now(),
          };
          routeHistoryRef.current = [...routeHistoryRef.current, entry].slice(-30);
          try { localStorage.setItem(LS_HISTORY, JSON.stringify(routeHistoryRef.current)); } catch { /* ignore */ }
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
      speak(msg, voiceMode, 'alert');
    } finally {
      setBusy(false);
      // Keep the bottom card expanded after a new plan so the trip
      // intelligence + Drive button are immediately visible. Driver can
      // tap Hide to collapse to the compact ETA pill.
    }
  }, [origin, drawRoute, history, vehicle, voiceMode]);

  const pickSuggestion = useCallback((s: Suggestion) => {
    const text = s.placeFormatted ? `${s.name}, ${s.placeFormatted}` : s.name;
    setTypedInput('');
    setSuggestions([]);
    setShowSuggestions(false);
    submitTranscript(text);
  }, [submitTranscript]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setErrorMsg('Voice input not supported in this browser. Try Chrome or Safari.');
      return;
    }
    const rec = new SR();
    rec.lang = 'en-US';
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
  }, [submitTranscript]);

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
      {following && currentStepInstruction && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 max-w-[88vw]">
          <div className="px-4 py-2 rounded-2xl bg-blue-600/95 backdrop-blur text-white shadow-xl text-center">
            <p className="text-sm font-semibold leading-tight">{currentStepInstruction}</p>
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
                  <span className="text-base font-bold">{route.minutes} min</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-sm font-medium text-gray-700">{route.miles} mi</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{route.destination}</p>
              </div>
              <span className="text-xs text-blue-600 font-medium flex-shrink-0">Plan new</span>
            </button>
            {/* Drive / Stop button — Drive enters follow mode, Stop ends the trip entirely */}
            <button
              type="button"
              onClick={() => {
                if (following) {
                  endTrip();
                } else {
                  setFollowing(true);
                  recenterOnDriver();
                  if (stepsRef.current[0]?.instruction) {
                    speak(stepsRef.current[0].instruction, voiceMode, 'alert');
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
                    <span className="text-sm font-semibold text-gray-900">{route.minutes} min · {route.miles} mi</span>
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

            {/* Drive button when route exists and we're not yet following */}
            {route?.summary && !following && (
              <button
                type="button"
                onClick={() => {
                  setFollowing(true);
                  recenterOnDriver();
                  if (stepsRef.current[0]?.instruction) {
                    speak(stepsRef.current[0].instruction, voiceMode, 'alert');
                  }
                  setBottomExpanded(false);
                }}
                className="w-full mb-3 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-base font-bold shadow"
              >
                Drive →
              </button>
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
