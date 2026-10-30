"use client";

import React from "react";
import { Clock, Navigation, MapPin, DollarSign, ArrowDown } from "lucide-react";
import { POI } from "@/components/map/MapView";
import { getCategoryLabel, formatCostVi } from "@/lib/formatters";
import { useAppSettings } from "@/context/AppSettingsContext";

export interface ItineraryItem {
  id?: number;
  poi_id: number;
  poi: POI & { ai_reason?: string };
  visit_order: number;
  planned_start: string;
  planned_end: string;
  travel_time_to_prev_minutes: number;
  travel_distance_meters?: number;
  status: string;
}

export interface ItineraryDay {
  id?: number;
  day_number: number;
  items: ItineraryItem[];
  route_geometry?: [number, number][];
}

interface DayTimelineProps {
  day: ItineraryDay;
  selectedPOI: POI | null;
  onSelectPOI: (poi: POI) => void;
}

export default function DayTimeline({
  day,
  selectedPOI,
  onSelectPOI,
}: DayTimelineProps) {
  const { t, lang, currency } = useAppSettings();

  if (!day || !day.items || day.items.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
        {t("Chưa có địa điểm nào được lên lịch cho ngày này.", "No locations scheduled for this day.")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {day.items.map((item, index) => {
        const isSelected = selectedPOI?.id === item.poi.id;

        return (
          <React.Fragment key={item.id || `${item.poi_id}-${index}`}>
            {/* Travel segment connector from previous POI */}
            {index > 0 && (
              <div className="flex items-center gap-3 py-1 px-4 text-xs font-medium text-slate-500">
                <div className="w-8 flex justify-center">
                  <div className="h-6 w-0.5 bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                  <Navigation className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>
                    {t("Di chuyển", "Travel")} ~{item.travel_time_to_prev_minutes} {t("phút", "min")}
                    {item.travel_distance_meters
                      ? ` (${(item.travel_distance_meters / 1000).toFixed(1)} km)`
                      : ""}
                  </span>
                </div>
              </div>
            )}

            {/* POI Schedule Card */}
            <div
              onClick={() => onSelectPOI(item.poi)}
              className={`p-4 rounded-2xl border transition cursor-pointer ${
                isSelected
                  ? "bg-blue-50/50 dark:bg-blue-950/30 border-blue-600 dark:border-blue-500 shadow-sm ring-1 ring-blue-600 dark:ring-blue-500"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Number Badge */}
                <div
                  className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center shrink-0 text-sm ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-900 dark:bg-slate-700 text-white"
                  }`}
                >
                  {item.visit_order}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {item.poi.name}
                    </h4>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900 shrink-0">
                      {getCategoryLabel(item.poi.category, lang)}
                    </span>
                  </div>

                  {/* Time Window */}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900">
                      <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>
                        {item.planned_start} – {item.planned_end}
                      </span>
                    </span>
                    <span>•</span>
                    <span>
                      {item.poi.avg_duration_minutes || 60} {t("phút trải nghiệm", "min experience")}
                    </span>
                  </div>

                  {/* AI Reason / Note if any */}
                  {item.poi.ai_reason && (
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 line-clamp-2 leading-relaxed">
                      {item.poi.ai_reason}
                    </p>
                  )}

                  {/* Footer details */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 truncate max-w-[220px]">
                      <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="truncate">
                        {item.poi.address || t("Hội An, Quảng Nam", "Hoi An, Vietnam")}
                      </span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">
                      {formatCostVi(item.poi.avg_cost_usd, lang, item.poi.category, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
