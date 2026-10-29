"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchPOIs, updatePOILocation } from "@/lib/api";
import { User } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import { Star, Clock, MapPin } from "lucide-react";
import { POI } from "@/components/map/MapView";

const CITIES = [
  { name: "Hội An", lat: 15.8775, lon: 108.3285, zoom: 15 },
  { name: "Đà Lạt", lat: 11.9404, lon: 108.4583, zoom: 14 },
  { name: "Đà Nẵng", lat: 16.0544, lon: 108.2022, zoom: 13 },
];

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">
      Đang tải bản đồ...
    </div>
  ),
});

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("Hội An");
  const [pois, setPois] = useState<POI[]>([]);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    loadPOIs(selectedCity, categoryFilter);

    return () => subscription.unsubscribe();
  }, []);

  const loadPOIs = async (city: string, cat?: string) => {
    try {
      setLoading(true);
      const res = await fetchPOIs(city, cat === "all" ? undefined : cat);
      const data = res.data || [];
      setPois(data);
      if (data.length > 0) {
        setSelectedPOI(data[0]);
      } else {
        setSelectedPOI(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    setSelectedPOI(null);
    loadPOIs(cityName, categoryFilter);
  };

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    loadPOIs(selectedCity, cat);
  };

  const handleUpdateCoordinates = async (poiId: number, lat: number, lng: number) => {
    await updatePOILocation(poiId, lat, lng);
    // Update local state smoothly
    setPois((prev) =>
      prev.map((item) =>
        item.id === poiId ? { ...item, latitude: lat, longitude: lng } : item
      )
    );
    if (selectedPOI && selectedPOI.id === poiId) {
      setSelectedPOI((prev) => (prev ? { ...prev, latitude: lat, longitude: lng } : null));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black text-blue-600 tracking-tight">ARIA</span>
          <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
            Khám phá & Bản đồ
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/plan"
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-sm transition"
          >
            <span>Lập kế hoạch AI</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700 hidden sm:inline">
                {user.user_metadata?.display_name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition shadow-sm"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </header>

      {/* Main Exploration Section: Split View POI List & Leaflet Map */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Khám phá thực địa
              </span>
              <span className="text-xs text-slate-400">•</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {CITIES.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => handleCityChange(c.name)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${
                      selectedCity === c.name
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bản đồ điểm tham quan tại {selectedCity}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Dữ liệu địa lý thực tế được tối ưu hóa cho du lịch và lưu trữ trong Supabase PostGIS.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Tất cả" },
              { id: "tourism", label: "Di tích & Danh thắng" },
              { id: "amenity=restaurant", label: "Ẩm thực" },
              { id: "amenity=cafe", label: "Quán Cafe" },
              { id: "leisure", label: "Giải trí & Nghỉ dưỡng" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition ${categoryFilter === cat.id
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Split View Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: POI Feed */}
          <div className="lg:col-span-5 flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-400">
                Đang tải danh sách địa điểm...
              </div>
            ) : pois.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
                Không tìm thấy địa điểm nào theo bộ lọc này.
              </div>
            ) : (
              pois.map((poi) => (
                <div
                  key={poi.id}
                  onClick={() => setSelectedPOI(poi)}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${selectedPOI?.id === poi.id
                      ? "bg-blue-50/60 border-blue-500 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-base">
                      {poi.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{poi.rating || 4.5}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {poi.address || `${poi.city || selectedCity}, Việt Nam`}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{poi.avg_duration_minutes || 45} phút</span>
                    </span>
                    <span className="font-semibold text-slate-900">
                      {poi.avg_cost_usd === 0 ? "Miễn phí" : `$${poi.avg_cost_usd}`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Leaflet Map */}
          <div className="lg:col-span-7 h-[600px]">
            <MapView
              pois={pois}
              selectedPOI={selectedPOI}
              onSelectPOI={(poi: any) => setSelectedPOI(poi)}
              center={
                selectedPOI
                  ? [selectedPOI.latitude, selectedPOI.longitude]
                  : [
                      CITIES.find((c) => c.name === selectedCity)?.lat || 15.8775,
                      CITIES.find((c) => c.name === selectedCity)?.lon || 108.3285,
                    ]
              }
              zoom={
                selectedPOI
                  ? 16
                  : CITIES.find((c) => c.name === selectedCity)?.zoom || 14
              }
            />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200 bg-white">
        ARIA — Adaptive Route Intelligence Assistant © 2026 • Powered by OpenStreetMap & PostGIS
      </footer>
    </div>
  );
}
