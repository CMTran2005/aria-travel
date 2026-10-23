"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

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
      // 1. Sleek Minimalist Needle Pin
      const normal = L.divIcon({
        className: "aria-pin-clean",
        html: `
          <div style="position: relative; width: 12px; height: 24px; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: #2563eb;
              border: 2px solid #ffffff;
              box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            "></div>
            <div style="
              width: 1.5px;
              height: 14px;
              background: #2563eb;
              border-radius: 1px;
            "></div>
          </div>
        `,
        iconSize: [12, 24],
        iconAnchor: [6, 24],
        popupAnchor: [0, -24],
      });

      // 2. Selected Pin (Màu đỏ hồng nổi bật)
      const active = L.divIcon({
        className: "aria-pin-active",
        html: `
          <div style="position: relative; width: 16px; height: 30px; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="
              width: 13px;
              height: 13px;
              border-radius: 50%;
              background: #e11d48;
              border: 2.5px solid #ffffff;
              box-shadow: 0 0 10px rgba(225,29,72,0.6);
            "></div>
            <div style="
              width: 2px;
              height: 17px;
              background: #e11d48;
              border-radius: 1px;
            "></div>
          </div>
        `,
        iconSize: [16, 30],
        iconAnchor: [8, 30],
        popupAnchor: [0, -30],
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
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
              📍 <span className="text-blue-600 font-bold">{selectedPOI.name}</span>
            </span>
            <button
              onClick={() => setIsPickingMode(!isPickingMode)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-sm ${
                isPickingMode
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isPickingMode ? "🎯 Click vào Map để gán tọa độ" : "🎯 Bấm map để đặt vị trí"}
            </button>
          </>
        ) : (
          <span className="text-xs text-slate-500 font-medium">
            Chọn 1 địa điểm bên trái để căn chỉnh tọa độ
          </span>
        )}
        {saving && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Đang lưu DB...
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
                    <span className="text-[11px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {poi.category.replace("amenity=", "")}
                    </span>
                    {poi.rating && (
                      <span className="text-xs font-semibold text-amber-600">
                        ★ {poi.rating}
                      </span>
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
                    <div className="mt-2 text-[11px] text-blue-700 bg-blue-50 p-1.5 rounded border border-blue-200">
                      💡 <b>Mẹo:</b> Bạn có thể kéo ghim này hoặc dùng nút <b>"Bấm map để đặt vị trí"</b> ở góc trên!
                    </div>
                  )}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>⏱ {poi.avg_duration_minutes || 45} phút</span>
                    <span className="font-semibold text-emerald-700">
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
