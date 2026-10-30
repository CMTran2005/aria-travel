"use client";

import React from "react";
import {
  Clock,
  Navigation,
  MapPin,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Info
} from "lucide-react";
import { POI } from "@/components/map/MapView";
import { getCategoryLabel, formatCostVi, calculateRoadDistanceKm } from "@/lib/formatters";
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
  onInspectPOI?: (poi: POI) => void;
  onMoveItem?: (fromIdx: number, toIdx: number) => void;
  onDeleteItem?: (itemIdx: number) => void;
  onOpenAddModal?: () => void;
}

export default function DayTimeline({
  day,
  selectedPOI,
  onSelectPOI,
  onInspectPOI,
  onMoveItem,
  onDeleteItem,
  onOpenAddModal,
}: DayTimelineProps) {
  const { t, lang, currency } = useAppSettings();

  if (!day || !day.items || day.items.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm space-y-3">
        <p>{t("Chưa có địa điểm nào được lên lịch cho ngày này.", "No locations scheduled for this day.")}</p>
        {onOpenAddModal && (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t("Thêm địa điểm đầu tiên", "Add first location")}</span>
          </button>
        )}
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
            {index > 0 && (() => {
              const prevPOI = day.items[index - 1]?.poi;
              const distKm = item.travel_distance_meters
                ? item.travel_distance_meters / 1000
                : prevPOI?.latitude && prevPOI?.longitude && item.poi?.latitude && item.poi?.longitude
                ? calculateRoadDistanceKm(prevPOI.latitude, prevPOI.longitude, item.poi.latitude, item.poi.longitude)
                : item.travel_time_to_prev_minutes
                ? item.travel_time_to_prev_minutes * 0.4
                : 0;

              return (
                <div className="flex items-center gap-3 py-1 px-4 text-xs font-medium text-slate-500">
                  <div className="w-8 flex justify-center">
                    <div className="h-6 w-0.5 bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                    <Navigation className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>
                      {t("Di chuyển", "Travel")} ~{item.travel_time_to_prev_minutes || Math.round(distKm / 0.4) || 10} {t("phút", "min")}
                      {distKm > 0 ? ` (~${distKm.toFixed(1)} km)` : ""}
                    </span>
                  </div>
                </div>
              );
            })()}

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

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                        {getCategoryLabel(item.poi.category, lang)}
                      </span>

                      {/* Reorder and Delete Actions */}
                      <div
                        className="flex items-center gap-0.5 ml-1 pl-1 border-l border-slate-200 dark:border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {onMoveItem && (
                          <>
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => onMoveItem(index, index - 1)}
                              title={t("Di chuyển lên trước", "Move up")}
                              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === day.items.length - 1}
                              onClick={() => onMoveItem(index, index + 1)}
                              title={t("Di chuyển xuống sau", "Move down")}
                              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {onInspectPOI && (
                          <button
                            type="button"
                            onClick={() => onInspectPOI(item.poi)}
                            title={t("Xem chi tiết", "View details")}
                            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteItem && (
                          <button
                            type="button"
                            onClick={() => onDeleteItem(index)}
                            title={t("Xóa khỏi ngày", "Remove stop")}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
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

      {/* Add POI to this day Button */}
      {onOpenAddModal && (
        <button
          type="button"
          onClick={onOpenAddModal}
          className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:text-blue-400 bg-white/40 dark:bg-slate-900/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition flex items-center justify-center gap-2 text-xs font-bold"
        >
          <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>{t("Thêm địa điểm vào ngày này", "Add location to this day")}</span>
        </button>
      )}
    </div>
  );
}
