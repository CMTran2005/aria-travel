"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchPOIs, updatePOILocation } from "@/lib/api";
import { User } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import { Star, Clock, MapPin, Compass } from "lucide-react";
import { POI } from "@/components/map/MapView";
import CustomSelect, { CustomSelectGroup } from "@/components/ui/CustomSelect";
import HeaderSettings from "@/components/ui/HeaderSettings";
import { useAppSettings } from "@/context/AppSettingsContext";

const CITY_COORDINATES: Record<string, { lat: number; lon: number; zoom: number }> = {
  "Hội An": { lat: 15.8775, lon: 108.3285, zoom: 15 },
  "Đà Lạt": { lat: 11.9404, lon: 108.4583, zoom: 14 },
  "Đà Nẵng": { lat: 16.0544, lon: 108.2022, zoom: 13 },
  "Huế": { lat: 16.4637, lon: 107.5909, zoom: 14 },
  "Hà Nội": { lat: 21.0285, lon: 105.8542, zoom: 13 },
  "TP. Hồ Chí Minh": { lat: 10.8231, lon: 106.6297, zoom: 13 },
  "Nha Trang": { lat: 12.2388, lon: 109.1967, zoom: 14 },
  "Sa Pa": { lat: 22.3364, lon: 103.8438, zoom: 14 },
  "Ninh Bình": { lat: 20.2506, lon: 105.9745, zoom: 13 },
  "Phú Quốc": { lat: 10.2899, lon: 103.9840, zoom: 12 },
};

const CITY_SELECT_GROUPS: CustomSelectGroup[] = [
  {
    label: "Miền Trung & Di sản",
    options: [
      { value: "Hội An", label: "Hội An", desc: "Phố cổ UNESCO, di sản, ẩm thực" },
      { value: "Đà Nẵng", label: "Đà Nẵng", desc: "Cầu Rồng, biển Mỹ Khê, Sơn Trà" },
      { value: "Huế", label: "Huế", desc: "Cố đô, lăng tẩm hoàng gia, nhã nhạc" },
      { value: "Nha Trang", label: "Nha Trang", desc: "Vịnh biển, lặn ngắm san hô" },
    ],
  },
  {
    label: "Tây Nguyên",
    options: [
      { value: "Đà Lạt", label: "Đà Lạt", desc: "Thành phố ngàn hoa, thung lũng, cafe săn mây" },
    ],
  },
  {
    label: "Miền Bắc",
    options: [
      { value: "Hà Nội", label: "Hà Nội", desc: "Thủ đô nghìn năm văn hiến, 36 phố phường" },
      { value: "Sa Pa", label: "Sa Pa", desc: "Ruộng bậc thang kỳ vĩ, Fansipan" },
      { value: "Ninh Bình", label: "Ninh Bình", desc: "Tràng An non nước hữu tình" },
    ],
  },
  {
    label: "Miền Nam & Đảo",
    options: [
      { value: "TP. Hồ Chí Minh", label: "TP. Hồ Chí Minh", desc: "Đô thị sôi động, mua sắm & ẩm thực" },
      { value: "Phú Quốc", label: "Phú Quốc", desc: "Đảo ngọc nghỉ dưỡng, biển bãi Sao" },
    ],
  },
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
  const { theme, t, formatMoney } = useAppSettings();
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Top Navbar */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">ARIA</span>
          <span className="text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
            {t("Khám phá & Bản đồ", "Explore & Map")}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <HeaderSettings />

          <Link
            href="/plan"
            className="flex items-center gap-1.5 text-xs font-bold w-36 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-sm transition active:scale-95 justify-center text-center shrink-0"
          >
            <span>{t("Lập kế hoạch AI", "AI Travel Planner")}</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">
                {user.user_metadata?.display_name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold w-24 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-center shrink-0"
              >
                {t("Đăng xuất", "Log out")}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold w-24 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white rounded-xl transition shadow-sm justify-center text-center shrink-0"
            >
              {t("Đăng nhập", "Log in")}
            </Link>
          )}
        </div>
      </header>

      {/* Main Exploration Section: Split View POI List & Leaflet Map */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                {t("Khám phá thực địa", "Field Exploration")}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {selectedCity}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("Bản đồ điểm tham quan thực tế", "Interactive POI Map")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t(
                "Dữ liệu địa lý thực tế được tối ưu hóa cho du lịch và lưu trữ trong Supabase PostGIS.",
                "Real geographic points optimized for tourism and stored in Supabase PostGIS."
              )}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", labelVi: "Tất cả", labelEn: "All" },
              { id: "tourism", labelVi: "Di tích & Danh thắng", labelEn: "Attractions" },
              { id: "amenity=restaurant", labelVi: "Ẩm thực", labelEn: "Dining" },
              { id: "amenity=cafe", labelVi: "Quán Cafe", labelEn: "Cafes" },
              { id: "leisure", labelVi: "Giải trí", labelEn: "Leisure" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                  categoryFilter === cat.id
                    ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {t(cat.labelVi, cat.labelEn)}
              </button>
            ))}
          </div>
        </div>

        {/* Split View Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: POI Feed */}
          <div className="lg:col-span-5 flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                {t("Đang tải danh sách địa điểm...", "Loading places...")}
              </div>
            ) : pois.length === 0 ? (
              <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
                {t("Không tìm thấy địa điểm nào theo bộ lọc này.", "No places found for this filter.")}
              </div>
            ) : (
              pois.map((poi) => (
                <div
                  key={poi.id}
                  onClick={() => setSelectedPOI(poi)}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    selectedPOI?.id === poi.id
                      ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {poi.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{poi.rating || 4.5}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {poi.address || `${poi.city || selectedCity}, Việt Nam`}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{poi.avg_duration_minutes || 45} {t("phút", "mins")}</span>
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-emerald-400">
                      {formatMoney((poi.avg_cost_usd || 0) * 25000)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Leaflet Map with integrated City Selector Toolbar */}
          <div className="lg:col-span-7 flex flex-col gap-2.5">
            {/* Map Header Toolbar (Plan A) */}
            <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <div className="text-[10px] uppercase font-bold text-slate-400 leading-tight">
                    {t("Khu vực bản đồ", "Map Location")}
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    {selectedCity} • {pois.length} {t("địa điểm", "places")}
                  </div>
                </div>
              </div>

              {/* City selector dropdown integrated right inside toolbar */}
              <div className="w-56 shrink-0">
                <CustomSelect
                  icon={<MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  value={selectedCity}
                  onChange={handleCityChange}
                  groups={CITY_SELECT_GROUPS}
                  placeholder={t("Chọn thành phố...", "Choose city...")}
                />
              </div>
            </div>

            <div className="h-[550px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
              <MapView
                pois={pois}
                selectedPOI={selectedPOI}
                onSelectPOI={(poi) => setSelectedPOI(poi)}
                center={
                  selectedPOI
                    ? [selectedPOI.latitude, selectedPOI.longitude]
                    : [
                        CITY_COORDINATES[selectedCity]?.lat || 15.8775,
                        CITY_COORDINATES[selectedCity]?.lon || 108.3285,
                      ]
                }
                zoom={
                  selectedPOI
                    ? 16
                    : CITY_COORDINATES[selectedCity]?.zoom || 14
                }
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        ARIA — Adaptive Route Intelligence Assistant © 2026 • Powered by OpenStreetMap & PostGIS
      </footer>

    </div>
  );
}
