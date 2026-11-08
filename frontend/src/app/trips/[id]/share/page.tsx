"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  Users,
  Compass,
  MapPin,
  Clock,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  Sparkles,
  Ticket,
  Utensils,
  Car,
  Wallet
} from "lucide-react";
import MapView, { POI } from "@/components/map/MapView";
import DayTimeline, { ItineraryDay } from "@/components/timeline/DayTimeline";
import PoiDetailModal from "@/components/poi/PoiDetailModal";
import { fetchTripDetail } from "@/lib/api";
import { DINING_CATEGORIES, calculateRoadDistanceKm, calculatePolylineDistanceKm } from "@/lib/formatters";
import { useToast } from "@/components/ui/Toast";
import HeaderSettings from "@/components/ui/HeaderSettings";
import { useAppSettings } from "@/context/AppSettingsContext";

export default function SharedTripPage() {
  const params = useParams();
  const tripId = params.id as string;
  const router = useRouter();
  const { t, formatMoney } = useAppSettings();
  const { success } = useToast();

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [inspectPOI, setInspectPOI] = useState<POI | null>(null);
  const [copied, setCopied] = useState(false);

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
        setErrorMsg(err.message || "Không thể tải thông tin lịch trình công khai.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tripId]);

  const days: ItineraryDay[] = trip?.days || [];
  const currentDay = days[selectedDayIdx] || null;

  // Calculate transparent budget breakdown for the selected day
  const dayCostSummary = useMemo(() => {
    if (!currentDay || !currentDay.items || currentDay.items.length === 0) return null;

    let ticketCostUsd = 0;
    let diningCostMinUsd = 0;
    let diningCostMaxUsd = 0;
    let rawMeters = 0;

    currentDay.items.forEach((item) => {
      const rawCost = item.poi?.avg_cost_usd || 0;
      const costUsd = rawCost >= 1000 ? rawCost / 25000 : rawCost;
      const cat = (item.poi?.category || "")
        .toLowerCase()
        .replace(/^(amenity=|tourism=|historic=|leisure=)/, "")
        .trim();

      if (DINING_CATEGORIES.has(cat)) {
        diningCostMinUsd += costUsd;
        diningCostMaxUsd += costUsd * 1.6;
      } else {
        ticketCostUsd += costUsd;
      }

      if (item.travel_distance_meters) {
        rawMeters += item.travel_distance_meters;
      }
    });

    let totalKm = calculatePolylineDistanceKm(currentDay.route_geometry);
    if (totalKm <= 0 && currentDay.items.length > 1) {
      for (let i = 1; i < currentDay.items.length; i++) {
        const prev = currentDay.items[i - 1]?.poi;
        const curr = currentDay.items[i]?.poi;
        if (prev?.latitude && prev?.longitude && curr?.latitude && curr?.longitude) {
          totalKm += calculateRoadDistanceKm(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
        } else if (currentDay.items[i]?.travel_time_to_prev_minutes) {
          totalKm += (currentDay.items[i].travel_time_to_prev_minutes || 10) * 0.4;
        }
      }
    }
    if (totalKm <= 0 && rawMeters > 0) {
      totalKm = rawMeters / 1000;
    }
    const numTrips = Math.max(0, currentDay.items.length - 1);
    if (totalKm <= 0 && numTrips > 0) {
      totalKm = numTrips * 3.5;
    }

    const transitCostVnd = numTrips > 0 ? Math.round((numTrips * 15000 + totalKm * 11000) / 1000) * 1000 : 0;
    const transitCostUsd = transitCostVnd / 25000;

    const totalMinUsd = ticketCostUsd + diningCostMinUsd + transitCostUsd;
    const totalMaxUsd = ticketCostUsd + diningCostMaxUsd + transitCostUsd * 1.15;

    return {
      ticketCostVnd: Math.round((ticketCostUsd * 25000) / 1000) * 1000,
      diningCostMinVnd: Math.round((diningCostMinUsd * 25000) / 1000) * 1000,
      diningCostMaxVnd: Math.round((diningCostMaxUsd * 25000) / 1000) * 1000,
      transitCostVnd,
      totalKm,
      totalMinVnd: Math.round((totalMinUsd * 25000) / 1000) * 1000,
      totalMaxVnd: Math.round((totalMaxUsd * 25000) / 1000) * 1000,
    };
  }, [currentDay]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    success(
      t("Đã sao chép liên kết chia sẻ!", "Share link copied!"),
      t("Gửi link này cho bạn bè hoặc người đồng hành để cùng xem lịch trình.", "Share this link with companions to view the plan.")
    );
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          {t("Đang tải lịch trình chia sẻ...", "Loading shared itinerary...")}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {t("Đang đồng bộ dữ liệu lộ trình và điểm đến từ ARIA.", "Syncing route and POIs from ARIA.")}
        </p>
      </div>
    );
  }

  if (errorMsg || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 max-w-md w-full">
          <h3 className="font-bold text-base mb-1">{t("Không tìm thấy chuyến đi", "Trip not found")}</h3>
          <p className="text-xs">{errorMsg || t("Chuyến đi có thể đã bị xóa hoặc liên kết không hợp lệ.", "Trip may have been deleted or invalid link.")}</p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            {t("Về trang chủ ARIA", "Back to ARIA Home")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Top Navbar */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1 text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t("Trang chủ", "Home")}</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-tight">ARIA</span>
          <span className="text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
            <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t("Bản xem chia sẻ (Public View)", "Public Shared View")}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <HeaderSettings />

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t("Đã chép link", "Copied") : t("Sao chép link", "Copy link")}</span>
          </button>

          <Link
            href={`/trips/${tripId}`}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition"
          >
            <span>{t("Chỉnh sửa", "Edit / Open")}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content Split Screen */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Trip Header Banner */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                {trip.city || t("Việt Nam", "Vietnam")}
              </span>
              <span className="text-xs text-slate-400 font-medium">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {days.length} {t("Ngày khám phá", "Days Exploration")}
              </span>
              <span className="text-xs text-slate-400 font-medium">•</span>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                ARIA AI {t("Tối ưu", "Optimized")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {trip.title || `Lịch trình du lịch ${trip.city}`}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t("Ngân sách", "Budget")}: {formatMoney((trip.budget_usd || 0) * 25000)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t("Ngày", "Day")} {d.day_number}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  selectedDayIdx === idx
                    ? "bg-slate-800 dark:bg-slate-200 text-slate-300 dark:text-slate-700"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}
              >
                {d.items?.length || 0} {t("điểm", "stops")}
              </span>
            </button>
          ))}
        </div>

        {/* Day Budget Breakdown Widget */}
        {dayCostSummary && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                    {t("Dự toán chi tiêu minh bạch", "Transparent Day Budget")} — {t("Ngày", "Day")} {currentDay?.day_number || 1}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t("Phân bổ chi tiết vé tham quan, ăn uống và cước di chuyển ước tính.", "Breakdown of tickets, dining, and estimated transit.")}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Tổng ước tính ngày", "Est. Day Total")}</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {formatMoney(dayCostSummary.totalMinVnd)}
                  {dayCostSummary.totalMaxVnd > dayCostSummary.totalMinVnd && ` – ${formatMoney(dayCostSummary.totalMaxVnd)}`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {/* 1. Ticket */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Ticket className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    {t("Vé vào cổng / Tham quan", "Admission Tickets")}
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                    {dayCostSummary.ticketCostVnd > 0 ? formatMoney(dayCostSummary.ticketCostVnd) : t("Miễn phí", "Free")}
                  </p>
                </div>
              </div>

              {/* 2. Dining */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Utensils className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    {t("Ăn uống & Cà phê", "Dining & Cafe")}
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                    {dayCostSummary.diningCostMinVnd > 0 ? (
                      <>
                        <span className="text-[11px] font-normal text-slate-500">{t("Từ", "From")} </span>
                        {formatMoney(dayCostSummary.diningCostMinVnd)} – {formatMoney(dayCostSummary.diningCostMaxVnd)}
                      </>
                    ) : (
                      t("Tự túc / Không có", "None scheduled")
                    )}
                  </p>
                </div>
              </div>

              {/* 3. Transit */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Car className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    {t("Cước di chuyển ước tính", "Est. Transit Fare")}
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                    {dayCostSummary.transitCostVnd > 0 ? (
                      <>
                        {formatMoney(dayCostSummary.transitCostVnd)}
                        <span className="text-[10px] font-normal text-slate-400 ml-1">
                          (~{dayCostSummary.totalKm.toFixed(1)} km)
                        </span>
                      </>
                    ) : (
                      t("0 ₫ (Tại chỗ)", "0 ₫ (On site)")
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Split View Container: Timeline (Left) & Map (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Read-only Timeline */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{t("Lịch trình chi tiết", "Detailed Schedule")} — {t("Ngày", "Day")} {currentDay?.day_number || 1}</span>
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {currentDay?.items?.length || 0} {t("địa điểm", "locations")}
              </span>
            </div>

            {currentDay ? (
              <DayTimeline
                day={currentDay}
                selectedPOI={selectedPOI}
                onSelectPOI={(poi) => setSelectedPOI(poi)}
                onInspectPOI={(poi) => setInspectPOI(poi)}
              />
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
                {t("Chưa có dữ liệu cho ngày này.", "No schedule for this day.")}
              </div>
            )}
          </div>

          {/* Right Column: Interactive Map View */}
          <div className="lg:col-span-7 sticky top-24">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>{t("Bản đồ hành trình tối ưu (OSRM Routing)", "Optimized Route Map (OSRM Routing)")}</span>
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {t("Click vào điểm để xem thông tin", "Click on stop to view")}
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

      {/* POI Detail Inspection Modal */}
      <PoiDetailModal
        poi={inspectPOI}
        isOpen={!!inspectPOI}
        onClose={() => setInspectPOI(null)}
      />

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        ARIA — Adaptive Route Intelligence Assistant © 2026 • AI Engine Powered by Groq & LangChain
      </footer>
    </div>
  );
}
