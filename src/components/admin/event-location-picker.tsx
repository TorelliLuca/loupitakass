"use client";

import { Loader2, MapPin, Search } from "lucide-react";
import * as maplibregl from "maplibre-gl";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GeocodeResult } from "@/lib/geocoding/nominatim";

const radius = { borderRadius: "0.5rem" } as const;
const DEFAULT_CENTER: [number, number] = [7.6869, 45.0703]; // Torino
const DEFAULT_ZOOM = 11;

/** Stesso stile della mappa pubblica — tile OSM gratuiti. */
const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

type LocationValue = {
  address: string;
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
};

type EventLocationPickerProps = {
  initial?: Partial<LocationValue>;
  disabled?: boolean;
  /** Chiamato quando i campi luogo cambiano (anche da mappa/ricerca). */
  onLocationChange?: () => void;
};

async function searchPlaces(query: string): Promise<GeocodeResult[]> {
  const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { results?: GeocodeResult[] };
  return data.results ?? [];
}

async function reversePlace(
  lat: number,
  lng: number,
): Promise<GeocodeResult | null> {
  const res = await fetch(
    `/api/geocode/reverse?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { result?: GeocodeResult };
  return data.result ?? null;
}

export function EventLocationPicker({
  initial,
  disabled,
  onLocationChange,
}: EventLocationPickerProps) {
  const [address, setAddress] = useState(initial?.address ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [country, setCountry] = useState(initial?.country ?? "");
  const [lat, setLat] = useState<number | null>(initial?.lat ?? null);
  const [lng, setLng] = useState<number | null>(initial?.lng ?? null);
  const skipNotifyRef = useRef(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const skipNextForwardRef = useRef(false);
  const lastForwardQueryRef = useRef("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const forwardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialCoords = useRef({
    lat: initial?.lat ?? null,
    lng: initial?.lng ?? null,
  });

  const applyResult = useCallback((result: GeocodeResult, fromMap = false) => {
    if (fromMap) skipNextForwardRef.current = true;
    lastForwardQueryRef.current = [result.address, result.city, result.country]
      .filter(Boolean)
      .join(", ");
    setAddress(result.address);
    setCity(result.city);
    setCountry(result.country);
    setLat(result.lat);
    setLng(result.lng);
    setSuggestions([]);
    setSearchQuery(result.label);
    setStatus(null);
  }, []);

  const moveMarker = useCallback((nextLat: number, nextLng: number) => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    marker.setLngLat([nextLng, nextLat]);
    if (map.isStyleLoaded()) {
      map.easeTo({ center: [nextLng, nextLat], duration: 450 });
    } else {
      map.setCenter([nextLng, nextLat]);
    }
  }, []);

  const onMarkerSettled = useEffectEvent(
    async (nextLat: number, nextLng: number) => {
      setLat(nextLat);
      setLng(nextLng);
      setGeocoding(true);
      setStatus("Recupero indirizzo…");
      try {
        const result = await reversePlace(nextLat, nextLng);
        if (result) {
          applyResult(result, true);
        } else {
          setStatus("Indirizzo non trovato per questo punto.");
        }
      } catch {
        setStatus("Errore nel reverse geocoding.");
      } finally {
        setGeocoding(false);
      }
    },
  );

  useEffect(() => {
    const el = mapContainer.current;
    if (!el || mapRef.current) return;

    let cancelled = false;
    const startLng = initialCoords.current.lng ?? DEFAULT_CENTER[0];
    const startLat = initialCoords.current.lat ?? DEFAULT_CENTER[1];
    const hasCoords =
      initialCoords.current.lat != null && initialCoords.current.lng != null;

    try {
      const map = new maplibregl.Map({
        container: el,
        style: MAP_STYLE,
        center: [startLng, startLat],
        zoom: hasCoords ? 15 : DEFAULT_ZOOM,
      });

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right",
      );

      const marker = new maplibregl.Marker({
        draggable: true,
        color: "#c4a574",
      })
        .setLngLat([startLng, startLat])
        .addTo(map);

      marker.on("dragend", () => {
        const { lng: mLng, lat: mLat } = marker.getLngLat();
        void onMarkerSettled(mLat, mLng);
      });

      map.on("click", (e) => {
        marker.setLngLat(e.lngLat);
        void onMarkerSettled(e.lngLat.lat, e.lngLat.lng);
      });

      map.on("error", (e) => {
        console.error("[admin/map]", e.error);
        if (!cancelled) {
          setMapError("Impossibile caricare la mappa OSM.");
        }
      });

      const resize = () => {
        if (!cancelled) map.resize();
      };
      requestAnimationFrame(resize);
      map.once("load", () => {
        resize();
        if (!cancelled) setMapReady(true);
      });

      const ro = new ResizeObserver(resize);
      ro.observe(el);

      mapRef.current = map;
      markerRef.current = marker;

      return () => {
        cancelled = true;
        ro.disconnect();
        marker.remove();
        map.remove();
        mapRef.current = null;
        markerRef.current = null;
        setMapReady(false);
      };
    } catch (error) {
      console.error("[admin/map] init", error);
      setMapError("Errore nell’inizializzazione della mappa.");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init mappa una sola volta; onMarkerSettled è useEffectEvent
  }, []);

  useEffect(() => {
    if (!mapReady || lat == null || lng == null) return;
    moveMarker(lat, lng);
  }, [lat, lng, mapReady, moveMarker]);

  useEffect(() => {
    if (skipNotifyRef.current) {
      skipNotifyRef.current = false;
      return;
    }
    onLocationChange?.();
  }, [address, city, country, lat, lng, onLocationChange]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const q = searchQuery.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }

    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        setSuggestions(await searchPlaces(q));
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (skipNextForwardRef.current) {
      skipNextForwardRef.current = false;
      return;
    }
    if (forwardTimer.current) clearTimeout(forwardTimer.current);

    const cityTrim = city.trim();
    const addressTrim = address.trim();
    if (cityTrim.length < 2 && addressTrim.length < 3) return;

    const query = [addressTrim, cityTrim, country.trim()]
      .filter(Boolean)
      .join(", ");
    if (query.length < 4 || query === lastForwardQueryRef.current) return;

    forwardTimer.current = setTimeout(async () => {
      setGeocoding(true);
      setStatus("Aggiorno coordinate da città/indirizzo…");
      try {
        const results = await searchPlaces(query);
        const best = results[0];
        if (!best) {
          setStatus("Nessuna coordinata trovata per questo indirizzo.");
          return;
        }
        lastForwardQueryRef.current = query;
        skipNextForwardRef.current = true;
        setLat(best.lat);
        setLng(best.lng);
        if (!country.trim() && best.country) setCountry(best.country);
        moveMarker(best.lat, best.lng);
        setStatus(null);
      } catch {
        setStatus("Errore nel geocoding.");
      } finally {
        setGeocoding(false);
      }
    }, 700);

    return () => {
      if (forwardTimer.current) clearTimeout(forwardTimer.current);
    };
  }, [address, city, country, moveMarker]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="place-search">Cerca luogo (Nominatim / OSM)</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="place-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Es. Piazza Castello, Torino"
            disabled={disabled}
            className="h-10 pl-9"
            style={radius}
            autoComplete="off"
          />
          {(searching || geocoding) && (
            <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-brand-brass" />
          )}
          {suggestions.length > 0 ? (
            <ul
              className="absolute z-20 mt-1 max-h-56 w-full overflow-auto border bg-card py-1 shadow-lg ring-1 ring-foreground/10"
              style={radius}
            >
              {suggestions.map((item) => (
                <li key={`${item.lat}-${item.lng}-${item.label}`}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      applyResult(item, true);
                      moveMarker(item.lat, item.lng);
                      mapRef.current?.easeTo({
                        center: [item.lng, item.lat],
                        zoom: 15,
                        duration: 500,
                      });
                    }}
                  >
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-brand-brass" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          Cerca un indirizzo, oppure trascina il pin sulla mappa. Se scrivi
          città/indirizzo a mano, le coordinate si aggiornano da sole.
        </p>
      </div>

      <div
        className="relative isolate h-72 w-full overflow-hidden bg-muted/40 ring-1 ring-foreground/10 sm:h-80"
        style={radius}
      >
        <div ref={mapContainer} className="absolute inset-0 h-full w-full" />
        {!mapReady && !mapError ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/50">
            <Loader2 className="size-6 animate-spin text-brand-brass" />
          </div>
        ) : null}
        {mapError ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/80 px-4 text-center text-sm text-destructive">
            {mapError}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Indirizzo</Label>
          <Input
            id="address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={disabled}
            className="h-10"
            style={radius}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Città</Label>
          <Input
            id="city"
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={disabled}
            className="h-10"
            style={radius}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Paese</Label>
          <Input
            id="country"
            name="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            disabled={disabled}
            className="h-10"
            style={radius}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lat">Latitudine</Label>
          <Input
            id="lat"
            name="lat"
            type="number"
            step="any"
            value={lat ?? ""}
            readOnly
            className="h-10 bg-muted/40"
            style={radius}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lng">Longitudine</Label>
          <Input
            id="lng"
            name="lng"
            type="number"
            step="any"
            value={lng ?? ""}
            readOnly
            className="h-10 bg-muted/40"
            style={radius}
          />
        </div>
      </div>

      {status ? (
        <p className="text-xs text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
