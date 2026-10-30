"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme = "light" | "dark";
export type Language = "vi" | "en";
export type Currency = "VND" | "USD";

interface AppSettingsContextType {
  theme: Theme;
  language: Language;
  /** Shorthand alias for `language` — use with formatters that accept "vi" | "en" */
  lang: Language;
  currency: Currency;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  formatMoney: (amountInVnd: number) => string;
  t: (viText: string, enText: string) => string;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [language, setLanguageState] = useState<Language>("vi");
  const [currency, setCurrencyState] = useState<Currency>("VND");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read saved preferences from localStorage
    const savedTheme = localStorage.getItem("aria_theme") as Theme | null;
    const savedLang = localStorage.getItem("aria_lang") as Language | null;
    const savedCurrency = localStorage.getItem("aria_currency") as Currency | null;

    if (savedTheme) {
      setThemeState(savedTheme);
      applyThemeClass(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setThemeState(initialTheme);
      applyThemeClass(initialTheme);
    }

    if (savedLang) setLanguageState(savedLang);
    if (savedCurrency) setCurrencyState(savedCurrency);

    setMounted(true);
  }, []);

  const applyThemeClass = (newTheme: Theme) => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (newTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("aria_theme", newTheme);
    applyThemeClass(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("aria_lang", lang);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem("aria_currency", curr);
  };

  // Helper format money according to current currency setting
  const formatMoney = (amountInVnd: number): string => {
    if (!amountInVnd || amountInVnd <= 0) {
      return language === "vi" ? "Miễn phí" : "Free";
    }

    if (currency === "USD") {
      const usd = amountInVnd / 25000;
      return `$${usd.toLocaleString("en-US", {
        minimumFractionDigits: usd % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })}`;
    }

    // Default VND
    if (amountInVnd >= 1_000_000_000) {
      const b = amountInVnd / 1_000_000_000;
      return `${b.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} ${language === "vi" ? "tỷ ₫" : "B VND"}`;
    }
    if (amountInVnd >= 1_000_000) {
      const tr = amountInVnd / 1_000_000;
      return `${tr % 1 === 0 ? tr : tr.toFixed(1)} ${language === "vi" ? "triệu ₫" : "M VND"}`;
    }
    return `${amountInVnd.toLocaleString("vi-VN")} ₫`;
  };

  // Helper translation string
  const t = (viText: string, enText: string): string => {
    return language === "en" ? enText : viText;
  };

  return (
    <AppSettingsContext.Provider
      value={{
        theme,
        language,
        lang: language,
        currency,
        setTheme,
        toggleTheme,
        setLanguage,
        setCurrency,
        formatMoney,
        t,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within an AppSettingsProvider");
  }
  return context;
}
