"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { MapPin, Crosshair, Star, Clock, Info } from "lucide-react";

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

import { useMap, useMapEvents } from "react-leaflet";

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
  pois: POI[];
  selectedPOI?: POI | null;
  onSelectPOI?: (poi: POI) => void;
  onUpdateCoordinates?: (poiId: number, lat: number, lng: number) => Promise<void>;
  center?: [number, number];
  zoom?: number;
}

// Subcomponent to smoothly pan map ONLY when coordinates actually change (avoids shaking on tab focus)
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

// 1-Click listener directly on map to pick coordinate for the selected POI
function MapClickListener({
  isPicking,
  onPick,
}: {
  isPicking: boolean;
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (isPicking) {
        onPick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Flaticon-style SVG Icons embedded for each specific POI category
function getCategoryIconSvg(category: string, isSelected: boolean): string {
  const pinColor = isSelected ? "#2563eb" : "#1e293b";
  const iconColor = "#ffffff";

  // Category specific symbols inside the pin
  let innerSymbol = "";
  
  if (category.includes("restaurant") || category.includes("food")) {
    // 🍴 Utensils / Food
    innerSymbol = `<path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2m0 0v6m3-6v6M6 2v10a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2M15 11v9M8 14v6" stroke="${iconColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  } else if (category.includes("cafe")) {
    // ☕ Coffee cup
    innerSymbol = `<path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8zM6 2v3M10 2v3M14 2v3" stroke="${iconColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  } else if (category.includes("marketplace") || category.includes("shop")) {
    // 🛍️ Shopping bag
    innerSymbol = `<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" stroke="${iconColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  } else if (category.includes("leisure") || category.includes("beach")) {
    // 🌴 Palm / Umbrella / Waves
    innerSymbol = `<path d="M12 2a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9zM12 11v11M8 22h8" stroke="${iconColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  } else {
    // 🏛️ Tourism / Heritage Monument
    innerSymbol = `<path d="m2 7 10-5 10 5M4 10v10M8 10v10M12 10v10M16 10v10M20 10v10M2 20h20" stroke="${iconColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  }

  // Kích thước nhỏ gọn, tinh tế hơn (Điểm thường: 22x30px, Điểm chọn: 26x35px)
  const width = isSelected ? 26 : 22;
  const height = isSelected ? 35 : 30;
  const dropShadow = isSelected
    ? "drop-shadow(0 3px 6px rgba(37,99,235,0.45))"
    : "drop-shadow(0 1.5px 3px rgba(0,0,0,0.25))";

  return `
    <div style="filter: ${dropShadow}; cursor: pointer; transition: transform 0.2s ease;">
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 36 46">
        <!-- Pin Shape -->
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28s18-14.5 18-28c0-9.94-8.06-18-18-18z" fill="${pinColor}" stroke="#ffffff" stroke-width="2"/>
        <!-- Inner Category Symbol (scaled and positioned inside head circle) -->
        <g transform="translate(6, 6) scale(1.0)">
          ${innerSymbol}
        </g>
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
}: MapViewProps) {
  const [mounted, setMounted] = useState(false);
  const [leafletLib, setLeafletLib] = useState<any>(null);
  const [isPickingMode, setIsPickingMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    import("leaflet").then((L) => {
      setLeafletLib(L);
    });
  }, []);

  const createIcon = (category: string, isSelected: boolean) => {
    if (!leafletLib) return undefined;
    const width = isSelected ? 26 : 22;
    const height = isSelected ? 35 : 30;
    return leafletLib.divIcon({
      className: `aria-cat-pin-${isSelected ? "active" : "normal"}`,
      html: getCategoryIconSvg(category, isSelected),
      iconSize: [width, height],
      iconAnchor: [width / 2, height],
      popupAnchor: [0, -height],
    });
  };

  const handleMapClickPick = async (lat: number, lng: number) => {
    if (!selectedPOI || !onUpdateCoordinates) return;
    setSaving(true);
    try {
      await onUpdateCoordinates(selectedPOI.id, Number(lat.toFixed(6)), Number(lng.toFixed(6)));
      setIsPickingMode(false);
    } catch {
      alert("Lỗi khi cập nhật vị trí!");
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = async (poiId: number, e: any) => {
    if (!onUpdateCoordinates) return;
    const { lat, lng } = e.target.getLatLng();
    setSaving(true);
    try {
      await onUpdateCoordinates(poiId, Number(lat.toFixed(6)), Number(lng.toFixed(6)));
    } catch {
      alert("Lỗi khi cập nhật vị trí!");
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
      {/* Floating Toolbar ở góc trên bên phải */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-lg">
        {selectedPOI ? (
          <>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hidden sm:flex">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-900 font-bold max-w-[140px] truncate">{selectedPOI.name}</span>
            </div>
            <button
              onClick={() => setIsPickingMode(!isPickingMode)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm ${
                isPickingMode
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>{isPickingMode ? "Nhấp vào bản đồ để đặt" : "Căn chỉnh vị trí"}</span>
            </button>
          </>
        ) : (
          <span className="text-xs text-slate-500 font-medium">
            Chọn 1 địa điểm để căn chỉnh tọa độ
          </span>
        )}
        {saving && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Đã lưu
          </span>
        )}
      </div>

      <MapContainer
        center={activeCenter}
        zoom={activeZoom}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", minHeight: "450px" }}
      >
        <MapController center={activeCenter} zoom={activeZoom} />
        <MapClickListener isPicking={isPickingMode} onPick={handleMapClickPick} />

        {/* Clean Google Maps Base Tiles WITHOUT Business/POI clutter: lyrs=r (clean road only) */}
        <TileLayer
          attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
          url="https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}"
          maxZoom={20}
        />

        {pois.map((poi) => {
          const isSelected = selectedPOI?.id === poi.id;
          return (
            <Marker
              key={`${poi.id}-${poi.latitude}-${poi.longitude}`}
              position={[poi.latitude, poi.longitude]}
              draggable={isSelected}
              icon={createIcon(poi.category, isSelected)}
              eventHandlers={{
                click: () => onSelectPOI && onSelectPOI(poi),
                dragend: (e) => handleDragEnd(poi.id, e),
              }}
            >
              <Popup className="aria-poi-popup">
                <div className="p-1 max-w-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {poi.category.replace("amenity=", "")}
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
                    {poi.address || "Khu vực phố cổ"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    [{poi.latitude.toFixed(5)}, {poi.longitude.toFixed(5)}]
                  </p>
                  {isSelected && (
                    <div className="mt-2 text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>Có thể kéo thả ghim này hoặc dùng nút <b>Căn chỉnh vị trí</b> ở trên.</span>
                    </div>
                  )}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{poi.avg_duration_minutes || 45} phút</span>
                    </span>
                    <span className="font-semibold text-slate-900">
                      {poi.avg_cost_usd === 0 ? "Miễn phí" : `$${poi.avg_cost_usd}`}
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
