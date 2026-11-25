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
    name: "Miền Bắc (15 Tỉnh/Thành)",
    scope: "domestic",
    cities: [
      { name: "Hà Nội", desc: "Thủ đô nghìn năm văn hiến, 36 phố phường, trung tâm văn hóa chính trị" },
      { name: "Hải Phòng", desc: "Thành phố cảng sáp nhập Hải Dương, Cát Bà, phố biển & ẩm thực bánh đa cua" },
      { name: "Quảng Ninh", desc: "Kỳ quan Vịnh Hạ Long, Yên Tử non thiêng, đảo Cô Tô hoang sơ" },
      { name: "Lào Cai", desc: "Hợp nhất Lào Cai & Yên Bái: Sa Pa mây mù, Mù Cang Chải ruộng bậc thang" },
      { name: "Ninh Bình", desc: "Hợp nhất Ninh Bình, Hà Nam & Nam Định: Tràng An, Tam Chúc, chùa Bái Đính" },
      { name: "Tuyên Quang", desc: "Hợp nhất Tuyên Quang & Hà Giang: Cao nguyên đá Đồng Văn, đèo Mã Pí Lèng" },
      { name: "Phú Thọ", desc: "Hợp nhất Phú Thọ, Hòa Bình & Vĩnh Phúc: Đền Hùng, Mai Châu, Tam Đảo" },
      { name: "Thái Nguyên", desc: "Hợp nhất Thái Nguyên & Bắc Kạn: Thủ phủ chè, hồ Ba Bể non nước hữu tình" },
      { name: "Bắc Ninh", desc: "Hợp nhất Bắc Ninh & Bắc Giang: Xứ sở dân ca quan họ, chùa Dâu, Tây Yên Tử" },
      { name: "Hưng Yên", desc: "Hợp nhất Hưng Yên & Thái Bình: Phố Hiến đệ nhị danh đô, bãi biển Đồng Châu" },
      { name: "Lạng Sơn", desc: "Cửa khẩu giao thương, ải Chi Lăng, động Tam Thanh, đỉnh Mẫu Sơn tuyết trắng" },
      { name: "Cao Bằng", desc: "Thác Bản Giốc hùng vĩ, suối Lê-nin, hang Pác Bó cội nguồn cách mạng" },
      { name: "Lai Châu", desc: "Đèo Ô Quy Hồ tráng lệ, cánh đồng Mường Than, đỉnh Pu Si Lung" },
      { name: "Điện Biên", desc: "Di tích lịch sử lừng lẫy năm châu, thung lũng Mường Thanh hoa ban nở rộ" },
      { name: "Sơn La", desc: "Cao nguyên Mộc Châu mùa hoa mận, đồi chè trái tim, nhà máy thủy điện lớn" },
    ],
  },
  {
    id: "mien-trung",
    name: "Miền Trung (9 Tỉnh/Thành)",
    scope: "domestic",
    cities: [
      { name: "Huế", desc: "Thành phố trực thuộc TW: Cố đô trầm mặc, Đại Nội, lăng tẩm hoàng gia, nhã nhạc" },
      { name: "Đà Nẵng", desc: "Sáp nhập Đà Nẵng & Quảng Nam: Phố cổ Hội An di sản, biển Mỹ Khê, Bà Nà Hills" },
      { name: "Khánh Hòa", desc: "Hợp nhất Khánh Hòa & Ninh Thuận: Vịnh Nha Trang, tháp Chăm Po Klong Garai, vịnh Vĩnh Hy" },
      { name: "Gia Lai", desc: "Hợp nhất Gia Lai & Bình Định: Xứ võ Quy Nhơn, Kỳ Co, Eo Gió, Biển Hồ T'nưng Pleiku" },
      { name: "Quảng Trị", desc: "Hợp nhất Quảng Bình & Quảng Trị: Kỳ quan động Phong Nha - Kẻ Bàng, thành cổ Quảng Trị" },
      { name: "Quảng Ngãi", desc: "Hợp nhất Quảng Ngãi & Kon Tum: Đảo Lý Sơn ngọc ngà, Măng Đen sương mờ, nhà thờ gỗ" },
      { name: "Thanh Hóa", desc: "Thành nhà Hồ di sản UNESCO, biển Sầm Sơn sôi động, khu sinh thái Pù Luông" },
      { name: "Nghệ An", desc: "Quê hương Bác Hồ Nam Đàn, biển Cửa Lò thơ mộng, vườn quốc gia Pù Mát" },
      { name: "Hà Tĩnh", desc: "Ngã ba Đồng Lộc oai hùng, khu lưu niệm Nguyễn Du, biển Thiên Cầm xanh ngắt" },
    ],
  },
  {
    id: "dong-nam-bo-tay-nguyen",
    name: "Tây Nguyên & Đông Nam Bộ (5 Tỉnh/Thành)",
    scope: "domestic",
    cities: [
      { name: "TP. Hồ Chí Minh", desc: "Đại đô thị sáp nhập TPHCM, Bà Rịa - Vũng Tàu & Bình Dương: Phố đêm, biển Vũng Tàu, Hồ Tràm" },
      { name: "Lâm Đồng", desc: "Hợp nhất Lâm Đồng, Bình Thuận & Đắk Nông: Đà Lạt hoa thông, đồi cát Mũi Né, thác Tà Đùng" },
      { name: "Đắk Lắk", desc: "Hợp nhất Đắk Lắk & Phú Yên: Buôn Ma Thuột thủ phủ cà phê, Ghềnh Đá Đĩa xứ sở hoa vàng" },
      { name: "Đồng Nai", desc: "Hợp nhất Đồng Nai & Bình Phước: Rừng Nam Cát Tiên, hồ Trị An, núi Bà Rá" },
      { name: "Tây Ninh", desc: "Hợp nhất Tây Ninh & Long An: Đỉnh núi Bà Đen nóc nhà Nam Bộ, Tòa Thánh, sông Vàm Cỏ" },
    ],
  },
  {
    id: "dong-bang-song-cuu-long",
    name: "Tây Nam Bộ (5 Tỉnh/Thành)",
    scope: "domestic",
    cities: [
      { name: "Cần Thơ", desc: "Thành phố trực thuộc TW sáp nhập Hậu Giang & Sóc Trăng: Chợ nổi Cái Răng, chùa Dơi" },
      { name: "An Giang", desc: "Hợp nhất An Giang & Kiên Giang: Đảo ngọc Phú Quốc, rừng tràm Trà Sư, miếu Bà Chúa Xứ" },
      { name: "Cà Mau", desc: "Hợp nhất Cà Mau & Bạc Liêu: Cực Nam Tổ quốc Đất Mũi, nhà công tử Bạc Liêu, điện gió" },
      { name: "Vĩnh Long", desc: "Hợp nhất Vĩnh Long, Tiền Giang & Bến Tre: Vương quốc dừa, cồn Thới Sơn, chợ nổi Cái Bè" },
      { name: "Đồng Tháp", desc: "Vùng đất sen hồng Tháp Mười, làng hoa Sa Đéc rực rỡ, vườn quốc gia Tràm Chim" },
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

