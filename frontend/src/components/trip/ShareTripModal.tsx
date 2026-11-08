"use client";

import React, { useState } from "react";
import { X, Copy, Check, Share2, Globe, ExternalLink, QrCode } from "lucide-react";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useToast } from "@/components/ui/Toast";

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  tripTitle?: string;
  city?: string;
}

export default function ShareTripModal({
  isOpen,
  onClose,
  tripId,
  tripTitle,
  city,
}: ShareTripModalProps) {
  const { t } = useAppSettings();
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/trips/${tripId}/share`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    success(
      t("Đã sao chép liên kết chia sẻ!", "Share link copied!"),
      t("Bất kỳ ai có liên kết này đều có thể xem lịch trình của bạn.", "Anyone with this link can view your itinerary.")
    );
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tripTitle || `Lịch trình du lịch ${city || "Việt Nam"}`,
          text: t("Khám phá lịch trình du lịch thông minh cùng ARIA:", "Explore smart itinerary with ARIA:"),
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {t("Chia sẻ lịch trình", "Share Itinerary")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("Liên kết xem công khai (Không cần đăng nhập)", "Public view link (No login required)")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Public Access Badge Note */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
          <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">
              {t("Chế độ xem công khai (Read-only)", "Public Read-Only Mode")}
            </span>
            <span className="text-[11px] text-emerald-800 dark:text-emerald-400 leading-relaxed">
              {t(
                "Người nhận có thể xem toàn bộ timeline, bản đồ định tuyến OSRM và dự toán chi tiêu minh bạch nhưng không làm thay đổi lịch trình gốc của bạn.",
                "Recipients can view the full timeline, OSRM map routing, and transparent budget without modifying your original itinerary."
              )}
            </span>
          </div>
        </div>

        {/* Copy Link Input Box */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            {t("Đường dẫn xem lịch trình", "Itinerary Link")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 font-mono truncate focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-2xs active:scale-95"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t("Đã chép", "Copied") : t("Sao chép", "Copy")}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t("Xem trước link", "Preview page")}</span>
          </a>

          <button
            type="button"
            onClick={handleNativeShare}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t("Gửi qua ứng dụng...", "Share via app...")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
