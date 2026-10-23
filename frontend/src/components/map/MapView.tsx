"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet components to avoid Next.js SSR window errors
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

export default function MapView({
  pois,
  selectedPOI,
  onSelectPOI,
  center = [15.8800, 108.3300], // Hoi An Ancient Town
  zoom = 14,
}: MapViewProps) {
  const [mounted, setMounted] = useState(false);
  const [leafletIcon, setLeafletIcon] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Custom SVG Icon for clean editorial aesthetic (No default broken blue icons)
    import("leaflet").then((L) => {
      const customIcon = L.divIcon({
        className: "custom-poi-pin",
        html: `
          <div style="
            background: #2563eb;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(37,99,235,0.4);
            border: 2px solid white;
          ">
            📍
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });
      setLeafletIcon(customIcon);
    });
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[450px] bg-slate-100 flex items-center justify-center text-slate-400 font-medium">
        Đang tải bản đồ tương tác...
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", minHeight: "450px" }}
      >
        {/* CartoDB Positron: Ultra-clean modern basemap */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {pois.map((poi) => (
          <Marker
            key={poi.id}
            position={[poi.latitude, poi.longitude]}
            icon={leafletIcon || undefined}
            eventHandlers={{
              click: () => onSelectPOI && onSelectPOI(poi),
            }}
          >
            <Popup className="aria-poi-popup">
              <div className="p-1 max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
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
                  <span className="font-medium text-emerald-600">
                    {poi.avg_cost_usd === 0 ? "Miễn phí" : `$${poi.avg_cost_usd}`}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
