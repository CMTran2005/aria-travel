"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { planTripWithAI } from "@/lib/api";
import {
  Sparkles,
  ArrowRight,
  Compass,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  ChevronLeft,
  PenLine,
  SlidersHorizontal,
  MapPin,
  Clock,
  Star,
  Check
} from "lucide-react";

const VIETNAM_DESTINATIONS = [
  { name: "Hội An", region: "Miền Trung", desc: "Phố cổ hoài niệm, ẩm thực đường phố, làng nghề" },
  { name: "Đà Lạt", region: "Tây Nguyên", desc: "Thành phố sương mù, đồi thông, quán cafe lãng mạn" },
  { name: "Đà Nẵng", region: "Miền Trung", desc: "Thành phố đáng sống, bãi biển Mỹ Khê, bán đảo Sơn Trà" },
  { name: "Hà Nội", region: "Miền Bắc", desc: "36 phố phường, di tích lịch sử ngàn năm, ẩm thực truyền thống" },
  { name: "TP. Hồ Chí Minh", region: "Miền Nam", desc: "Đô thị sôi động, nhịp sống đêm, văn hóa đa dạng" },
  { name: "Phú Quốc", region: "Miền Nam", desc: "Đảo ngọc, bãi sao, hoàng hôn biển, hải sản tươi ngon" },
  { name: "Nha Trang", region: "Miền Trung", desc: "Vịnh biển trong xanh, lặn biển ngắm san hô, tắm bùn khoáng" },
  { name: "Sa Pa", region: "Miền Bắc", desc: "Ruộng bậc thang kỳ vĩ, đỉnh Fansipan, bản làng vùng cao" },
  { name: "Huế", region: "Miền Trung", desc: "Cố đô trầm mặc, lăng tẩm hoàng gia, nhã nhạc cung đình" },
  { name: "Ninh Bình", region: "Miền Bắc", desc: "Tràng An non nước hữu tình, Tam Cốc Bích Động" },
];

const TRAVEL_STYLES = [
  { id: "food", label: "Ẩm thực & Đặc sản" },
  { id: "cultural", label: "Văn hóa & Di tích" },
  { id: "photography", label: "Check-in & Sống ảo" },
  { id: "nature", label: "Thiên nhiên & Cảnh quan" },
  { id: "relaxation", label: "Nghỉ dưỡng & Thư giãn" },
  { id: "adventure", label: "Trải nghiệm & Khám phá" },
];

const GROUP_TYPES = [
  { id: "solo", label: "Đi một mình (Solo)" },
  { id: "couple", label: "Cặp đôi (Couple)" },
  { id: "friends", label: "Nhóm bạn (Friends)" },
  { id: "family", label: "Gia đình (Family)" },
];

export default function PlanPage() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<"builder" | "freetext">("builder");

  // Destination & Trip basic configs
  const [selectedCity, setSelectedCity] = useState("Hội An");
  const [numDays, setNumDays] = useState(2);
  const [budgetUsd, setBudgetUsd] = useState(60);
  const [selectedGroup, setSelectedGroup] = useState("couple");
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["food", "cultural", "photography"]);
  const [customNotes, setCustomNotes] = useState("");

  // Free text mode prompt
  const [freeTextPrompt, setFreeTextPrompt] = useState("");

  // Loading & Result states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handlePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    let finalPrompt = "";
    if (inputMode === "builder") {
      const stylesStr = selectedStyles
        .map((s) => TRAVEL_STYLES.find((t) => t.id === s)?.label)
        .filter(Boolean)
        .join(", ");
      const groupStr = GROUP_TYPES.find((g) => g.id === selectedGroup)?.label || selectedGroup;

      finalPrompt = `Tôi muốn lập kế hoạch du lịch tại ${selectedCity} trong thời gian ${numDays} ngày. Nhóm đối tượng: ${groupStr}. Ngân sách dự kiến khoảng ${budgetUsd} USD/ngày. Phong cách ưu tiên: ${stylesStr || "Tổng hợp"}.${
        customNotes ? ` Lưu ý bổ sung: ${customNotes}.` : ""
      }`;
    } else {
      finalPrompt = freeTextPrompt;
      if (!finalPrompt.trim()) {
        setErrorMsg("Vui lòng nhập nội dung yêu cầu chuyến đi.");
        setLoading(false);
        return;
      }
    }

    try {
      const data = await planTripWithAI(finalPrompt, selectedCity);
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi khi tạo lịch trình với AI.");
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
          <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Lập kế hoạch lộ trình thông minh</span>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {!result ? (
          <div className="max-w-3xl mx-auto">
            {/* Header Title */}
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full mb-3 border border-slate-200">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Adaptive Route Assistant</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Thiết lập chuyến đi của bạn
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Chọn tiêu chí tùy chỉnh hoặc nhập mô tả tự do để hệ thống phân tích và đề xuất lộ trình phù hợp nhất.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handlePlan} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-7">
              {/* Destination Selection (Markdown Styled Cards Grid) */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Điểm đến (Tỉnh / Thành phố)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {VIETNAM_DESTINATIONS.map((dest) => {
                    const isSelected = selectedCity === dest.name;
                    return (
                      <button
                        type="button"
                        key={dest.name}
                        onClick={() => setSelectedCity(dest.name)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{dest.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                          <span
                            className={`text-[10px] block mt-0.5 ${
                              isSelected ? "text-slate-300" : "text-slate-400"
                            }`}
                          >
                            {dest.region}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Phương thức nhập yêu cầu
                  </span>
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setInputMode("builder")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        inputMode === "builder"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Chọn tiêu chí</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("freetext")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        inputMode === "freetext"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      <span>Viết tự do</span>
                    </button>
                  </div>
                </div>

                {/* Mode 1: Option Builder Mode */}
                {inputMode === "builder" ? (
                  <div className="space-y-6">
                    {/* Duration & Budget */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Số ngày chuyến đi</span>
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setNumDays(d)}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                                numDays === d
                                  ? "bg-blue-50 border-blue-600 text-blue-700"
                                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              {d} ngày
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                          <span>Ngân sách ước tính (~USD/ngày)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          {[30, 60, 100, 150].map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setBudgetUsd(b)}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                                budgetUsd === b
                                  ? "bg-blue-50 border-blue-600 text-blue-700"
                                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              ${b}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Group Type */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Đối tượng / Nhóm đi cùng</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {GROUP_TYPES.map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setSelectedGroup(g.id)}
                            className={`p-2.5 rounded-xl border text-xs font-medium transition text-left ${
                              selectedGroup === g.id
                                ? "bg-slate-900 border-slate-900 text-white font-bold"
                                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Travel Style Checkboxes */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                        <Compass className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sở thích & Phong cách trải nghiệm (chọn nhiều)</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {TRAVEL_STYLES.map((st) => {
                          const active = selectedStyles.includes(st.id);
                          return (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => toggleStyle(st.id)}
                              className={`p-3 rounded-xl border text-xs text-left transition flex items-center justify-between ${
                                active
                                  ? "bg-blue-50/70 border-blue-600 text-blue-900 font-bold"
                                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              <span>{st.label}</span>
                              <div
                                className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                                  active
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {active && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Optional extra note */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Yêu cầu đặc biệt khác (tùy chọn)
                      </label>
                      <input
                        type="text"
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        placeholder="Ví dụ: Thích quán cafe view hoàng hôn, hạn chế đi bộ trưa nắng..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                ) : (
                  /* Mode 2: Free Text Prompt Mode */
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Nhập tự do yêu cầu & sở thích của bạn
                    </label>
                    <textarea
                      rows={5}
                      required={inputMode === "freetext"}
                      value={freeTextPrompt}
                      onChange={(e) => setFreeTextPrompt(e.target.value)}
                      placeholder="Ví dụ: Tôi muốn đi Hội An 3 ngày, muốn trải nghiệm ẩm thực đường phố, chụp ảnh ở các quán cafe đẹp, dành 1 buổi chiều đi thuyền rừng dừa Bảy Mẫu, đi cùng bạn gái..."
                      className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>AI đang phân tích sở thích & chấm điểm POI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Tạo kế hoạch thông minh với AI</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
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
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Phân tích thành công
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  Đề xuất kế hoạch: {result.city} ({result.num_days} ngày)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Đã tạo bản thảo chuyến đi #{result.trip_id?.slice(0, 8) || "draft"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {result.trip_id && (
                  <Link
                    href={`/trips/${result.trip_id}`}
                    className="text-xs font-bold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Xem lộ trình & Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                <button
                  onClick={() => setResult(null)}
                  className="text-xs font-bold px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                >
                  Thiết lập chuyến đi khác
                </button>
              </div>
            </div>

            {/* Extracted Intent Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Thời gian
                </span>
                <p className="text-base font-bold text-slate-900 mt-1">
                  {result.intent?.num_days || result.num_days} Ngày
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Ngân sách
                </span>
                <p className="text-base font-bold text-slate-900 mt-1">
                  ${result.intent?.budget_usd || 60}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Nhóm đi
                </span>
                <p className="text-base font-bold text-slate-900 mt-1 capitalize">
                  {result.intent?.group_type || "Cặp đôi"}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
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
                  Địa điểm được AI chấm điểm phù hợp nhất
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {result.recommended_pois?.length || 0} địa điểm được chọn lọc
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.recommended_pois?.map((poi: any, idx: number) => (
                  <div
                    key={poi.id || idx}
                    className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 transition space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">
                          {poi.name}
                        </h4>
                        <span className="text-[11px] uppercase font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {poi.category?.replace("amenity=", "")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-900 text-white px-2.5 py-1 rounded-lg text-xs font-extrabold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{poi.ai_score || 8.5}</span>
                        <span className="text-[10px] text-slate-400 font-normal">/10</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {poi.address || "Hội An, Quảng Nam"}
                    </p>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{poi.ai_reason}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{poi.avg_duration_minutes || 45} phút</span>
                      </span>
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
