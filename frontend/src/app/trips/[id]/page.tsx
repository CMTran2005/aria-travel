"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Calendar,
  DollarSign,
  Users,
  Compass,
  MapPin,
  Clock,
  Sparkles,
  Share2,
  CloudRain,
  Sun,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  X
} from "lucide-react";
import MapView, { POI } from "@/components/map/MapView";
import DayTimeline, { ItineraryDay } from "@/components/timeline/DayTimeline";
import { fetchTripDetail, fetchWeather, replanTrip } from "@/lib/api";
import { formatCostVi, formatVnd } from "@/lib/formatters";
import { supabase } from "@/lib/supabase";

export default function TripDetailPage() {
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

  // Sprint 6: Weather & Real-time Re-planning State
  const [weather, setWeather] = useState<any>(null);
  const [replanning, setReplanning] = useState(false);
  const [replanNotice, setReplanNotice] = useState<{
    explanation: string;
    affected: string[];
    trigger: string;
  } | null>(null);

  useEffect(() => {
    if (!tripId) return;

    setLoading(true);
    fetchTripDetail(tripId)
      .then((data) => {
        setTrip(data);
        if (data.days && data.days.length > 0 && data.days[0].items.length > 0) {
          setSelectedPOI(data.days[0].items[0].poi);
        }
        // Fetch weather for the trip city
        if (data.city) {
          fetchWeather(data.city)
            .then((w) => setWeather(w))
            .catch(() => {});
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || "Không thể tải thông tin chuyến đi.");
      })
      .finally(() => {
        setLoading(false);
      });

    // Supabase Realtime listener for background / multi-device replan updates
    const channel = supabase
      .channel(`trip-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trips",
          filter: `id=eq.${tripId}`,
        },
        () => {
          // Re-fetch trip detail when updated via Realtime
          fetchTripDetail(tripId).then((data) => {
            if (data) setTrip(data);
          }).catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId]);

  // Handle Real-time Re-planning trigger
  const handleTriggerReplan = async (
    triggerType: "weather_rain" | "poi_closed" | "traffic_delay",
    delayMins: number = 45
  ) => {
    if (!tripId || !trip) return;
    setReplanning(true);
    const dayNumber = (selectedDayIdx || 0) + 1;

    try {
      const res = await replanTrip(tripId, triggerType, dayNumber, undefined, delayMins);
      if (res && res.days) {
        // Update local trip days immediately
        setTrip((prev: any) => ({
          ...prev,
          days: res.days,
        }));
        setReplanNotice({
          explanation: res.explanation,
          affected: res.affected_pois || [],
          trigger: triggerType,
        });

        // Set first POI of the updated day
        const currentUpdatedDay = res.days.find((d: any) => d.day_number === dayNumber);
        if (currentUpdatedDay && currentUpdatedDay.items.length > 0) {
          setSelectedPOI(currentUpdatedDay.items[0].poi);
        }
      }
    } catch (err: any) {
      alert(err.message || "Không thể tái lập lịch trình.");
    } finally {
      setReplanning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-slate-800">Đang tải lịch trình chi tiết...</h2>
        <p className="text-xs text-slate-500 mt-1">ARIA đang đồng bộ dữ liệu lộ trình và bản đồ.</p>
      </div>
    );
  }

  if (errorMsg || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-full bg-rose-50 text-rose-600 mb-3 border border-rose-200">
          <ChevronLeft className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Không tìm thấy chuyến đi</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mb-4">
          {errorMsg || "Chuyến đi này có thể đã bị xóa hoặc không hợp lệ."}
        </p>
        <Link
          href="/plan"
          className="text-xs font-bold px-4 py-2 bg-slate-900 text-white rounded-xl shadow-sm"
        >
          Quay lại Lập kế hoạch
        </Link>
      </div>
    );
  }

  const days: ItineraryDay[] = trip.days || [];
  const currentDay = days[selectedDayIdx] || null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link
            href="/plan"
            className="text-slate-500 hover:text-slate-900 transition flex items-center gap-1 text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kế hoạch mới</span>
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xl font-black text-blue-600 tracking-tight">ARIA</span>
          <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-slate-200">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Lộ trình thông minh thích ứng</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Weather Widget Header */}
          {weather && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
              {weather.is_bad_weather ? (
                <CloudRain className="w-4 h-4 text-blue-600 animate-pulse" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span>{weather.city}: {weather.temperature_c}°C, {weather.description}</span>
            </div>
          )}

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: trip.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Đã sao chép liên kết chuyến đi!");
              }
            }}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Chia sẻ</span>
          </button>
        </div>
      </header>

      {/* Main Content Split Screen */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Trip Header Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {trip.city || "Hội An"}
              </span>
              <span className="text-xs text-slate-400 font-medium">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {days.length} Ngày khám phá
              </span>
              <span className="text-xs text-slate-400 font-medium">•</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                OR-Tools TSPTW Tối ưu
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {trip.title || `Lịch trình du lịch ${trip.city}`}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Ngân sách: {formatCostVi(trip.budget_usd)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="capitalize">{trip.preferences?.group_type || "Cặp đôi"}</span>
            </div>
          </div>
        </div>

        {/* Sprint 6: Real-time Re-planning Simulation Bar */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 p-4 rounded-2xl border border-blue-200/70 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">
                Tái lập lịch trình thích ứng thời gian thực (Adaptive Re-planning)
              </h4>
              <p className="text-[11px] text-slate-500">
                Mô phỏng sự cố ngoại cảnh để kích hoạt thuật toán tự điều chỉnh lộ trình cho Ngày {(selectedDayIdx || 0) + 1}:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Trigger 1: Rain */}
            <button
              onClick={() => handleTriggerReplan("weather_rain")}
              disabled={replanning}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-blue-800 border border-blue-200 shadow-2xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <CloudRain className="w-3.5 h-3.5 text-blue-600" />
              <span>Thời tiết xấu (Mưa to)</span>
            </button>

            {/* Trigger 2: Closure */}
            <button
              onClick={() => handleTriggerReplan("poi_closed")}
              disabled={replanning}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-amber-800 border border-amber-200 shadow-2xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Điểm đóng cửa</span>
            </button>

            {/* Trigger 3: Traffic Delay */}
            <button
              onClick={() => handleTriggerReplan("traffic_delay", 45)}
              disabled={replanning}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-purple-800 border border-purple-200 shadow-2xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>Trễ giờ / Tắc đường (+45p)</span>
            </button>
          </div>
        </div>

        {/* Replan Result Banner if recently triggered */}
        {replanNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3 animate-in fade-in duration-200 shadow-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-extrabold uppercase tracking-wide text-emerald-800">
                  Lộ trình đã được tự động tái lập thành công!
                </h5>
                <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                  {replanNotice.explanation}
                </p>
                {replanNotice.affected.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {replanNotice.affected.map((item, idx) => (
                      <span key={idx} className="text-[10px] font-bold bg-white/80 px-2 py-0.5 rounded border border-emerald-300 text-emerald-800">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setReplanNotice(null)}
              className="p-1 text-emerald-600 hover:text-emerald-900 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Day Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {days.map((d, idx) => (
            <button
              key={d.id || idx}
              onClick={() => {
                setSelectedDayIdx(idx);
                if (d.items && d.items.length > 0) {
                  setSelectedPOI(d.items[0].poi);
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                selectedDayIdx === idx
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Ngày {d.day_number}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  selectedDayIdx === idx
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {d.items?.length || 0} điểm
              </span>
            </button>
          ))}
        </div>

        {/* Split Screen Grid: Left = Timeline, Right = Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Day Itinerary Timeline */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Lịch trình chi tiết — Ngày {currentDay?.day_number || 1}</span>
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                {currentDay?.items?.length || 0} địa điểm
              </span>
            </div>

            {currentDay ? (
              <DayTimeline
                day={currentDay}
                selectedPOI={selectedPOI}
                onSelectPOI={(poi) => setSelectedPOI(poi)}
              />
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
                Chưa có dữ liệu cho ngày này.
              </div>
            )}
          </div>

          {/* Right Column: Interactive Map View with Routing */}
          <div className="lg:col-span-7 sticky top-24">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-white">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Bản đồ hành trình tối ưu (OSRM Routing)</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Click vào điểm để xem thông tin
                </span>
              </div>

              <div className="h-[560px] w-full">
                {currentDay && (
                  <MapView
                    pois={currentDay.items.map((it) => ({
                      ...it.poi,
                      visit_order: it.visit_order,
                    }))}
                    selectedPOI={selectedPOI}
                    onSelectPOI={(poi) => setSelectedPOI(poi)}
                    center={
                      selectedPOI
                        ? [selectedPOI.latitude, selectedPOI.longitude]
                        : currentDay.items.length > 0
                        ? [currentDay.items[0].poi.latitude, currentDay.items[0].poi.longitude]
                        : [15.8800, 108.3300]
                    }
                    zoom={14}
                    routeGeometry={currentDay.route_geometry}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200 bg-white">
        ARIA — Adaptive Route Intelligence Assistant © 2026 • AI Engine Powered by Groq & LangChain
      </footer>
    </div>
  );
}
