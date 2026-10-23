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
const useMap = dynamic(
  () => import("react-leaflet").then((mod) => mod.useMap),
  { ssr: false }
);

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
  center?: [number, number];
  zoom?: number;
}

// Subcomponent to smoothly pan map when selected POI changes or bounds update
import { useMap as useLeafletMap } from "react-leaflet";

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useLeafletMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2, easeLinearity: 0.25 });
  }, [center, zoom, map]);
  return null;
}

export default function MapView({
  pois,
  selectedPOI,
  onSelectPOI,
  center = [15.8775, 108.3285], // Exact heart of Hoi An Ancient Town
  zoom = 15,
}: MapViewProps) {
  const [mounted, setMounted] = useState(false);
  const [normalIcon, setNormalIcon] = useState<any>(null);
  const [selectedIcon, setSelectedIcon] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    import("leaflet").then((L) => {
      // 1. Sleek Minimalist Pin: Thanh đứng + vòng tròn trên đầu (không có khung to cồng kềnh)
      const normal = L.divIcon({
        className: "aria-pin-clean",
        html: `
          <div style="position: relative; width: 14px; height: 26px; display: flex; flex-direction: column; align-items: center;">
            <!-- Vòng tròn trên đầu -->
            <div style="
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #2563eb;
              border: 2px solid #ffffff;
              box-shadow: 0 2px 6px rgba(37,99,235,0.45);
            "></div>
            <!-- Thanh kim chỉ xuống điểm cắm -->
            <div style="
              width: 2px;
              height: 14px;
              background: #2563eb;
              border-radius: 1px;
            "></div>
          </div>
        `,
        iconSize: [14, 26],
        iconAnchor: [7, 26],   // Đáy thanh kim chạm đúng tọa độ
        popupAnchor: [0, -26], // Popup hiển thị ngay trên đỉnh vòng tròn
      });

      // 2. Selected Pin: Màu đỏ hồng nổi bật khi click vào
      const active = L.divIcon({
        className: "aria-pin-active",
        html: `
          <div style="position: relative; width: 16px; height: 30px; display: flex; flex-direction: column; align-items: center;">
            <div style="
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: #e11d48;
              border: 2px solid #ffffff;
              box-shadow: 0 0 10px rgba(225,29,72,0.6);
            "></div>
            <div style="
              width: 2px;
              height: 16px;
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

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[450px] bg-slate-100 flex items-center justify-center text-slate-400 font-medium">
        Đang tải bản đồ tương tác...
      </div>
    );
  }

  // Focus directly on selected POI or Hoi An ancient town center
  const activeCenter: [number, number] = selectedPOI
    ? [selectedPOI.latitude, selectedPOI.longitude]
    : center;

  const activeZoom = selectedPOI ? 16 : zoom;

  return (
    <div className="w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
      <MapContainer
        center={activeCenter}
        zoom={activeZoom}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", minHeight: "450px" }}
      >
        <MapController center={activeCenter} zoom={activeZoom} />

        {/* OpenStreetMap standard basemap (100% free, no key required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pois.map((poi) => {
          const isSelected = selectedPOI?.id === poi.id;
          return (
            <Marker
              key={poi.id}
              position={[poi.latitude, poi.longitude]}
              icon={(isSelected ? selectedIcon : normalIcon) || undefined}
              eventHandlers={{
                click: () => onSelectPOI && onSelectPOI(poi),
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
