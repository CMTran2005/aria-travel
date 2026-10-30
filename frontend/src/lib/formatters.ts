/**
 * Mapping OpenStreetMap/database categories and tags to clean Vietnamese labels.
 */
export const CATEGORY_LABELS_VI: Record<string, string> = {
  // Amenities & Dining
  "restaurant": "Nhà hàng",
  "cafe": "Quán cà phê",
  "fast_food": "Thức ăn nhanh",
  "bar": "Quán bar & Pub",
  "pub": "Quán pub",
  "ice_cream": "Quán kem",
  "food_court": "Khu ẩm thực",
  "marketplace": "Chợ truyền thống",

  // Tourism & Sightseeing
  "tourism": "Điểm du lịch",
  "attraction": "Điểm tham quan",
  "viewpoint": "Điểm ngắm cảnh",
  "museum": "Bảo tàng",
  "gallery": "Phòng trưng bày nghệ thuật",
  "monument": "Tượng đài / Di tích",
  "historic": "Di tích lịch sử",
  "ruins": "Phế tích lịch sử",
  "memorial": "Đài tưởng niệm",
  "artwork": "Công trình nghệ thuật",
  "information": "Điểm thông tin du lịch",

  // Nature & Leisure
  "park": "Công viên",
  "beach": "Bãi biển",
  "nature_reserve": "Khu bảo tồn thiên nhiên",
  "resort": "Khu nghỉ dưỡng",
  "spa": "Spa & Chăm sóc sức khỏe",

  // Culture & Religion
  "place_of_worship": "Điểm tâm linh / Chùa / Đền",
  "temple": "Đền / Miếu",
  "pagoda": "Chùa cổ",
  "church": "Nhà thờ",

  // Leisure & Activities
  "leisure": "Giải trí",
  "theme_park": "Công viên giải trí",
  "nightclub": "Vũ trường / Hộp đêm",
  "cinema": "Rạp chiếu phim",
  "theatre": "Nhà hát",
};

export const CATEGORY_LABELS_EN: Record<string, string> = {
  "restaurant": "Restaurant",
  "cafe": "Café",
  "fast_food": "Fast Food",
  "bar": "Bar & Pub",
  "pub": "Pub",
  "ice_cream": "Ice Cream",
  "food_court": "Food Court",
  "marketplace": "Market",

  "tourism": "Tourism",
  "attraction": "Attraction",
  "viewpoint": "Viewpoint",
  "museum": "Museum",
  "gallery": "Art Gallery",
  "monument": "Monument",
  "historic": "Historic Site",
  "ruins": "Ruins",
  "memorial": "Memorial",
  "artwork": "Artwork",
  "information": "Tourist Info",

  "park": "Park",
  "beach": "Beach",
  "nature_reserve": "Nature Reserve",
  "resort": "Resort",
  "spa": "Spa & Wellness",

  "place_of_worship": "Place of Worship",
  "temple": "Temple",
  "pagoda": "Pagoda",
  "church": "Church",

  "leisure": "Leisure",
  "theme_park": "Theme Park",
  "nightclub": "Nightclub",
  "cinema": "Cinema",
  "theatre": "Theatre",
};

export const DINING_CATEGORIES = new Set([
  "restaurant", "cafe", "fast_food", "bar", "pub", "ice_cream", "food_court", "marketplace"
]);

export const TICKET_CATEGORIES = new Set([
  "tourism", "attraction", "museum", "gallery", "monument", "historic", "ruins", "theme_park", "theatre", "cinema"
]);

/**
 * Returns a user-friendly label for any given POI category.
 * Pass lang="en" for English, defaults to Vietnamese.
 */
export function getCategoryLabel(category?: string | null, lang: "vi" | "en" = "vi"): string {
  if (!category) return lang === "en" ? "Attraction" : "Điểm tham quan";
  const clean = category.toLowerCase().replace(/^(amenity=|tourism=|historic=|leisure=)/, "").trim();
  const map = lang === "en" ? CATEGORY_LABELS_EN : CATEGORY_LABELS_VI;
  const fallback = lang === "en" ? "Attraction" : "Điểm tham quan";
  return map[clean] || (clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : fallback);
}

/** @deprecated Use getCategoryLabel(category, "vi") */
export function getCategoryLabelVi(category?: string | null): string {
  return getCategoryLabel(category, "vi");
}

/**
 * Formats a budget number (in VND) into a clean, legible Vietnamese currency string.
 */
export function formatVnd(amount: number): string {
  if (!amount || amount <= 0) return "Không giới hạn ngân sách";
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ ₫`;
  }
  if (amount >= 1_000_000) {
    const tr = amount / 1_000_000;
    return `${tr % 1 === 0 ? tr : tr.toFixed(1)} triệu ₫`;
  }
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

export interface FormattedPoiCost {
  label: string;
  amountText: string;
  fullText: string;
  isFree: boolean;
  isDining: boolean;
}

/**
 * Transparent cost formatting:
 * - Dining/Cafe: "Từ ~35.000 ₫" / "From ~$1.5"
 * - Attraction/Museum: "Vé: ~50.000 ₫" or "Vé: Miễn phí" / "Ticket: ~$2" or "Ticket: Free"
 * - Free spots: "Miễn phí" / "Free"
 */
export function formatPoiCost(
  cost?: number | null,
  category?: string | null,
  lang: "vi" | "en" = "vi",
  currency: "VND" | "USD" = "VND"
): FormattedPoiCost {
  const isFree = cost === undefined || cost === null || cost === 0;
  const cleanCat = (category || "").toLowerCase().replace(/^(amenity=|tourism=|historic=|leisure=)/, "").trim();
  const isDining = DINING_CATEGORIES.has(cleanCat);
  const isTicket = TICKET_CATEGORIES.has(cleanCat);

  let amountText = "";
  if (!isFree) {
    const costInUsd = cost! < 1000 ? cost! : cost! / 25000;
    const costInVnd = cost! < 1000 ? cost! * 25000 : cost!;

    if (currency === "USD") {
      const formattedUsd = costInUsd % 1 === 0 ? costInUsd.toFixed(0) : costInUsd.toFixed(1);
      amountText = `~$${formattedUsd}`;
    } else {
      amountText = `~${costInVnd.toLocaleString("vi-VN")} ₫`;
    }
  }

  if (isFree) {
    const freeText = lang === "en" ? "Free" : "Miễn phí";
    if (isTicket) {
      const label = lang === "en" ? "Ticket" : "Vé";
      return { label, amountText: freeText, fullText: `${label}: ${freeText}`, isFree: true, isDining };
    }
    return { label: "", amountText: freeText, fullText: freeText, isFree: true, isDining };
  }

  if (isDining) {
    const prefix = lang === "en" ? "From" : "Từ";
    return {
      label: lang === "en" ? "Dining" : "Chi tiêu",
      amountText: `${prefix} ${amountText}`,
      fullText: `${prefix} ${amountText}`,
      isFree: false,
      isDining: true,
    };
  }

  if (isTicket) {
    const label = lang === "en" ? "Ticket" : "Vé";
    return {
      label,
      amountText,
      fullText: `${label}: ${amountText}`,
      isFree: false,
      isDining: false,
    };
  }

  const prefix = lang === "en" ? "From" : "Từ";
  return {
    label: lang === "en" ? "Est." : "Dự kiến",
    amountText: `${prefix} ${amountText}`,
    fullText: `${prefix} ${amountText}`,
    isFree: false,
    isDining: false,
  };
}

/**
 * Backward compatible helper for POI cost strings.
 */
export function formatCostVi(
  cost?: number | null,
  lang: "vi" | "en" = "vi",
  category?: string | null,
  currency: "VND" | "USD" = "VND"
): string {
  return formatPoiCost(cost, category, lang, currency).fullText;
}
