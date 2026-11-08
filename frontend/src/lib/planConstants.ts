import { Landmark, Trees, Utensils, Activity } from "lucide-react";

export interface RegionCity {
  name: string;
  desc: string;
}

export interface RegionData {
  id: string;
  name: string;
  scope: "domestic" | "international";
  cities: RegionCity[];
}

export const REGIONS_DATA: RegionData[] = [
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

export interface StyleItem {
  id: string;
  label: string;
  desc: string;
}

export interface StyleCategoryGroup {
  id: string;
  name: string;
  icon: any;
  items: StyleItem[];
}

export const CATEGORIZED_STYLES: StyleCategoryGroup[] = [
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

export const GROUP_TYPES = [
  { id: "solo", label: "Đi một mình (Solo)" },
  { id: "couple", label: "Cặp đôi (Couple)" },
  { id: "friends", label: "Nhóm bạn bè" },
  { id: "family", label: "Gia đình" },
];

