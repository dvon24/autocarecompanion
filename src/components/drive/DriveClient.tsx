'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { VehiclePicker, type DriveVehicle } from './VehiclePicker';

const LS_VEHICLE = 'au7o-drive-vehicle';
const LS_PREFS = 'au7o-drive-prefs';
const LS_HISTORY = 'au7o-drive-history';

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

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
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

  const [origin, setOrigin] = useState<{ lng: number; lat: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [busy, setBusy] = useState(false);
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<ConvoTurn[]>([]);
  const [lastReply, setLastReply] = useState<string>('');
  // Active route mirror for the API so Claude can answer "how long is this trip?"
  const activeRouteRef = useRef<ActiveRoute | null>(null);
  // Garage-aware state — persisted to localStorage so no login is needed.
  const [vehicle, setVehicleState] = useState<DriveVehicle | null>(null);
  const driverPrefsRef = useRef<string>('');
  const routeHistoryRef = useRef<Array<{ destination: string; miles: number; minutes: number; at: number }>>([]);

  // Load persisted state once on mount.
  useEffect(() => {
    try {
      const v = localStorage.getItem(LS_VEHICLE);
      if (v) setVehicleState(JSON.parse(v));
      driverPrefsRef.current = localStorage.getItem(LS_PREFS) || '';
      const h = localStorage.getItem(LS_HISTORY);
      if (h) routeHistoryRef.current = JSON.parse(h);
    } catch { /* ignore */ }
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
        setOrigin({ lng: pos.coords.longitude, lat: pos.coords.latitude });
        setLocationError(null);
      },
      (err) => setLocationError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

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
        speak(msg);
        return;
      }

      const spoken = data.reply || data.summary || '';
      if (spoken) {
        setLastReply(spoken);
        speak(spoken);
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
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setErrorMsg(msg);
      speak(msg);
    } finally {
      setBusy(false);
    }
  }, [origin, drawRoute, history, vehicle]);

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

      {/* Top status pill */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 max-w-[92vw]">
        {locationError && (
          <div className="px-4 py-2 rounded-full bg-amber-500/90 text-white text-sm font-medium shadow-lg">
            {locationError}
          </div>
        )}
        {!locationError && !origin && (
          <div className="px-4 py-2 rounded-full bg-white/90 backdrop-blur text-gray-700 text-sm shadow-lg">
            Locating you…
          </div>
        )}
        {route?.summary && (
          <div className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium shadow-lg truncate">
            {route.summary}
          </div>
        )}
      </div>

      {/* Transcript / assistant reply / error banner above the mic */}
      {(transcript || errorMsg || lastReply) && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10 max-w-[92vw] flex flex-col gap-2 items-center">
          {errorMsg && (
            <div className="px-4 py-3 rounded-xl text-sm font-medium shadow-lg bg-red-600 text-white">
              {errorMsg}
            </div>
          )}
          {!errorMsg && transcript && (
            <div className="px-4 py-2 rounded-xl text-sm font-medium shadow-lg bg-white/95 backdrop-blur text-gray-900">
              &ldquo;{transcript}&rdquo;
            </div>
          )}
          {!errorMsg && lastReply && (
            <div className="px-4 py-2 rounded-xl text-sm font-medium shadow-lg bg-blue-600 text-white max-w-md text-center">
              {lastReply}
            </div>
          )}
        </div>
      )}

      {/* Mic button */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <button
          onClick={listening ? stopListening : startListening}
          disabled={busy || !origin}
          aria-label={listening ? 'Stop listening' : 'Start voice input'}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${
            listening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : busy
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
          } disabled:opacity-60`}
        >
          <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
            <path d="M19 11a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7 7 0 006 6.92V21a1 1 0 102 0v-3.08A7 7 0 0019 11z" />
          </svg>
        </button>
        <span className="text-xs text-white/90 font-medium drop-shadow">
          {busy ? 'Planning…' : listening ? 'Listening — tap to stop' : 'Tap and say "Take me to…"'}
        </span>
      </div>
    </div>
  );
}
