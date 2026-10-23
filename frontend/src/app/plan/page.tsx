"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { planTripWithAI } from "@/lib/api";
import { Sparkles, ArrowRight, Compass, Calendar, DollarSign, Users, CheckCircle2, ChevronLeft } from "lucide-react";

export default function PlanPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [city, setCity] = useState("Hội An");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const samplePrompts = [
    "Tôi muốn đi Hội An 2 ngày cùng bạn gái, thích ăn vặt đường phố, ngắm hoàng hôn và chụp ảnh quán cafe đẹp, ngân sách khoảng 60 USD.",
    "Chuyến đi 3 ngày cho gia đình có trẻ nhỏ, ưu tiên các hoạt động thư giãn, trải nghiệm văn hóa nhẹ nhàng và bãi biển.",
    "Du lịch bụi solo 1 ngày, muốn khám phá tối đa các di tích lịch sử và ăn đặc sản ngon bổ rẻ.",
  ];

  const handlePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await planTripWithAI(prompt, city);
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi khi lập kế hoạch AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-500 hover:text-slate-900 transition flex items-center gap-1 text-xs font-semibold">
            <ChevronLeft className="w-4 h-4" />
            <span>Trang chủ</span>
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xl font-black text-blue-600 tracking-tight">ARIA</span>
          <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Trip Wizard
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {!result ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Trợ lý lộ trình thông minh
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Mô tả chuyến đi trong mơ của bạn
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                ARIA sẽ phân tích sở thích bằng AI và tự động tuyển chọn những địa điểm phù hợp nhất.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handlePlan} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Điểm đến
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Hội An", "Đà Lạt"].map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCity(c)}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition ${
                        city === c
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Yêu cầu & Sở thích của bạn
                </label>
                <textarea
                  rows={4}
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ví dụ: Tôi muốn đi Hội An 2 ngày cùng bạn gái, thích ăn vặt đường phố, ngắm hoàng hôn và chụp ảnh quán cafe đẹp, ngân sách khoảng 60 USD..."
                  className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Sample Prompts */}
              <div>
                <span className="block text-xs font-semibold text-slate-400 mb-2">
                  Gợi ý câu lệnh mẫu:
                </span>
                <div className="space-y-2">
                  {samplePrompts.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(s)}
                      className="w-full text-left p-2.5 text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                    >
                      💡 {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>AI đang phân tích sở thích & chấm điểm POI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Lập kế hoạch với AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Results View */
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Phân tích thành công
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  Đề xuất kế hoạch: {result.city} ({result.num_days} ngày)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Đã tạo bản thảo chuyến đi #{result.trip_id?.slice(0, 8) || "draft"}
                </p>
              </div>

              <button
                onClick={() => setResult(null)}
                className="text-xs font-bold px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
              >
                Tạo chuyến đi khác
              </button>
            </div>

            {/* Extracted Intent Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Thời gian
                </span>
                <p className="text-base font-bold text-slate-900 mt-1">
                  {result.intent?.num_days || result.num_days} Ngày
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Ngân sách
                </span>
                <p className="text-base font-bold text-slate-900 mt-1">
                  ${result.intent?.budget_usd || 60}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Nhóm đi
                </span>
                <p className="text-base font-bold text-slate-900 mt-1 capitalize">
                  {result.intent?.group_type || "Cặp đôi"}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" /> Phong cách
                </span>
                <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                  {result.intent?.travel_style?.join(", ") || "Ẩm thực, ngắm cảnh"}
                </p>
              </div>
            </div>

            {/* Top Recommended POIs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Địa điểm được AI chấm điểm cao nhất
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {result.recommended_pois?.length || 0} địa điểm được chọn lọc
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.recommended_pois?.map((poi: any, idx: number) => (
                  <div
                    key={poi.id || idx}
                    className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 transition space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">
                          {poi.name}
                        </h4>
                        <span className="text-[11px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {poi.category?.replace("amenity=", "")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-extrabold">
                        <span>★ {poi.ai_score || 8.5}</span>
                        <span className="text-[10px] text-blue-400 font-normal">/10</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {poi.address || "Hội An, Quảng Nam"}
                    </p>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="italic">{poi.ai_reason}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span>⏱ {poi.avg_duration_minutes || 45} phút</span>
                      <span className="font-semibold text-slate-900">
                        {poi.avg_cost_usd === 0 ? "Miễn phí" : `$${poi.avg_cost_usd}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200 bg-white">
        ARIA — Adaptive Route Intelligence Assistant © 2026 • AI Engine Powered by Groq & LangChain
      </footer>
    </div>
  );
}
