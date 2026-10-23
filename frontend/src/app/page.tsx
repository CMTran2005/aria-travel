"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchPOIs } from "@/lib/api";
import { User } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import { POI } from "@/components/map/MapView";

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

    loadPOIs();

    return () => subscription.unsubscribe();
  }, []);

  const loadPOIs = async (cat?: string) => {
    try {
      setLoading(true);
      const res = await fetchPOIs("Hội An", cat === "all" ? undefined : cat);
      setPois(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedPOI(res.data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    loadPOIs(cat);
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
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
            Sprint 2 • Map & POIs
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">
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
              className="text-sm font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm"
            >
              Đăng nhập / Đăng ký
            </Link>
          )}
        </div>
      </header>

      {/* Main Exploration Section: Split View POI List & Leaflet Map */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-blue-600 mb-1">
              Khám phá thực địa • Hội An
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bản đồ tương tác các điểm tham quan (POIs)
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Dữ liệu địa lý thực tế được lấy từ OpenStreetMap và lưu trữ trong Supabase PostGIS.
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
                className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition ${
                  categoryFilter === cat.id
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
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    selectedPOI?.id === poi.id
                      ? "bg-blue-50/60 border-blue-500 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-base">
                      {poi.name}
                    </h3>
                    <span className="text-xs font-bold text-amber-600 whitespace-nowrap">
                      ★ {poi.rating || 4.5}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {poi.address || "Hội An, Quảng Nam"}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      ⏱ {poi.avg_duration_minutes || 45} phút
                    </span>
                    <span className="font-semibold text-emerald-700">
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
              onSelectPOI={(poi) => setSelectedPOI(poi)}
              center={
                selectedPOI
                  ? [selectedPOI.latitude, selectedPOI.longitude]
                  : [15.8800, 108.3300]
              }
              zoom={selectedPOI ? 15 : 14}
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
