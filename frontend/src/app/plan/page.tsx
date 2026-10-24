"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { planTripWithAI } from "@/lib/api";
import { getCategoryLabelVi, formatVnd, formatCostVi } from "@/lib/formatters";
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
  Check,
  Globe,
  Sliders
} from "lucide-react";

// Structure supporting domestic & international expansion
interface RegionData {
  id: string;
  name: string;
  scope: "domestic" | "international";
  cities: { name: string; desc: string }[];
}

const REGIONS_DATA: RegionData[] = [
  {
    id: "mien-bac",
    name: "Miền Bắc",
    scope: "domestic",
    cities: [
      { name: "Hà Nội", desc: "Thủ đô nghìn năm văn hiến, 36 phố phường, ẩm thực tinh hoa" },
      { name: "Sa Pa", desc: "Ruộng bậc thang kỳ vĩ, đỉnh Fansipan, bản làng vùng cao" },
      { name: "Ninh Bình", desc: "Tràng An non nước hữu tình, Tam Cốc Bích Động" },
      { name: "Hạ Long", desc: "Kỳ quan thiên nhiên thế giới, vịnh biển đảo đá vôi" },
      { name: "Hà Giang", desc: "Cao nguyên đá Đồng Văn, đèo Mã Pí Lèng hùng vĩ" },
      { name: "Điện Biên", desc: "Di tích lịch sử hào hùng, thung lũng Mường Thanh" },
    ],
  },
  {
    id: "mien-trung",
    name: "Miền Trung",
    scope: "domestic",
    cities: [
      { name: "Hội An", desc: "Phố cổ hoài niệm di sản UNESCO, ẩm thực đường phố, đèn lồng" },
      { name: "Đà Nẵng", desc: "Thành phố đáng sống, bãi biển Mỹ Khê, bán đảo Sơn Trà" },
      { name: "Huế", desc: "Cố đô trầm mặc, Đại Nội, lăng tẩm hoàng gia, nhã nhạc" },
      { name: "Nha Trang", desc: "Vịnh biển trong xanh, lặn biển ngắm san hô, tắm khoáng" },
      { name: "Quy Nhơn", desc: "Biển hoang sơ Kỳ Co, Eo Gió, tháp Chăm cổ kính" },
      { name: "Phú Yên", desc: "Xứ hoa vàng trên cỏ xanh, Ghềnh Đá Đĩa độc đáo" },
    ],
  },
  {
    id: "tay-nguyen",
    name: "Tây Nguyên",
    scope: "domestic",
    cities: [
      { name: "Đà Lạt", desc: "Thành phố sương mù ngàn hoa, đồi thông, khí hậu mát lành" },
      { name: "Buôn Ma Thuột", desc: "Thủ phủ cà phê, thác Dray Nur, văn hóa cồng chiêng" },
      { name: "Pleiku", desc: "Biển Hồ T'nưng thơ mộng, núi lửa Chư Đăng Ya" },
      { name: "Kon Tum", desc: "Nhà thờ gỗ trăm tuổi, cầu treo Kon Klor, nhà rông" },
    ],
  },
  {
    id: "mien-nam",
    name: "Miền Nam",
    scope: "domestic",
    cities: [
      { name: "TP. Hồ Chí Minh", desc: "Đô thị sôi động bậc nhất, nhịp sống đêm, văn hóa phong phú" },
      { name: "Phú Quốc", desc: "Đảo ngọc thiên đường, bãi Sao, hoàng hôn biển, hải sản" },
      { name: "Vũng Tàu", desc: "Thành phố biển gần gũi, ngọn hải đăng, ẩm thực hải sản" },
      { name: "Cần Thơ", desc: "Tây Đô sông nước, chợ nổi Cái Răng, miệt vườn trái cây" },
      { name: "Tây Ninh", desc: "Núi Bà Đen linh thiêng, Tòa thánh Cao Đài uy nghiêm" },
    ],
  },
  {
    id: "dong-nam-a",
    name: "Đông Nam Á (Quốc tế)",
    scope: "international",
    cities: [
      { name: "Bangkok", desc: "Thái Lan — Xứ sở chùa vàng, ẩm thực đường phố sôi động" },
      { name: "Singapore", desc: "Đảo quốc sư tử xanh, hiện đại bậc nhất châu Á" },
      { name: "Bali", desc: "Indonesia — Thiên đường nhiệt đới, đền cổ và văn hóa biển" },
      { name: "Kuala Lumpur", desc: "Malaysia — Tháp đôi Petronas, giao thoa văn hóa đặc sắc" },
    ],
  },
  {
    id: "dong-bac-a",
    name: "Đông Bắc Á (Quốc tế)",
    scope: "international",
    cities: [
      { name: "Tokyo", desc: "Nhật Bản — Siêu đô thị hiện đại đan xen văn hóa truyền thống" },
      { name: "Seoul", desc: "Hàn Quốc — Thủ đô K-Wave náo nhiệt, cung điện cổ kính" },
      { name: "Đài Bắc", desc: "Đài Loan — Chợ đêm tấp nập, tháp Taipei 101, ẩm thực đường phố" },
    ],
  },
];

// Expanded Travel Styles in Vietnamese
const TRAVEL_STYLES = [
  { id: "food", label: "Ẩm thực & Đặc sản" },
  { id: "cultural", label: "Văn hóa & Di tích" },
  { id: "photography", label: "Check-in & Sống ảo" },
  { id: "nature", label: "Thiên nhiên & Cảnh quan" },
  { id: "relaxation", label: "Nghỉ dưỡng & Thư giãn" },
  { id: "adventure", label: "Trải nghiệm & Khám phá" },
  { id: "shopping", label: "Mua sắm & Chợ địa phương" },
  { id: "nightlife", label: "Giải trí về đêm & Quán bar" },
  { id: "wellness", label: "Spa & Chăm sóc sức khỏe" },
  { id: "outdoor", label: "Thể thao & Hoạt động ngoài trời" },
  { id: "history", label: "Lịch sử & Bảo tàng" },
  { id: "craft_villages", label: "Làng nghề & Văn hóa dân gian" },
];

const GROUP_TYPES = [
  { id: "solo", label: "Đi một mình (Solo)" },
  { id: "couple", label: "Cặp đôi (Couple)" },
  { id: "friends", label: "Nhóm bạn bè" },
  { id: "family", label: "Gia đình" },
];

// Preset step values for VND budget slider: 0 to 50,000,000 VND
// 0 means "Không giới hạn"
const BUDGET_STEPS = [
  0,
  1_000_000,
  2_000_000,
  3_000_000,
  5_000_000,
  7_000_000,
  10_000_000,
  15_000_000,
  20_000_000,
  30_000_000,
  50_000_000,
];

export default function PlanPage() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<"builder" | "freetext">("builder");

  // Cascading Destination selection: Region -> City
  const [selectedRegionId, setSelectedRegionId] = useState("mien-trung");
  const [selectedCity, setSelectedCity] = useState("Hội An");

  // Editable number of days (free input)
  const [numDays, setNumDays] = useState<number>(2);

  // Budget slider in VND (index in BUDGET_STEPS)
  // 0 index = 0 VND = Không giới hạn
  const [budgetStepIdx, setBudgetStepIdx] = useState<number>(4); // default 5,000,000 VND

  // Group & Travel Styles
  const [selectedGroup, setSelectedGroup] = useState("couple");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    "food",
    "cultural",
    "photography",
  ]);
  const [customNotes, setCustomNotes] = useState("");

  // Free text mode prompt
  const [freeTextPrompt, setFreeTextPrompt] = useState("");

  // Loading & Result states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Get current region object & cities list
  const currentRegion = useMemo(() => {
    return REGIONS_DATA.find((r) => r.id === selectedRegionId) || REGIONS_DATA[0];
  }, [selectedRegionId]);

  const handleRegionChange = (newRegionId: string) => {
    setSelectedRegionId(newRegionId);
    const region = REGIONS_DATA.find((r) => r.id === newRegionId);
    if (region && region.cities.length > 0) {
      setSelectedCity(region.cities[0].name);
    }
  };

  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const currentBudgetVnd = BUDGET_STEPS[budgetStepIdx] || 0;

  const handlePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Validate days
    const validDays = Math.max(1, Math.min(Number(numDays) || 1, 30));

    let finalPrompt = "";
    if (inputMode === "builder") {
      const stylesStr = selectedStyles
        .map((s) => TRAVEL_STYLES.find((t) => t.id === s)?.label)
        .filter(Boolean)
        .join(", ");
      const groupStr = GROUP_TYPES.find((g) => g.id === selectedGroup)?.label || selectedGroup;
      const budgetText =
        currentBudgetVnd > 0
          ? `Ngân sách dự kiến: ${currentBudgetVnd.toLocaleString("vi-VN")} ₫.`
          : "Ngân sách: Không giới hạn ngân sách (thoải mái).";

      finalPrompt = `Tôi muốn lập kế hoạch du lịch tại ${selectedCity} (${currentRegion.name}) trong thời gian ${validDays} ngày. Nhóm du khách: ${groupStr}. ${budgetText} Phong cách ưu tiên: ${
        stylesStr || "Tổng hợp hài hòa"
      }.${customNotes ? ` Yêu cầu bổ sung: ${customNotes}.` : ""}`;
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
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-900 transition flex items-center gap-1 text-xs font-semibold"
          >
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
                <span>Trợ lý lập lộ trình du lịch thông minh</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Thiết lập chuyến đi của bạn
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Lựa chọn điểm đến, số ngày, ngân sách và sở thích cá nhân để AI tối ưu hóa lộ trình từng ngày.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form
              onSubmit={handlePlan}
              className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-7"
            >
              {/* Destination Section: 2 Cascading Dropdowns */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Điểm đến du lịch</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Dropdown 1: Region */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                      Khu vực / Miền
                    </label>
                    <div className="relative">
                      <select
                        value={selectedRegionId}
                        onChange={(e) => handleRegionChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition cursor-pointer appearance-none"
                      >
                        <optgroup label="Việt Nam (Trong nước)">
                          {REGIONS_DATA.filter((r) => r.scope === "domestic").map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Quốc tế (Sắp mở rộng)">
                          {REGIONS_DATA.filter((r) => r.scope === "international").map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <Globe className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Dropdown 2: City / Province */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                      Tỉnh / Thành phố
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition cursor-pointer appearance-none"
                      >
                        {currentRegion.cities.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <MapPin className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtitle description for the selected city */}
                {(() => {
                  const cityObj = currentRegion.cities.find((c) => c.name === selectedCity);
                  return cityObj ? (
                    <p className="mt-2 text-xs text-slate-500 italic flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
                      <span>{cityObj.desc}</span>
                    </p>
                  ) : null;
                })()}
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
                    {/* Duration (Free Editable Number Input) & Budget Slider (VND) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* 1. Free Number of Days Input */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            <span>Số ngày chuyến đi</span>
                          </label>
                          <span className="text-xs font-semibold text-slate-500">
                            Tùy chỉnh linh hoạt
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={30}
                            value={numDays}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setNumDays(isNaN(val) ? 1 : Math.max(1, Math.min(val, 30)));
                            }}
                            className="w-24 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-center shadow-xs"
                          />
                          <span className="text-sm font-semibold text-slate-700">ngày</span>

                          {/* Quick preset chips */}
                          <div className="flex items-center gap-1 ml-auto">
                            {[1, 2, 3, 5, 7].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setNumDays(preset)}
                                className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                                  numDays === preset
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {preset}N
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2">
                          Bạn có thể nhập số ngày bất kỳ từ 1 đến 30 ngày.
                        </p>
                      </div>

                      {/* 2. Budget Range Slider in VND */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Ngân sách dự kiến (VND)</span>
                          </label>
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {formatVnd(currentBudgetVnd)}
                          </span>
                        </div>

                        {/* Range slider */}
                        <div className="mt-3">
                          <input
                            type="range"
                            min={0}
                            max={BUDGET_STEPS.length - 1}
                            step={1}
                            value={budgetStepIdx}
                            onChange={(e) => setBudgetStepIdx(parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
                            <span>Không giới hạn</span>
                            <span>5 triệu</span>
                            <span>20 triệu</span>
                            <span>50 triệu</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-2">
                          {currentBudgetVnd === 0
                            ? "Mặc định không giới hạn ngân sách (thỏa sức trải nghiệm)."
                            : `AI sẽ tối ưu các điểm đến và chi phí phù hợp hạn mức ${formatVnd(currentBudgetVnd)}.`}
                        </p>
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

                    {/* Travel Style Checkboxes (Expanded Vietnamese Options) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <Compass className="w-3.5 h-3.5 text-slate-400" />
                          <span>Sở thích & Phong cách trải nghiệm (chọn nhiều)</span>
                        </label>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Đã chọn {selectedStyles.length} mục
                        </span>
                      </div>
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
                                className={`w-4 h-4 rounded-md border flex items-center justify-center transition shrink-0 ml-2 ${
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
                        placeholder="Ví dụ: Thích quán cafe view hoàng hôn, hạn chế đi bộ trưa nắng, ưu tiên đồ ăn chay..."
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
                      placeholder="Ví dụ: Tôi muốn đi Hội An 3 ngày với ngân sách tầm 5 triệu VND, muốn trải nghiệm ẩm thực đường phố, chụp ảnh ở các quán cafe đẹp, dành 1 buổi chiều đi rừng dừa Bảy Mẫu, đi cùng bạn gái..."
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
                    <span>AI đang phân tích sở thích & tối ưu lộ trình...</span>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
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
                    className="text-xs font-bold px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Xem lộ trình & Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                <button
                  onClick={() => setResult(null)}
                  className="text-xs font-bold px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                >
                  Thiết lập chuyến đi khác
                </button>
              </div>
            </div>

            {/* Extracted Intent Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Thời gian
                </span>
                <p className="text-base font-bold text-slate-900 mt-1">
                  {result.intent?.num_days || result.num_days} Ngày
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Ngân sách
                </span>
                <p className="text-base font-bold text-slate-900 mt-1">
                  {formatVnd(currentBudgetVnd)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-600" /> Nhóm đi
                </span>
                <p className="text-base font-bold text-slate-900 mt-1 capitalize">
                  {GROUP_TYPES.find((g) => g.id === result.intent?.group_type)?.label ||
                    result.intent?.group_type ||
                    "Cặp đôi"}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-600" /> Phong cách
                </span>
                <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                  {Array.isArray(result.intent?.travel_style)
                    ? result.intent.travel_style
                        .map((s: string) => TRAVEL_STYLES.find((t) => t.id === s)?.label || s)
                        .join(", ")
                    : "Ẩm thực, di tích, ngắm cảnh"}
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
                    className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 transition space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">
                          {poi.name}
                        </h4>
                        <span className="text-[11px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {getCategoryLabelVi(poi.category)}
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
                        {formatCostVi(poi.avg_cost_usd)}
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
