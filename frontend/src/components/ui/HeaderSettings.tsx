"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sun,
  Moon,
  Globe,
  DollarSign,
  Settings2,
  Check,
  Compass,
  Trash2,
  Calendar,
  MapPin,
  Plus
} from "lucide-react";
import { useAppSettings } from "@/context/AppSettingsContext";
import { getSavedTrips, removeTripFromHistory, SavedTrip } from "@/lib/tripsHistory";

export default function HeaderSettings() {
  const { theme, toggleTheme, language, setLanguage, currency, setCurrency, t } = useAppSettings();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTripsOpen, setIsTripsOpen] = useState(false);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);

  const settingsRef = useRef<HTMLDivElement>(null);
  const tripsRef = useRef<HTMLDivElement>(null);

  // Load and listen for saved trips updates
  useEffect(() => {
    setSavedTrips(getSavedTrips());

    const handleTripsUpdate = () => {
      setSavedTrips(getSavedTrips());
    };

    window.addEventListener("aria_trips_updated", handleTripsUpdate);
    return () => window.removeEventListener("aria_trips_updated", handleTripsUpdate);
  }, []);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (tripsRef.current && !tripsRef.current.contains(e.target as Node)) {
        setIsTripsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteTrip = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = removeTripFromHistory(id);
    setSavedTrips(updated);
  };

  const formatTripDate = (timestamp: number) => {
    const diffHours = (Date.now() - timestamp) / (1000 * 60 * 60);
    if (diffHours < 1) return t("Vừa xong", "Just now");
    if (diffHours < 24) return t("Hôm nay", "Today");
    const d = new Date(timestamp);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* 1. Quick Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        title={theme === "dark" ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
      >
        {theme === "dark" ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-slate-600" />
        )}
      </button>

      {/* 2. My Trips Menu Dropdown */}
      <div className="relative" ref={tripsRef}>
        <button
          onClick={() => {
            setIsTripsOpen(!isTripsOpen);
            setIsSettingsOpen(false);
          }}
          aria-label="My Trips"
          title={t("Chuyến đi của tôi", "My Trips")}
          className={`px-2.5 py-1.5 rounded-xl transition active:scale-95 border flex items-center gap-1.5 text-xs font-bold ${
            isTripsOpen
              ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400"
              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          }`}
        >
          <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">{t("Chuyến đi", "Trips")}</span>
          {savedTrips.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
              {savedTrips.length}
            </span>
          )}
        </button>

        {isTripsOpen && (
          <div className="absolute right-0 mt-2 w-72 sm:w-80 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-[9999] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {t("Chuyến đi đã lưu", "Saved Trips")}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full font-bold">
                  {savedTrips.length}
                </span>
              </div>
              <Link
                href="/plan"
                onClick={() => setIsTripsOpen(false)}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>{t("Tạo mới", "New")}</span>
              </Link>
            </div>

            {/* Trips List */}
            {savedTrips.length > 0 ? (
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
                {savedTrips.map((st) => (
                  <Link
                    key={st.id}
                    href={`/trips/${st.id}`}
                    onClick={() => setIsTripsOpen(false)}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-800/60 transition flex items-center justify-between gap-2 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100/70 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                          {st.city}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {st.num_days} {t("ngày", "days")}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] text-slate-400">
                          {formatTripDate(st.created_at)}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {st.title}
                      </h5>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteTrip(e, st.id)}
                      title={t("Xóa khỏi lịch sử", "Remove from history")}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 opacity-70 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-xs font-medium">
                  {t("Chưa có chuyến đi nào được lưu.", "No saved trips yet.")}
                </p>
                <Link
                  href="/plan"
                  onClick={() => setIsTripsOpen(false)}
                  className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t("Lập kế hoạch ngay", "Plan a trip now")}</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Settings Menu Dropdown */}
      <div className="relative" ref={settingsRef}>
        <button
          onClick={() => {
            setIsSettingsOpen(!isSettingsOpen);
            setIsTripsOpen(false);
          }}
          aria-label="Settings"
          title="Cài đặt (Ngôn ngữ & Tiền tệ)"
          className={`p-2 rounded-xl transition active:scale-95 border ${
            isSettingsOpen
              ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-blue-600 dark:text-blue-400"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          }`}
        >
          <Settings2 className="w-4 h-4" />
        </button>

        {isSettingsOpen && (
          <div className="absolute right-0 mt-2 w-64 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-[9999] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="text-xs font-bold text-slate-900 dark:text-white mb-2 px-1 flex items-center justify-between">
              <span>{t("Cài đặt hiển thị", "Preferences")}</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase">
                ARIA
              </span>
            </div>

            <div className="space-y-3">
              {/* Language Setting */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t("Ngôn ngữ", "Language")}</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setLanguage("vi")}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      language === "vi"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>Tiếng Việt</span>
                    {language === "vi" && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setLanguage("en")}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      language === "en"
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>English</span>
                    {language === "en" && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Currency Setting */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t("Loại tiền tệ", "Currency")}</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setCurrency("VND")}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      currency === "VND"
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>VND (₫)</span>
                    {currency === "VND" && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setCurrency("USD")}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      currency === "USD"
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>USD ($)</span>
                    {currency === "USD" && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
