"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { planTripWithAI } from "@/lib/api";
import { getCategoryLabel, getCategoryLabelVi, formatCostVi, formatVnd } from "@/lib/formatters";
import CustomSelect, { CustomSelectGroup, CustomSelectOption } from "@/components/ui/CustomSelect";
import DualThumbRangeSlider from "@/components/ui/DualThumbRangeSlider";
import { useToast } from "@/components/ui/Toast";
import HeaderSettings from "@/components/ui/HeaderSettings";
import { useAppSettings } from "@/context/AppSettingsContext";
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
  Plus,
  Minus,
  Utensils,
  Landmark,
  Trees,
  Activity,
  Layers,
  Sparkle
} from "lucide-react";

// Geographic data for cascading selection
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

// Well-defined, non-overlapping style categories
interface StyleCategoryGroup {
  id: string;
  name: string;
  icon: any;
  items: { id: string; label: string; desc: string }[];
}

const CATEGORIZED_STYLES: StyleCategoryGroup[] = [
  {
    id: "culture_history",
    name: "Văn hóa & Di sản",
    icon: Landmark,
    items: [
      { id: "heritage", label: "Di sản & Công trình cổ", desc: "Phố cổ, đền miếu, hoàng thành, di tích kiến trúc" },
      { id: "history", label: "Lịch sử & Bảo tàng", desc: "Bảo tàng lịch sử, dấu ấn chiến tích, tư liệu chiến tranh" },
      { id: "craft_villages", label: "Làng nghề truyền thống", desc: "Làng gốm, đèn lồng, dệt lụa, làm nón dân gian" },
    ],
  },
  {
    id: "nature_sightseeing",
    name: "Thiên nhiên & Cảnh quan",
    icon: Trees,
    items: [
      { id: "nature", label: "Thắng cảnh thiên nhiên", desc: "Đồi thông, núi đá, rừng nguyên sinh, thác nước" },
      { id: "beach", label: "Biển đảo & Vịnh biển", desc: "Tắm biển, lặn san hô, hoàng hôn và bãi cát trải dài" },
      { id: "photography", label: "Check-in & Điểm chụp ảnh đẹp", desc: "Quán cafe view cao, điểm ngắm cảnh panorama sống ảo" },
    ],
  },
  {
    id: "culinary_lifestyle",
    name: "Ẩm thực & Đời sống địa phương",
    icon: Utensils,
    items: [
      { id: "street_food", label: "Ẩm thực đường phố & Đặc sản", desc: "Món ngon bản địa, quán ăn lâu đời, gánh hàng rong" },
      { id: "cafe_chill", label: "Quán cà phê & Không gian yên tĩnh", desc: "Thưởng thức cà phê đặc sản, đọc sách, ngắm phố xá" },
      { id: "local_market", label: "Chợ truyền thống & Mua sắm", desc: "Khám phá chợ đêm, mua quà lưu niệm, đồ thủ công" },
    ],
  },
  {
    id: "wellness_adventure",
    name: "Nghỉ ngơi & Hoạt động trải nghiệm",
    icon: Activity,
    items: [
      { id: "relaxation", label: "Nghỉ dưỡng & Tái tạo năng lượng", desc: "Tắm khoáng, spa trị liệu, không gian thanh bình" },
      { id: "outdoor", label: "Hoạt động ngoài trời & Vận động", desc: "Trekking đường mòn, chèo thuyền SUP, đạp xe đồng quê" },
      { id: "nightlife", label: "Giải trí về đêm & Bar/Pub", desc: "Acoustic bar, phố đi bộ náo nhiệt, thưởng thức cocktail" },
    ],
  },
];

const GROUP_TYPES = [
  { id: "solo", label: "Đi một mình (Solo)" },
  { id: "couple", label: "Cặp đôi (Couple)" },
  { id: "friends", label: "Nhóm bạn bè" },
  { id: "family", label: "Gia đình" },
];

export default function PlanPage() {
  const router = useRouter();
  const { theme, t, lang, formatMoney } = useAppSettings();
  const { success, error: toastError } = useToast();
  const [inputMode, setInputMode] = useState<"builder" | "freetext">("builder");

  // Cascading Destination selection: Region -> City
  const [selectedRegionId, setSelectedRegionId] = useState("mien-trung");
  const [selectedCity, setSelectedCity] = useState("Hội An");

  // Compact number of days
  const [numDays, setNumDays] = useState<number>(2);

  // Dual thumb budget range in VND: [minBudget, maxBudget]
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 10_000_000]);

  // Group & Travel Styles
  const [selectedGroup, setSelectedGroup] = useState("couple");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    "street_food",
    "heritage",
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

  // Formatted Region Select Groups
  const regionSelectGroups: CustomSelectGroup[] = useMemo(() => {
    return [
      {
        label: "Việt Nam (Trong nước)",
        options: REGIONS_DATA.filter((r) => r.scope === "domestic").map((r) => ({
          value: r.id,
          label: r.name,
          badge: `${r.cities.length} điểm đến`,
        })),
      },
      {
        label: "Quốc tế (Sắp mở rộng)",
        options: REGIONS_DATA.filter((r) => r.scope === "international").map((r) => ({
          value: r.id,
          label: r.name,
          badge: `${r.cities.length} điểm đến`,
        })),
      },
    ];
  }, []);

  // Formatted City Select Options
  const citySelectOptions: CustomSelectOption[] = useMemo(() => {
    return currentRegion.cities.map((c) => ({
      value: c.name,
      label: c.name,
      desc: c.desc,
    }));
  }, [currentRegion]);

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

  // Helper text for budget
  const budgetDisplayText = useMemo(() => {
    const [minB, maxB] = budgetRange;
    if (minB === 0 && maxB >= 50_000_000) {
      return "Không giới hạn";
    }
    if (minB === 0) {
      return `Dưới ${formatVnd(maxB)}`;
    }
    if (maxB >= 50_000_000) {
      return `Từ ${formatVnd(minB)} trở lên`;
    }
    return `Từ ${formatVnd(minB)} đến ${formatVnd(maxB)}`;
  }, [budgetRange]);

  const handlePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const validDays = Math.max(1, Math.min(Number(numDays) || 1, 30));

    let finalPrompt = "";
    if (inputMode === "builder") {
      const allStylesFlat = CATEGORIZED_STYLES.flatMap((g) => g.items);
      const stylesStr = selectedStyles
        .map((s) => allStylesFlat.find((item) => item.id === s)?.label)
        .filter(Boolean)
        .join(", ");
      const groupStr = GROUP_TYPES.find((g) => g.id === selectedGroup)?.label || selectedGroup;

      finalPrompt = `Tôi muốn lập kế hoạch du lịch tại ${selectedCity} (${currentRegion.name}) trong thời gian ${validDays} ngày. Nhóm du khách: ${groupStr}. Ngân sách dự kiến: ${budgetDisplayText}. Phong cách ưu tiên: ${stylesStr || "Tổng hợp hài hòa"
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
      success("Tạo lịch trình thành công", `Đã tối ưu lộ trình ${validDays} ngày tại ${selectedCity}`);
    } catch (err: any) {
      const msg = err.message || "Đã xảy ra lỗi khi tạo lịch trình với AI.";
      setErrorMsg(msg);
      toastError("Lỗi tạo lịch trình", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Top Navbar */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1 text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t("Trang chủ", "Home")}</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-tight">ARIA</span>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t("Lập kế hoạch lộ trình thông minh", "Smart Route Planner")}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <HeaderSettings />
        </div>
      </header>


      {/* Main Container - Extended Full Width (max-w-7xl) for horizontal balance */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {!result ? (
          <div>
            {/* Header Title Banner */}
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full mb-3 border border-slate-200 dark:border-slate-700">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>Trợ lý lập lộ trình du lịch thông minh</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Thiết lập chuyến đi của bạn
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Lựa chọn điểm đến, số ngày, khoảng ngân sách và phong cách trải nghiệm để AI tối ưu hóa lộ trình từng ngày.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-200 flex items-center gap-2 max-w-3xl mx-auto">
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form
              onSubmit={handlePlan}
              className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-7"
            >
              {/* Row 1: Destination (Cascading Dropdowns) */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Điểm đến du lịch</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomSelect
                    label="Khu vực / Miền"
                    icon={<Globe className="w-4 h-4" />}
                    value={selectedRegionId}
                    onChange={handleRegionChange}
                    groups={regionSelectGroups}
                  />

                  <CustomSelect
                    label="Tỉnh / Thành phố"
                    icon={<MapPin className="w-4 h-4" />}
                    value={selectedCity}
                    onChange={(val) => setSelectedCity(val)}
                    options={citySelectOptions}
                  />
                </div>

                {(() => {
                  const cityObj = currentRegion.cities.find((c) => c.name === selectedCity);
                  return cityObj ? (
                    <p className="mt-2 text-xs text-slate-500 italic flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block shrink-0" />
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
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setInputMode("builder")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        inputMode === "builder"
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
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
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
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
                    {/* Row 2: Duration, Budget & Group Type (Compact 3-column row on large screens) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 1. Compact Days Stepper */}
                      <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            <span>Số ngày</span>
                          </label>
                          <span className="text-[11px] font-semibold text-slate-400">1 – 30 ngày</span>
                        </div>

                        <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => setNumDays((prev) => Math.max(1, prev - 1))}
                            disabled={numDays <= 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            title="Giảm 1 ngày"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <div className="flex items-baseline gap-1">
                            <input
                              type="number"
                              min={1}
                              max={30}
                              value={numDays}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setNumDays(isNaN(val) ? 1 : Math.max(1, Math.min(val, 30)));
                              }}
                              className="w-12 text-center text-lg font-black text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none"
                            />
                            <span className="text-xs font-bold text-slate-500">ngày</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setNumDays((prev) => Math.min(30, prev + 1))}
                            disabled={numDays >= 30}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            title="Tăng 1 ngày"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2.5">
                          {[1, 2, 3, 5, 7].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setNumDays(preset)}
                              className={`flex-1 py-1 rounded-md text-[11px] font-bold transition border ${
                                numDays === preset
                                  ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {preset}N
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. Budget Range Slider */}
                      <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-1">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Khoảng ngân sách</span>
                          </label>
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {budgetDisplayText}
                          </span>
                        </div>

                        <div className="mt-1">
                          <DualThumbRangeSlider
                            min={0}
                            max={50_000_000}
                            step={1_000_000}
                            minValue={budgetRange[0]}
                            maxValue={budgetRange[1]}
                            onChange={(min, max) => setBudgetRange([min, max])}
                          />
                        </div>

                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                          Kéo 2 chấm để chọn sàn & trần (Mốc 0 ₫ tương đương không giới hạn).
                        </p>
                      </div>

                      {/* 3. Group Type */}
                      <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <Users className="w-3.5 h-3.5 text-purple-600" />
                            <span>Đối tượng đi cùng</span>
                          </label>
                          <span className="text-[11px] font-semibold text-slate-400">Tùy chọn</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 my-auto">
                          {GROUP_TYPES.map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => setSelectedGroup(g.id)}
                              className={`p-2 rounded-xl border text-xs font-semibold transition text-center ${
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
                    </div>

                    {/* Row 3: Travel Styles Grouped Horizontally across 4 columns */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                          <Compass className="w-3.5 h-3.5 text-blue-600" />
                          <span>Sở thích & Phong cách trải nghiệm</span>
                        </label>
                        <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                          Đã chọn {selectedStyles.length} mục
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        {CATEGORIZED_STYLES.map((group) => {
                          const IconComp = group.icon;
                          return (
                            <div key={group.id} className="p-3.5 bg-slate-50/60 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                              <div className="flex items-center gap-2 mb-2.5">
                                <span className="p-1.5 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-blue-600 dark:text-blue-400">
                                  <IconComp className="w-3.5 h-3.5" />
                                </span>
                                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                                  {group.name}
                                </span>
                              </div>

                              <div className="space-y-2">
                                {group.items.map((item) => {
                                  const active = selectedStyles.includes(item.id);
                                  return (
                                    <button
                                      key={item.id}
                                      type="button"
                                      onClick={() => toggleStyle(item.id)}
                                      className={`w-full p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                                        active
                                          ? "bg-white dark:bg-blue-950/20 border-blue-600 dark:border-blue-500 ring-1 ring-blue-600 dark:ring-blue-500 text-blue-950 dark:text-blue-300 shadow-xs"
                                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-1 mb-0.5">
                                        <span className={`text-xs font-bold ${active ? "text-blue-900 dark:text-blue-200" : "text-slate-900 dark:text-slate-100"}`}>
                                          {item.label}
                                        </span>
                                        <div
                                          className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition shrink-0 ml-1.5 ${
                                            active
                                              ? "bg-blue-600 border-blue-600 text-white"
                                              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                          }`}
                                        >
                                          {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                        </div>
                                      </div>
                                      <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-tight">
                                        {item.desc}
                                      </p>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
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
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                      placeholder="Ví dụ: Tôi muốn đi Hội An 3 ngày với ngân sách tầm 5 đến 10 triệu VND, muốn trải nghiệm ẩm thực đường phố, chụp ảnh ở các quán cafe đẹp, dành 1 buổi chiều đi rừng dừa Bảy Mẫu, đi cùng bạn gái..."
                      className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
          /* Results View - Extended Full Width Horizontal Clean Layout */
          <div className="space-y-6">
            {/* Header Banner - Single Horizontal Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Đã tối ưu lộ trình
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Mã chuyến đi #{result.trip_id?.slice(0, 8) || "draft"}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                    Kế hoạch khám phá: {result.city} ({result.num_days} ngày)
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {result.trip_id && (
                  <Link
                    href={`/trips/${result.trip_id}`}
                    className="text-xs font-bold px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition flex items-center gap-2"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Xem bản đồ lộ trình & Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                <button
                  onClick={() => setResult(null)}
                  className="text-xs font-bold px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition"
                >
                  Thiết lập lại
                </button>
              </div>
            </div>

            {/* Extracted Intent Badges - Single 4-column Horizontal Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase block">Thời gian</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {result.intent?.num_days || result.num_days} Ngày trải nghiệm
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase block">Ngân sách</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                    {budgetDisplayText}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase block">Nhóm đi</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 capitalize truncate">
                    {GROUP_TYPES.find((g) => g.id === result.intent?.group_type)?.label ||
                      result.intent?.group_type ||
                      "Cặp đôi"}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase block">Phong cách</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                    {Array.isArray(result.intent?.travel_style)
                      ? result.intent.travel_style.join(", ")
                      : "Tổng hợp hài hòa"}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Recommended POIs - 3 Column Wide Grid with Clean Horizontal POI Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Danh sách địa điểm được AI chọn lọc & phân bổ vào lộ trình
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  {result.recommended_pois?.length || 0} địa điểm
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.recommended_pois?.map((poi: any, idx: number) => (
                  <div
                    key={poi.id || idx}
                    className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition space-y-2.5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                            {poi.name}
                          </h4>
                          <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block mt-1">
                            {getCategoryLabel(poi.category, lang)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded-lg text-xs font-bold shrink-0">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{poi.ai_score || 8.5}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 truncate mt-1">
                        {poi.address || t("Hội An, Quảng Nam", "Hoi An, Vietnam")}
                      </p>

                      <div className="mt-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed text-[11px] text-slate-600 dark:text-slate-400">
                          {poi.ai_reason}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{poi.avg_duration_minutes || 45} phút</span>
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                        {formatCostVi(poi.avg_cost_usd, lang)}
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
