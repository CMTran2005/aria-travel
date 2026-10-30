"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  badge?: string;
  desc?: string;
}

export interface CustomSelectGroup {
  label: string;
  options: CustomSelectOption[];
}

interface CustomSelectProps {
  label?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options?: CustomSelectOption[];
  groups?: CustomSelectGroup[];
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({
  label,
  icon,
  value,
  onChange,
  options,
  groups,
  placeholder = "Chọn một mục...",
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find selected item
  let selectedOption: CustomSelectOption | undefined;
  if (options) {
    selectedOption = options.find((o) => o.value === value);
  } else if (groups) {
    for (const g of groups) {
      const match = g.options.find((o) => o.value === value);
      if (match) {
        selectedOption = match;
        break;
      }
    }
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 shadow-xs ${
          isOpen
            ? "border-blue-600 ring-2 ring-blue-600/20 bg-white dark:bg-slate-900"
            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100/70 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <span className="text-blue-600 dark:text-blue-400 shrink-0">{icon}</span>}
          <div className="truncate">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate block">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu Modal/Popper */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-[9999] max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {groups ? (
            groups.map((group, gIdx) => (
              <div key={group.label} className={gIdx > 0 ? "border-t border-slate-100 dark:border-slate-800 mt-1 pt-1" : ""}>
                <div className="px-3.5 py-1.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/70 dark:bg-slate-800/40">
                  {group.label}
                </div>
                {group.options.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left transition flex items-center justify-between text-xs font-semibold ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{opt.label}</span>
                          {opt.badge && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded font-normal">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        {opt.desc && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5 font-normal">
                            {opt.desc}
                          </p>
                        )}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          ) : options ? (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left transition flex items-center justify-between text-xs font-semibold ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="truncate block">{opt.label}</span>
                    {opt.desc && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5 font-normal">
                        {opt.desc}
                      </p>
                    )}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                </button>
              );
            })
          ) : null}
        </div>
      )}

    </div>
  );
}
