"use client";

import React from "react";
import {
  X,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Sparkles,
  ExternalLink,
  Compass,
  Tag,
  Navigation
} from "lucide-react";
import { POI } from "@/components/map/MapView";
import { getCategoryLabel, formatPoiCost } from "@/lib/formatters";
import { useAppSettings } from "@/context/AppSettingsContext";

interface PoiDetailModalProps {
  poi: (POI & { ai_reason?: string; ai_score?: number }) | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToDay?: (poi: POI) => void;
}

// Visual category headers with curated gradients & icons
const CATEGORY_THEMES: Record<string, { gradient: string; label: string }> = {
  cafe: { gradient: "from-amber-600 to-orange-700", label: "Cà phê & Đồ uống" },
  restaurant: { gradient: "from-emerald-600 to-teal-800", label: "Ẩm thực & Nhà hàng" },
  tourism: { gradient: "from-blue-600 to-indigo-800", label: "Điểm tham quan nổi bật" },
  beach: { gradient: "from-cyan-500 to-blue-700", label: "Bãi biển & Nghỉ dưỡng" },
  historic: { gradient: "from-amber-700 to-yellow-900", label: "Di tích lịch sử & Văn hóa" },
  museum: { gradient: "from-purple-600 to-indigo-900", label: "Bảo tàng & Nghệ thuật" },
  temple: { gradient: "from-red-600 to-rose-800", label: "Điểm tâm linh & Đền chùa" },
  park: { gradient: "from-green-600 to-emerald-800", label: "Công viên & Thiên nhiên" },
  marketplace: { gradient: "from-orange-600 to-rose-700", label: "Chợ truyền thống & Mua sắm" },
};

export default function PoiDetailModal({
  poi,
  isOpen,
  onClose,
  onAddToDay,
}: PoiDetailModalProps) {
  const { t, lang, currency } = useAppSettings();

  if (!isOpen || !poi) return null;

  const cleanCat = (poi.category || "")
    .toLowerCase()
    .replace(/^(amenity=|tourism=|historic=|leisure=)/, "")
    .trim();

  const themeConfig = CATEGORY_THEMES[cleanCat] || {
    gradient: "from-slate-700 to-slate-900",
    label: getCategoryLabel(poi.category, lang),
  };

  const costInfo = formatPoiCost(poi.avg_cost_usd, poi.category, lang, currency);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${poi.name} ${poi.address || poi.city || ""}`
  )}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visual Header Banner */}
        <div className={`relative p-6 bg-gradient-to-br ${themeConfig.gradient} text-white`}>
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-xs transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-2 pr-8">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs border border-white/30 text-white">
              {getCategoryLabel(poi.category, lang)}
            </span>

            {poi.rating && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400/90 text-amber-950 flex items-center gap-1 shadow-2xs">
                <Star className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
                <span>{poi.rating}</span>
              </span>
            )}

            {poi.ai_score && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/80 text-white flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>AI Score: {poi.ai_score}</span>
              </span>
            )}
          </div>

          {/* POI Name */}
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug drop-shadow-xs">
            {poi.name}
          </h2>

          {/* City / Address */}
          <p className="text-xs text-white/80 mt-1.5 flex items-center gap-1.5 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-white/90" />
            <span>{poi.address || `${poi.city || "Việt Nam"}`}</span>
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Cost card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                {t("Dự toán chi phí", "Estimated Cost")}
              </span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-emerald-400">
                {costInfo.fullText}
              </p>
            </div>

            {/* Duration card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                {t("Thời gian trải nghiệm", "Recommended Duration")}
              </span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>~{poi.avg_duration_minutes || 60} {t("phút", "mins")}</span>
              </p>
            </div>
          </div>

          {/* AI Reason Insight Card */}
          {poi.ai_reason && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 dark:from-slate-800 dark:via-blue-950/30 dark:to-slate-800 border border-blue-100 dark:border-blue-900/50 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{t("Gợi ý từ trợ lý AI ARIA", "AI Assistant Recommendation")}</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {poi.ai_reason}
              </p>
            </div>
          )}

          {/* Tags list */}
          {poi.tags && Array.isArray(poi.tags) && poi.tags.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                {t("Thẻ đặc trưng & Phong cách", "Tags & Characteristics")}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {poi.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Address full row */}
          <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-bold text-slate-900 dark:text-slate-200 block mb-0.5">
                {t("Địa chỉ chi tiết", "Full Address")}
              </span>
              <span>{poi.address || `${poi.name}, ${poi.city || "Việt Nam"}`}</span>
              {poi.latitude && poi.longitude && (
                <span className="block text-[11px] text-slate-400 mt-1 font-mono">
                  GPS: {poi.latitude.toFixed(4)}, {poi.longitude.toFixed(4)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-between gap-3">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t("Chỉ đường trên Google Maps", "Open in Google Maps")}</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {onAddToDay && (
            <button
              type="button"
              onClick={() => {
                onAddToDay(poi);
                onClose();
              }}
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t("Thêm vào lịch trình", "Add to Day")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
