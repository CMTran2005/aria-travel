"use client";

import { useEffect, useState, useRef } from "react";
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
  id?: number;
  name: string;
  category?: string;
  address?: string;
  city?: string;
  latitude: number;
  longitude: number;
  rating?: number;
  avg_cost_usd?: number;
  avg_duration_minutes?: number;
}

interface MapViewProps {
  selectedPOI?: POI | null;
  onSelectPOI?: (poi: POI) => void;
  onAddPOI?: (poi: POI) => void;
  center?: [number, number];
  zoom?: number;
}

// Subcomponent to smoothly pan map
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2, easeLinearity: 0.25 });
  }, [center, zoom, map]);
  return null;
}

// Click anywhere on map to reverse geocode and pick a location
function MapClickListener({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapView({
  selectedPOI,
  onSelectPOI,
  onAddPOI,
  center = [15.8775, 108.3285],
  zoom = 15,
}: MapViewProps) {
  const [mounted, setMounted] = useState(false);
  const [activeIcon, setActiveIcon] = useState<any>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Active highlighted POI on the map (Single clean pin only)
  const [currentPOI, setCurrentPOI] = useState<POI | null>(selectedPOI || null);
  const [activeCenter, setActiveCenter] = useState<[number, number]>(center);
  const [activeZoom, setActiveZoom] = useState<number>(zoom);
  const searchTimeout = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    import("leaflet").then((L) => {
      // Sleek Needle Pin for the single focused location
      const pin = L.divIcon({
        className: "aria-clean-active-pin",
        html: `
          <div style="position: relative; width: 16px; height: 32px; display: flex; flex-direction: column; align-items: center;">
            <div style="
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: #2563eb;
              border: 2.5px solid #ffffff;
              box-shadow: 0 0 10px rgba(37,99,235,0.6);
            "></div>
            <div style="
              width: 2px;
              height: 18px;
              background: #2563eb;
              border-radius: 1px;
            "></div>
          </div>
        `,
        iconSize: [16, 32],
        iconAnchor: [8, 32],
        popupAnchor: [0, -32],
      });
      setActiveIcon(pin);
    });
  }, []);

  useEffect(() => {
    if (selectedPOI) {
      setCurrentPOI(selectedPOI);
      setActiveCenter([selectedPOI.latitude, selectedPOI.longitude]);
      setActiveZoom(17);
    }
  }, [selectedPOI]);

  // Live search as user types
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!val.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Photon / Nominatim Open Search API (100% Free, no keys required)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            val + " Hội An"
          )}&format=json&limit=5&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "vi,en",
            },
          }
        );
        const data = await res.json();
        setSearchResults(data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const handleSelectSearchResult = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const poi: POI = {
      name: item.name || item.display_name.split(",")[0],
      address: item.display_name,
      category: item.type || "tourism",
      latitude: lat,
      longitude: lon,
      rating: 4.6,
      avg_cost_usd: 0,
      avg_duration_minutes: 45,
    };

    setCurrentPOI(poi);
    setActiveCenter([lat, lon]);
    setActiveZoom(17);
    setShowDropdown(false);
    setSearchQuery(poi.name);
    if (onSelectPOI) onSelectPOI(poi);
  };

  // Reverse geocode when clicking on map
  const handleMapClick = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "vi,en",
          },
        }
      );
      const data = await res.json();
      const poi: POI = {
        name: data.name || data.display_name?.split(",")[0] || "Điểm đã chọn",
        address: data.display_name || `Tọa độ: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        category: data.type || "custom",
        latitude: lat,
        longitude: lng,
        rating: 4.5,
        avg_cost_usd: 0,
        avg_duration_minutes: 45,
      };

      setCurrentPOI(poi);
      setActiveCenter([lat, lng]);
      setActiveZoom(17);
      if (onSelectPOI) onSelectPOI(poi);
    } catch {
      // Fallback
      const poi: POI = {
        name: "Điểm đã chọn",
        address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        latitude: lat,
        longitude: lng,
      };
      setCurrentPOI(poi);
      if (onSelectPOI) onSelectPOI(poi);
    }
  };

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[450px] bg-slate-100 flex items-center justify-center text-slate-400 font-medium">
        Đang tải bản đồ tương tác...
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
      {/* Floating Modern Search Box (Google Maps style) */}
      <div className="absolute top-4 left-4 z-[1000] w-80 max-w-[calc(100%-32px)]">
        <div className="relative">
          <div className="flex items-center bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 px-3.5 py-2.5">
            <span className="text-slate-400 mr-2 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm quán xá, địa danh Hội An..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 focus:outline-none placeholder:text-slate-400"
            />
            {isSearching && (
              <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
            )}
            {searchQuery && !isSearching && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowDropdown(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-200 max-h-60 overflow-y-auto divide-y divide-slate-100 z-[1001]">
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSearchResult(item)}
                  className="p-3 hover:bg-blue-50/70 cursor-pointer transition text-left"
                >
                  <div className="text-xs font-bold text-slate-900 line-clamp-1">
                    {item.name || item.display_name.split(",")[0]}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {item.display_name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <MapContainer
        center={activeCenter}
        zoom={activeZoom}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", minHeight: "450px" }}
      >
        <MapController center={activeCenter} zoom={activeZoom} />
        <MapClickListener onPick={handleMapClick} />

        {/* Clean Google Maps Roadmap Basemap (100% Free, no keys required) */}
        <TileLayer
          attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          maxZoom={20}
        />

        {/* ONLY 1 CLEAN PIN: Chỉ hiển thị duy nhất khi người dùng tìm kiếm hoặc click chọn */}
        {currentPOI && activeIcon && (
          <Marker
            position={[currentPOI.latitude, currentPOI.longitude]}
            icon={activeIcon}
          >
            <Popup className="aria-poi-popup" autoPan={true}>
              <div className="p-1 max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {currentPOI.category?.replace("amenity=", "") || "Địa điểm"}
                  </span>
                  {currentPOI.rating && (
                    <span className="text-xs font-semibold text-amber-600">
                      ★ {currentPOI.rating}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">
                  {currentPOI.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {currentPOI.address || "Hội An, Quảng Nam"}
                </p>

                {onAddPOI && (
                  <button
                    onClick={() => onAddPOI(currentPOI)}
                    className="mt-3 w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <span>+</span> Thêm vào chuyến đi
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
