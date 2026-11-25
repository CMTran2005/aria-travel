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
      { name: "Hà Nội", desc: "Thủ đô nghìn năm văn hiến, 36 phố phường, trung tâm văn hóa và ẩm thực tinh hoa" },
      { name: "Hải Phòng", desc: "Thành phố Cảng hoa phượng đỏ, quần đảo Cát Bà, phố biển Đồ Sơn và ẩm thực phong phú" },
      { name: "Quảng Ninh", desc: "Kỳ quan thiên nhiên thế giới Vịnh Hạ Long, Yên Tử non thiêng và đảo Cô Tô" },
      { name: "Lào Cai", desc: "Sa Pa thị trấn trong mây, đỉnh Fansipan, ruộng bậc thang Mù Cang Chải kỳ vĩ" },
      { name: "Ninh Bình", desc: "Quần thể di sản Tràng An, Tam Chúc, chùa Bái Đính và non nước hữu tình" },
      { name: "Tuyên Quang", desc: "Cao nguyên đá Đồng Văn hùng vĩ, đèo Mã Pí Lèng, sông Nho Quế và suối khoáng Mỹ Lâm" },
      { name: "Phú Thọ", desc: "Đất Tổ cội nguồn Đền Hùng, thung lũng Mai Châu thơ mộng và thị trấn sương mờ Tam Đảo" },
      { name: "Thái Nguyên", desc: "Thủ phủ chè xanh ngát, hồ Ba Bể non xanh nước biếc và hang động nguyên sơ" },
      { name: "Bắc Ninh", desc: "Xứ sở dân ca Quan họ truyền thống, đền Đô, chùa Dâu và quần thể di tích Tây Yên Tử" },
      { name: "Hưng Yên", desc: "Phố Hiến đệ nhị danh đô cổ kính, làng gốm Chu Đậu và bãi biển Đồng Châu" },
      { name: "Lạng Sơn", desc: "Cửa khẩu sầm uất, ải Chi Lăng lịch sử, động Tam Thanh và đỉnh Mẫu Sơn quanh năm gió mát" },
      { name: "Cao Bằng", desc: "Thác Bản Giốc trắng xóa tuyệt đẹp, suối Lê-nin trong vắt và di tích lịch sử Pác Bó" },
      { name: "Lai Châu", desc: "Hùng quan đèo Ô Quy Hồ, cánh đồng Mường Than bao la và những đỉnh núi mây ngàn" },
      { name: "Điện Biên", desc: "Thung lũng Mường Thanh trù phú, hoa ban rực rỡ và những trang sử hào hùng" },
      { name: "Sơn La", desc: "Cao nguyên Mộc Châu mùa hoa nở, đồi chè trái tim và dòng sông Đà kỳ vĩ" },
    ],
  },
  {
    id: "mien-trung",
    name: "Miền Trung (9 Tỉnh/Thành)",
    scope: "domestic",
    cities: [
      { name: "Huế", desc: "Cố đô trầm mặc, Đại Nội uy nghiêm, lăng tẩm hoàng gia và dòng sông Hương êm đềm" },
      { name: "Đà Nẵng", desc: "Phố cổ Hội An di sản thế giới, bãi biển Mỹ Khê, Bà Nà Hills và cầu Rồng biểu tượng" },
      { name: "Khánh Hòa", desc: "Vịnh Nha Trang biển xanh cát trắng, tháp Chăm Po Klong Garai và vịnh Vĩnh Hy thơ mộng" },
      { name: "Gia Lai", desc: "Xứ võ Quy Nhơn, biển Kỳ Co - Eo Gió trong xanh và Biển Hồ T'nưng Pleiku đại ngàn" },
      { name: "Quảng Trị", desc: "Vương quốc hang động Phong Nha - Kẻ Bàng, dòng sông Bến Hải và mảnh đất nghĩa tình" },
      { name: "Quảng Ngãi", desc: "Đảo ngọc Lý Sơn núi lửa triệu năm, thị trấn Măng Đen se lạnh và nhà thờ gỗ trăm tuổi" },
      { name: "Thanh Hóa", desc: "Thành nhà Hồ di sản UNESCO, bãi biển Sầm Sơn sôi động và khu sinh thái Pù Luông xanh ngát" },
      { name: "Nghệ An", desc: "Quê Bác làng Sen mộc mạc, biển Cửa Lò trải dài và đại ngàn vườn quốc gia Pù Mát" },
      { name: "Hà Tĩnh", desc: "Bãi biển Thiên Cầm xanh ngắt, ngã ba Đồng Lộc oai hùng và đền Chợ Củi linh thiêng" },
    ],
  },
  {
    id: "dong-nam-bo-tay-nguyen",
    name: "Tây Nguyên & Đông Nam Bộ (5 Tỉnh/Thành)",
    scope: "domestic",
    cities: [
      { name: "TP. Hồ Chí Minh", desc: "Đô thị sôi động bậc nhất, nhịp sống đêm rực rỡ, bãi biển Vũng Tàu và khu nghỉ dưỡng Hồ Tràm" },
      { name: "Lâm Đồng", desc: "Thành phố ngàn hoa Đà Lạt mộng mơ, đồi cát bay Mũi Né và hồ Tà Đùng đại ngàn" },
      { name: "Đắk Lắk", desc: "Thủ phủ cà phê Buôn Ma Thuột hùng vĩ, thác Dray Nur và Ghềnh Đá Đĩa độc đáo" },
      { name: "Đồng Nai", desc: "Vườn quốc gia Nam Cát Tiên trù phú, hồ Trị An thơ mộng và những vườn cây trái xum xuê" },
      { name: "Tây Ninh", desc: "Nóc nhà Nam Bộ núi Bà Đen linh thiêng, Tòa Thánh tráng lệ và dòng sông Vàm Cỏ hiền hòa" },
    ],
  },
  {
    id: "dong-bang-song-cuu-long",
    name: "Tây Nam Bộ (5 Tỉnh/Thành)",
    scope: "domestic",
    cities: [
      { name: "Cần Thơ", desc: "Tây Đô sông nước, nét văn hóa chợ nổi Cái Răng, bến Ninh Kiều và miệt vườn trĩu quả" },
      { name: "An Giang", desc: "Thiên đường biển đảo Phú Quốc, rừng tràm Trà Sư xanh mướt và miếu Bà Chúa Xứ linh thiêng" },
      { name: "Cà Mau", desc: "Mốc tọa độ cực Nam Tổ quốc Đất Mũi, rừng ngập mặn bao la và cánh đồng điện gió Bạc Liêu" },
      { name: "Vĩnh Long", desc: "Vương quốc sông nước rợp bóng dừa, cồn Thới Sơn thanh bình và chợ nổi Cái Bè nhộn nhịp" },
      { name: "Đồng Tháp", desc: "Xứ sở sen hồng Đồng Tháp Mười, làng hoa Sa Đéc trăm sắc và vườn quốc gia Tràm Chim" },
    ],
  },
  {
    id: "dong-nam-a",
    name: "Đông Nam Á (Quốc tế)",
    scope: "international",
    cities: [
      { name: "Bangkok", desc: "Thái Lan — Xứ sở chùa vàng, ẩm thực đường phố sôi động và thiên đường mua sắm" },
      { name: "Singapore", desc: "Đảo quốc sư tử xanh, kiến trúc tương lai và các khu vui chơi giải trí hàng đầu" },
      { name: "Bali", desc: "Indonesia — Thiên đường nhiệt đới biển xanh, những ngôi đền cổ và văn hóa đặc sắc" },
      { name: "Kuala Lumpur", desc: "Malaysia — Tháp đôi Petronas biểu tượng, sự giao thoa văn hóa đa dạng" },
    ],
  },
  {
    id: "dong-bac-a",
    name: "Đông Bắc Á (Quốc tế)",
    scope: "international",
    cities: [
      { name: "Tokyo", desc: "Nhật Bản — Siêu đô thị hiện đại đan xen văn hóa truyền thống tinh tế" },
      { name: "Seoul", desc: "Hàn Quốc — Thủ đô K-Wave náo nhiệt, cung điện cổ kính và ẩm thực hấp dẫn" },
      { name: "Đài Bắc", desc: "Đài Loan — Chợ đêm ẩm thực tấp nập, tháp Taipei 101 và làng cổ Cửu Phần" },
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

