"use client";

import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Globe, DollarSign, Settings2, Check } from "lucide-react";
import { useAppSettings } from "@/context/AppSettingsContext";

export default function HeaderSettings() {
  const { theme, toggleTheme, language, setLanguage, currency, setCurrency, t } = useAppSettings();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-1.5" ref={menuRef}>
      {/* Quick Theme Toggle Button */}
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

      {/* Settings Menu Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Settings"
          title="Cài đặt (Ngôn ngữ & Tiền tệ)"
          className={`p-2 rounded-xl transition active:scale-95 border ${
            isOpen
              ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-blue-600 dark:text-blue-400"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          }`}
        >
          <Settings2 className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
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
