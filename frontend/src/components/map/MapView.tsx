"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { MapPin, Crosshair, Star, Clock, DollarSign, Info } from "lucide-react";

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

// Subcomponent to smoothly pan map when selected POI changes
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.0, easeLinearity: 0.25 });
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

export default function MapView({
  pois,
  selectedPOI,
  onSelectPOI,
  onUpdateCoordinates,
  center = [15.8775, 108.3285],
  zoom = 15,
}: MapViewProps) {
  const [mounted, setMounted] = useState(false);
  const [normalIcon, setNormalIcon] = useState<any>(null);
  const [selectedIcon, setSelectedIcon] = useState<any>(null);
  const [isPickingMode, setIsPickingMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    import("leaflet").then((L) => {
      // 1. Sleek Minimalist Needle Pin (SVG sạch sẽ, đơn sắc, chuyên nghiệp)
      // 1. Clean Location Pin SVG (Màu than chì #1e293b tối giản, dễ nhìn, chuẩn bản đồ)
      const normal = L.divIcon({
        className: "aria-location-pin",
        html: `
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="28" viewBox="0 0 24 24" fill="#1e293b" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); cursor: pointer;">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
            <circle cx="12" cy="10" r="3" fill="#ffffff" stroke="none"/>
          </svg>
        `,
        iconSize: [22, 28],
        iconAnchor: [11, 28], // Mũi nhọn chạm đúng tọa độ
        popupAnchor: [0, -28],
      });

      // 2. Active Location Pin SVG (Màu xanh dương #2563eb khi được chọn)
      const active = L.divIcon({
        className: "aria-location-pin-active",
        html: `
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="34" viewBox="0 0 24 24" fill="#2563eb" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 3px 8px rgba(37,99,235,0.6)); cursor: pointer;">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
            <circle cx="12" cy="10" r="3" fill="#ffffff" stroke="none"/>
          </svg>
        `,
        iconSize: [26, 34],
        iconAnchor: [13, 34],
        popupAnchor: [0, -34],
      });

      setNormalIcon(normal);
      setSelectedIcon(active);
    });
  }, []);

  // Handle 1-click on map to pick coordinate
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

  // Handle dragging
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
      {/* Floating Toolbar ở góc trên bên phải: 1-Click đặt vị trí */}
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

        {/* Clean Google Maps Roadmap Basemap (100% Free, max clarity) */}
        <TileLayer
          attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          maxZoom={20}
        />

        {pois.map((poi) => {
          const isSelected = selectedPOI?.id === poi.id;
          return (
            <Marker
              key={`${poi.id}-${poi.latitude}-${poi.longitude}`}
              position={[poi.latitude, poi.longitude]}
              draggable={isSelected}
              icon={(isSelected ? selectedIcon : normalIcon) || undefined}
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
