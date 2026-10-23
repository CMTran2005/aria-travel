"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-blue-600">ARIA</span>
          <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
            Sprint 1
          </span>
        </div>

        <div>
          {loading ? (
            <div className="w-20 h-8 bg-slate-200 animate-pulse rounded-md" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">
                {user.user_metadata?.display_name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm"
            >
              Đăng nhập / Đăng ký
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
          Lập kế hoạch du lịch thông minh thích ứng theo thời gian thực
        </h1>
        <p className="mt-6 text-lg text-slate-600">
          Kết hợp mô hình ngôn ngữ lớn (LLM) và thuật toán tối ưu đa mục tiêu (OR-Tools) tự động đề xuất lộ trình và điều chỉnh linh hoạt khi thời tiết, tắc đường thay đổi.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
          {user ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium">
              ✅ Đã đăng nhập: <span className="font-bold">{user.email}</span>. Hệ thống đã sẵn sàng cho Sprint 2!
            </div>
          ) : (
            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition"
            >
              Bắt đầu với ARIA
            </Link>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200">
        ARIA — Adaptive Route Intelligence Assistant © 2026
      </footer>
    </div>
  );
}
