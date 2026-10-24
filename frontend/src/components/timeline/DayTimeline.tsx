"use client";

import React from "react";
import { Clock, Navigation, MapPin, DollarSign, ArrowDown } from "lucide-react";
import { POI } from "@/components/map/MapView";
import { getCategoryLabelVi, formatCostVi } from "@/lib/formatters";

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
  if (!day || !day.items || day.items.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
        Chưa có địa điểm nào được lên lịch cho ngày này.
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
                  <div className="h-6 w-0.5 bg-slate-200" />
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 text-[11px] text-slate-600">
                  <Navigation className="w-3 h-3 text-blue-600" />
                  <span>
                    Di chuyển ~{item.travel_time_to_prev_minutes} phút
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
                  ? "bg-blue-50/50 border-blue-600 shadow-sm ring-1 ring-blue-600"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Number Badge */}
                <div
                  className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center shrink-0 text-sm ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  {item.visit_order}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {item.poi.name}
                    </h4>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                      {getCategoryLabelVi(item.poi.category)}
                    </span>
                  </div>

                  {/* Time Window */}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {item.planned_start} – {item.planned_end}
                      </span>
                    </span>
                    <span>•</span>
                    <span>
                      {item.poi.avg_duration_minutes || 60} phút trải nghiệm
                    </span>
                  </div>

                  {/* AI Reason / Note if any */}
                  {item.poi.ai_reason && (
                    <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2 leading-relaxed">
                      {item.poi.ai_reason}
                    </p>
                  )}

                  {/* Footer details */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 truncate max-w-[220px]">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{item.poi.address || "Hội An, Quảng Nam"}</span>
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatCostVi(item.poi.avg_cost_usd)}
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
