"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { Star, Clock, Move, Check, Edit3, X } from "lucide-react";
import { getCategoryLabel, formatCostVi } from "@/lib/formatters";
import { useAppSettings } from "@/context/AppSettingsContext";

// Dynamic imports to prevent SSR window issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

import { useMap } from "react-leaflet";

export interface POI {
  id: number;
  name: string;
  category: string;
  address?: string;
  city?: string;
  latitude: number;
  longitude: number;
  rating?: number;
  avg_cost_usd?: number;
  avg_duration_minutes?: number;
  tags?: string[];
}

interface MapViewProps {
  pois: (POI & { visit_order?: number })[];
  selectedPOI?: POI | null;
  onSelectPOI?: (poi: POI) => void;
  onUpdateCoordinates?: (poiId: number, lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
  routeGeometry?: [number, number][];
}

// Subcomponent to smoothly pan map ONLY when coordinates actually change
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const prevCenterRef = useRef<string>("");

  useEffect(() => {
    const key = `${center[0].toFixed(5)},${center[1].toFixed(5)},${zoom}`;
    if (prevCenterRef.current !== key) {
      prevCenterRef.current = key;
      map.flyTo(center, zoom, { duration: 0.8, easeLinearity: 0.25 });
    }
  }, [center, zoom, map]);

  return null;
}

// Category-specific SVG Pins
function getCategoryIconSvg(category: string, isSelected: boolean, visitOrder?: number): string {
  const pinColor = isSelected ? "#2563eb" : "#0f172a";
  const iconColor = "#ffffff";

  let innerSymbol = "";
  if (visitOrder !== undefined) {
    innerSymbol = `<text x="18" y="24" font-size="14" font-weight="bold" fill="${iconColor}" text-anchor="middle" dominant-baseline="middle">${visitOrder}</text>`;
  } else if (category.includes("restaurant") || category.includes("food")) {
    innerSymbol = `<g transform="translate(6, 6)"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2m0 0v6m3-6v6M6 2v10a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2M15 11v9M8 14v6" stroke="${iconColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
  } else if (category.includes("cafe")) {
    innerSymbol = `<g transform="translate(6, 6)"><path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8zM6 2v3M10 2v3M14 2v3" stroke="${iconColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
  } else if (category.includes("marketplace") || category.includes("shop")) {
    innerSymbol = `<g transform="translate(6, 6)"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" stroke="${iconColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
  } else if (category.includes("leisure") || category.includes("beach")) {
    innerSymbol = `<g transform="translate(6, 6)"><path d="M12 2a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9zM12 11v11M8 22h8" stroke="${iconColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
  } else {
    innerSymbol = `<g transform="translate(6, 6)"><path d="m2 7 10-5 10 5M4 10v10M8 10v10M12 10v10M16 10v10M20 10v10M2 20h20" stroke="${iconColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
  }

  const width = isSelected ? 26 : 22;
  const height = isSelected ? 35 : 30;
  const dropShadow = isSelected
    ? "drop-shadow(0 3px 6px rgba(37,99,235,0.45))"
    : "drop-shadow(0 1.5px 3px rgba(0,0,0,0.25))";

  return `
    <div style="filter: ${dropShadow}; cursor: pointer; transition: transform 0.2s ease;">
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 36 46">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28s18-14.5 18-28c0-9.94-8.06-18-18-18z" fill="${pinColor}" stroke="#ffffff" stroke-width="2"/>
        ${innerSymbol}
      </svg>
    </div>
  `;
}

export default function MapView({
  pois,
  selectedPOI,
  onSelectPOI,
  onUpdateCoordinates,
  center = [15.8775, 108.3285],
  zoom = 15,
  routeGeometry,
}: MapViewProps) {
  const { lang, currency, t } = useAppSettings();
  const [mounted, setMounted] = useState(false);
  const [leafletLib, setLeafletLib] = useState<any>(null);

  // Chế độ chỉnh sửa ghim vị trí (Kéo thả marker)
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingPoiId, setEditingPoiId] = useState<number | null>(null);
  const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string>("");

  // Map lưu vị trí cục bộ của các marker đã bị kéo trong phiên làm việc
  const [movedMarkers, setMovedMarkers] = useState<Record<number, [number, number]>>({});

  useEffect(() => {
    setMounted(true);
    import("leaflet").then((L) => {
      setLeafletLib(L);
    });
  }, []);

  const createIcon = (category: string, isSelected: boolean, visitOrder?: number) => {
    if (!leafletLib) return undefined;
    const width = isSelected ? 26 : 22;
    const height = isSelected ? 35 : 30;
    return leafletLib.divIcon({
      className: `aria-cat-pin-${isSelected ? "active" : "normal"}`,
      html: getCategoryIconSvg(category, isSelected, visitOrder),
      iconSize: [width, height],
      iconAnchor: [width / 2, height],
      popupAnchor: [0, -height],
    });
  };

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[450px] bg-slate-100 flex items-center justify-center text-slate-400 font-medium">
        Đang tải bản đồ tương tác...
      </div>
    );
  }

  const activeCenter: [number, number] = selectedPOI
    ? [selectedPOI.latitude, selectedPOI.longitude]
    : center;

  const activeZoom = selectedPOI ? 16 : zoom;

  const handleSaveCoords = (poiId: number) => {
    if (tempCoords && onUpdateCoordinates) {
      onUpdateCoordinates(poiId, tempCoords.lat, tempCoords.lng);
      setSaveSuccessNotice(`Đã lưu tọa độ mới: ${tempCoords.lat.toFixed(5)}, ${tempCoords.lng.toFixed(5)}`);
      setTimeout(() => setSaveSuccessNotice(""), 3500);
      setEditingPoiId(null);
      setTempCoords(null);
    }
  };

  return (
    <div className="w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative">
      {/* Floating Toolbar: Nút Bật/Tắt chế độ Chỉnh sửa tọa độ */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        {saveSuccessNotice && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-in fade-in duration-200">
            <Check className="w-3.5 h-3.5" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setIsEditMode((prev) => !prev);
            setEditingPoiId(null);
            setTempCoords(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-md transition ${
            isEditMode
              ? "bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-300"
              : "bg-white/95 dark:bg-slate-900/95 hover:bg-white text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
          }`}
          title="Bật tính năng kéo ghim để chỉnh sửa vị trí trên bản đồ"
        >
          {isEditMode ? (
            <>
              <Move className="w-3.5 h-3.5 animate-bounce" />
              <span>Đang bật kéo ghim (Click để tắt)</span>
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Chỉnh sửa vị trí ghim</span>
            </>
          )}
        </button>
      </div>

      <MapContainer
        center={activeCenter}
        zoom={activeZoom}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", minHeight: "450px" }}
      >
        <MapController center={activeCenter} zoom={activeZoom} />

        {/* Mapbox Clean Tiles (or Fallback if no token provided) */}
        {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? (
          <TileLayer
            attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
            url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
            tileSize={512}
            zoomOffset={-1}
            maxZoom={20}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />
        )}

        {/* Route Polyline (Road Path) */}
        {routeGeometry && routeGeometry.length >= 2 && (
          <Polyline
            positions={routeGeometry}
            pathOptions={{
              color: "#2563eb",
              weight: 4,
              opacity: 0.85,
              lineJoin: "round",
            }}
          />
        )}

        {pois.map((poi) => {
          const isSelected = selectedPOI?.id === poi.id;
          const currentPosition: [number, number] = movedMarkers[poi.id] || [poi.latitude, poi.longitude];

          return (
            <Marker
              key={poi.id}
              position={currentPosition}
              draggable={isEditMode}
              icon={createIcon(poi.category, isSelected, poi.visit_order)}
              eventHandlers={{
                click: () => {
                  onSelectPOI && onSelectPOI(poi);
                  setEditingPoiId(poi.id);
                  setTempCoords({ lat: currentPosition[0], lng: currentPosition[1] });
                },
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  setMovedMarkers((prev) => ({
                    ...prev,
                    [poi.id]: [position.lat, position.lng],
                  }));
                  setEditingPoiId(poi.id);
                  setTempCoords({ lat: position.lat, lng: position.lng });
                  if (onSelectPOI) {
                    onSelectPOI({ ...poi, latitude: position.lat, longitude: position.lng });
                  }
                },
              }}
            >
              <Popup className="aria-poi-popup">
                <div className="p-1 max-w-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {getCategoryLabel(poi.category, lang)}
                    </span>
                    {poi.rating && (
                      <div className="flex items-center gap-0.5 text-xs font-semibold text-amber-600">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{poi.rating}</span>
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {poi.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {poi.address || "Khu vực địa phương"}
                  </p>

                  {/* Thông tin tọa độ khi bật chỉnh sửa */}
                  {isEditMode && tempCoords && editingPoiId === poi.id && (
                    <div className="mt-2.5 p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1 mb-1">
                        <Move className="w-3 h-3 text-amber-600" />
                        <span>Tọa độ đã kéo mới:</span>
                      </div>
                      <div className="text-[10px] font-mono text-amber-900 select-all">
                        {tempCoords.lat.toFixed(6)}, {tempCoords.lng.toFixed(6)}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSaveCoords(poi.id)}
                        className="w-full mt-2 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs transition flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Lưu tọa độ thực tế này</span>
                      </button>
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{poi.avg_duration_minutes || 45} {t("phút", "mins")}</span>
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatCostVi(poi.avg_cost_usd, lang, poi.category, currency)}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
