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

/**
 * Returns a user-friendly Vietnamese label for any given POI category.
 */
export function getCategoryLabelVi(category?: string | null): string {
  if (!category) return "Điểm tham quan";
  const clean = category.toLowerCase().replace(/^(amenity=|tourism=|historic=|leisure=)/, "").trim();
  return CATEGORY_LABELS_VI[clean] || (clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : "Điểm tham quan");
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

/**
 * Formats a cost number (which could be in VND or USD legacy).
 */
export function formatCostVi(cost?: number | null): string {
  if (cost === undefined || cost === null || cost === 0) return "Miễn phí";
  // If cost is small (< 1000), it might be legacy USD
  if (cost < 1000) {
    const vndApprox = cost * 25000;
    return `~${vndApprox.toLocaleString("vi-VN")} ₫`;
  }
  return `${cost.toLocaleString("vi-VN")} ₫`;
}
