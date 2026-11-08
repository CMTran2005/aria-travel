"use client";

import React from "react";
import { Wallet, Ticket, Utensils, Car } from "lucide-react";
import { DayBudgetSummary } from "@/lib/budgetCalculator";
import { useAppSettings } from "@/context/AppSettingsContext";

interface DayBudgetWidgetProps {
  dayNumber: number;
  summary: DayBudgetSummary | null;
}

export default function DayBudgetWidget({ dayNumber, summary }: DayBudgetWidgetProps) {
  const { t, formatMoney } = useAppSettings();

  if (!summary) return null;

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>{t("Dự toán chi phí minh bạch", "Transparent Budget Estimate")}</span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                {t("Ngày", "Day")} {dayNumber}
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t(
                "Bóc tách vé tham quan cố định, khoảng ước tính ăn uống và cước di chuyển",
                "Breakdown of fixed tickets, estimated dining range, and transit costs"
              )}
            </p>
          </div>
        </div>

        {/* Total Estimated Range Badge */}
        <div className="flex items-baseline gap-1.5 bg-emerald-50/70 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 self-start sm:self-auto">
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            {t("Dự kiến ngày:", "Est. Day Total:")}
          </span>
          <span className="text-sm font-black text-emerald-900 dark:text-emerald-300">
            ~{formatMoney(summary.totalMinVnd)}
            {summary.totalMaxVnd > summary.totalMinVnd && (
              <span> – {formatMoney(summary.totalMaxVnd)}</span>
            )}
          </span>
        </div>
      </div>

      {/* 3 Component Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Tickets (Fixed) */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Ticket className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              {t("Vé tham quan", "Entrance Tickets")}
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
              {summary.ticketCostVnd > 0 ? formatMoney(summary.ticketCostVnd) : t("Miễn phí", "Free")}
            </p>
          </div>
        </div>

        {/* 2. Dining (Range) */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Utensils className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              {t("Ăn uống & Cà phê", "Dining & Cafe")}
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
              {summary.diningCostMinVnd > 0 ? (
                <>
                  <span className="text-[11px] font-normal text-slate-500">{t("Từ", "From")} </span>
                  {formatMoney(summary.diningCostMinVnd)} – {formatMoney(summary.diningCostMaxVnd)}
                </>
              ) : (
                t("Tự túc / Không có", "None scheduled")
              )}
            </p>
          </div>
        </div>

        {/* 3. Transit Estimate */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Car className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              {t("Cước di chuyển ước tính", "Est. Transit Fare")}
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
              {summary.transitCostVnd > 0 ? (
                <>
                  {formatMoney(summary.transitCostVnd)}
                  <span className="text-[10px] font-normal text-slate-400 ml-1">
                    (~{summary.totalKm.toFixed(1)} km)
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
  );
}

