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
  Printer,
  CheckCircle,
} from "lucide-react";
import MapView, { POI } from "@/components/map/MapView";
import DayTimeline, { ItineraryDay } from "@/components/timeline/DayTimeline";
import { fetchTripDetail } from "@/lib/api";

export default function TripDetailPage() {
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

  useEffect(() => {
    if (!tripId) return;

    setLoading(true);
    fetchTripDetail(tripId)
      .then((data) => {
        setTrip(data);
        if (data.days && data.days.length > 0 && data.days[0].items.length > 0) {
          setSelectedPOI(data.days[0].items[0].poi);
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || "Không thể tải thông tin chuyến đi.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tripId]);

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
        <div className="p-4 rounded-full bg-rose-100 text-rose-600 mb-4">
          <MapPin className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Không tìm thấy chuyến đi</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md">{errorMsg || "Chuyến đi này có thể không tồn tại hoặc đã bị xóa."}</p>
        <a
          href="/plan"
          className="mt-5 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
        >
          Tạo chuyến đi mới
        </a>
      </div>
    );
  }

  const days: ItineraryDay[] = trip.days || [];
  const currentDay = days[selectedDayIdx] || null;

  // Map POIs with visit order
  const mapPOIs: (POI & { visit_order?: number })[] = currentDay
    ? currentDay.items.map((item) => ({
        ...item.poi,
        visit_order: item.visit_order,
      }))
    : [];

  const dayCenter: [number, number] =
    mapPOIs.length > 0
      ? [mapPOIs[0].latitude, mapPOIs[0].longitude]
      : [15.8800, 108.3300];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <a
            href="/plan"
            className="text-slate-500 hover:text-slate-900 transition flex items-center gap-1 text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kế hoạch</span>
          </a>
          <span className="text-slate-300">|</span>
          <span className="text-xl font-black text-blue-600 tracking-tight">ARIA</span>
          <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lộ trình đã tối ưu (Greedy Baseline)</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
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
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {trip.title || `Lịch trình du lịch ${trip.city}`}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Ngân sách: ${trip.budget_usd || 100}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="capitalize">{trip.preferences?.group_type || "Cặp đôi"}</span>
            </div>
          </div>
        </div>

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
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedDayIdx === idx ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-600"
                }`}
              >
                {d.items?.length || 0} điểm
              </span>
            </button>
          ))}
        </div>

        {/* Split Grid: Timeline on Left, Map on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Timeline */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Trình tự lịch trình Ngày {currentDay?.day_number || 1}</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                Sắp xếp theo thứ tự tối ưu
              </span>
            </div>

            {currentDay ? (
              <DayTimeline
                day={currentDay}
                selectedPOI={selectedPOI}
                onSelectPOI={(poi) => setSelectedPOI(poi)}
              />
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                Chưa có dữ liệu ngày này.
              </div>
            )}
          </div>

          {/* Right Column: Interactive Map with Route */}
          <div className="lg:col-span-7 sticky top-24">
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between px-2 pt-1">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Bản đồ lộ trình Ngày {currentDay?.day_number || 1}</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Google Maps Road Layer • OSRM Routing
                </span>
              </div>

              <div className="h-[600px] w-full rounded-xl overflow-hidden border border-slate-100">
                <MapView
                  pois={mapPOIs}
                  selectedPOI={selectedPOI}
                  onSelectPOI={(poi) => setSelectedPOI(poi)}
                  center={dayCenter}
                  zoom={14}
                  routeGeometry={currentDay?.route_geometry}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
