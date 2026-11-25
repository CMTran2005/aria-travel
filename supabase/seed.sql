-- Seed POI Data (Hội An, Đà Nẵng, Đà Lạt, Hà Nội, TP. Hồ Chí Minh, Huế)
-- Lưu ý: ST_MakePoint(longitude, latitude)

INSERT INTO pois (name, category, location, address, city, avg_duration_minutes, avg_cost_usd, rating, source)
VALUES
  -- 1. HỘI AN
  ('Chùa Cầu (Lai Viễn Kiều)', 'tourism', ST_SetSRID(ST_MakePoint(108.3263, 15.8771), 4326), 'Nguyễn Thị Minh Khai, Phường Minh An', 'Hội An', 45, 0, 4.8, 'manual'),
  ('Nhà cổ Tấn Ký', 'tourism', ST_SetSRID(ST_MakePoint(108.3274, 15.8767), 4326), '101 Nguyễn Thái Học, Minh An', 'Hội An', 40, 1.5, 4.6, 'manual'),
  ('Hội quán Phúc Kiến', 'tourism', ST_SetSRID(ST_MakePoint(108.3302, 15.8780), 4326), '46 Trần Phú, Cẩm Châu', 'Hội An', 50, 2.0, 4.7, 'manual'),
  ('Chợ đêm Hội An', 'amenity=marketplace', ST_SetSRID(ST_MakePoint(108.3245, 15.8760), 4326), 'Nguyễn Hoàng, Phường Minh An', 'Hội An', 90, 5.0, 4.5, 'manual'),
  ('Bánh Mì Phượng', 'amenity=restaurant', ST_SetSRID(ST_MakePoint(108.3325, 15.8793), 4326), '2B Phan Chu Trinh, Cẩm Châu', 'Hội An', 35, 1.5, 4.7, 'manual'),
  ('Cơm gà Bà Buội', 'amenity=restaurant', ST_SetSRID(ST_MakePoint(108.3298, 15.8788), 4326), '22 Phan Chu Trinh, Minh An', 'Hội An', 45, 3.0, 4.6, 'manual'),
  ('Làng gốm Thanh Hà', 'tourism', ST_SetSRID(ST_MakePoint(108.3005, 15.8812), 4326), 'Khu phố 5, Phường Thanh Hà', 'Hội An', 75, 2.5, 4.4, 'manual'),
  ('Rừng dừa Bảy Mẫu', 'leisure', ST_SetSRID(ST_MakePoint(108.3650, 15.8690), 4326), 'Xã Cẩm Thanh, Hội An', 'Hội An', 90, 6.0, 4.7, 'manual'),
  ('Bãi biển An Bàng', 'leisure', ST_SetSRID(ST_MakePoint(108.3450, 15.9080), 4326), 'Đường Hai Bà Trưng, Cẩm An', 'Hội An', 120, 0, 4.8, 'manual'),
  ('Faifo Coffee (Rooftop View)', 'amenity=cafe', ST_SetSRID(ST_MakePoint(108.3292, 15.8778), 4326), '130 Trần Phú, Minh An', 'Hội An', 50, 2.5, 4.5, 'manual'),

  -- 2. ĐÀ NẴNG
  ('Cầu Rồng Đà Nẵng', 'tourism', ST_SetSRID(ST_MakePoint(108.2269, 16.0611), 4326), 'Đường Nguyễn Văn Linh, Phước Ninh, Hải Châu', 'Đà Nẵng', 45, 0, 4.8, 'manual'),
  ('Bán đảo Sơn Trà & Chùa Linh Ứng', 'tourism', ST_SetSRID(ST_MakePoint(108.2778, 16.1001), 4326), 'Bán đảo Sơn Trà, Thọ Quang, Sơn Trà', 'Đà Nẵng', 90, 0, 4.8, 'manual'),
  ('Danh thắng Ngũ Hành Sơn', 'tourism', ST_SetSRID(ST_MakePoint(108.2618, 16.0041), 4326), '81 Huyền Trân Công Chúa, Hòa Hải, Ngũ Hành Sơn', 'Đà Nẵng', 100, 2.0, 4.6, 'manual'),
  ('Bãi biển Mỹ Khê', 'leisure', ST_SetSRID(ST_MakePoint(108.2464, 16.0602), 4326), 'Đường Võ Nguyên Giáp, Phước Mỹ, Sơn Trà', 'Đà Nẵng', 120, 0, 4.8, 'manual'),
  ('Chợ Hàn Đà Nẵng', 'amenity=marketplace', ST_SetSRID(ST_MakePoint(108.2244, 16.0683), 4326), '119 Trần Phú, Hải Châu 1, Hải Châu', 'Đà Nẵng', 60, 3.0, 4.4, 'manual'),
  ('Mì Quảng Bà Mua', 'amenity=restaurant', ST_SetSRID(ST_MakePoint(108.2195, 16.0635), 4326), '19 Trần Bình Trọng, Hải Châu', 'Đà Nẵng', 45, 3.0, 4.6, 'manual'),

  -- 3. ĐÀ LẠT
  ('Quảng trường Lâm Viên', 'tourism', ST_SetSRID(ST_MakePoint(108.4452, 11.9366), 4326), 'Đường Trần Quốc Toản, Phường 10, TP. Đà Lạt', 'Đà Lạt', 60, 0, 4.7, 'manual'),
  ('Chợ đêm Đà Lạt', 'amenity=marketplace', ST_SetSRID(ST_MakePoint(108.4373, 11.9424), 4326), 'Nguyễn Thị Minh Khai, Phường 1, TP. Đà Lạt', 'Đà Lạt', 90, 4.0, 4.6, 'manual'),
  ('Ga Đà Lạt', 'tourism', ST_SetSRID(ST_MakePoint(108.4542, 11.9419), 4326), '1 Quang Trung, Phường 10, TP. Đà Lạt', 'Đà Lạt', 50, 1.0, 4.5, 'manual'),
  ('Hồ Tuyền Lâm & Thiền Viện Trúc Lâm', 'tourism', ST_SetSRID(ST_MakePoint(108.4362, 11.9028), 4326), 'Phường 3, TP. Đà Lạt', 'Đà Lạt', 100, 0, 4.8, 'manual'),
  ('Dinh III Bảo Đại', 'tourism', ST_SetSRID(ST_MakePoint(108.4294, 11.9298), 4326), '1 Triệu Việt Vương, Phường 4, TP. Đà Lạt', 'Đà Lạt', 60, 2.0, 4.4, 'manual'),
  ('Tiệm Cafe Túi Mơ To', 'amenity=cafe', ST_SetSRID(ST_MakePoint(108.4812, 11.9567), 4326), 'Hẻm 31 Sào Nam, Phường 11, TP. Đà Lạt', 'Đà Lạt', 75, 3.0, 4.7, 'manual'),
  ('Lẩu gà lá é Tao Ngộ', 'amenity=restaurant', ST_SetSRID(ST_MakePoint(108.4418, 11.9332), 4326), 'Số 5 Đường 3/4, Phường 3, TP. Đà Lạt', 'Đà Lạt', 60, 6.0, 4.6, 'manual'),
  ('Thung Lũng Tình Yêu', 'leisure', ST_SetSRID(ST_MakePoint(108.4497, 11.9792), 4326), '3-5-7 Đường Mai Anh Đào, Phường 8, TP. Đà Lạt', 'Đà Lạt', 120, 10.0, 4.5, 'manual'),

  -- 4. HÀ NỘI
  ('Hồ Hoàn Kiếm & Đền Ngọc Sơn', 'tourism', ST_SetSRID(ST_MakePoint(105.8524, 21.0307), 4326), 'Đinh Tiên Hoàng, Hàng Trống, Hoàn Kiếm', 'Hà Nội', 60, 1.5, 4.8, 'manual'),
  ('Văn Miếu - Quốc Tử Giám', 'tourism', ST_SetSRID(ST_MakePoint(105.8360, 21.0294), 4326), '58 Quốc Tử Giám, Văn Miếu, Đống Đa', 'Hà Nội', 75, 3.0, 4.7, 'manual'),
  ('Lăng Chủ tịch Hồ Chí Minh', 'tourism', ST_SetSRID(ST_MakePoint(105.8346, 21.0368), 4326), '2 Hùng Vương, Điện Biên, Ba Đình', 'Hà Nội', 90, 0, 4.9, 'manual'),
  ('Nhà thờ Lớn Hà Nội (St. Joseph)', 'tourism', ST_SetSRID(ST_MakePoint(105.8495, 21.0288), 4326), '40 Nhà Chung, Hàng Trống, Hoàn Kiếm', 'Hà Nội', 45, 0, 4.6, 'manual'),
  ('Chợ Đồng Xuân & Phố Cổ 36 Phố Phường', 'amenity=marketplace', ST_SetSRID(ST_MakePoint(105.8498, 21.0378), 4326), 'Đồng Xuân, Hoàn Kiếm', 'Hà Nội', 90, 4.0, 4.5, 'manual'),
  ('Phở Bát Đàn', 'amenity=restaurant', ST_SetSRID(ST_MakePoint(105.8475, 21.0335), 4326), '49 Bát Đàn, Cửa Đông, Hoàn Kiếm', 'Hà Nội', 40, 2.5, 4.6, 'manual'),
  ('Cafe Giảng (Cà phê trứng)', 'amenity=cafe', ST_SetSRID(ST_MakePoint(105.8551, 21.0343), 4326), '39 Nguyễn Hữu Huân, Lý Thái Tổ, Hoàn Kiếm', 'Hà Nội', 50, 1.5, 4.7, 'manual'),

  -- 5. TP. HỒ CHÍ MINH
  ('Dinh Độc Lập (Hội trường Thống Nhất)', 'tourism', ST_SetSRID(ST_MakePoint(106.6953, 10.7770), 4326), '135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1', 'TP. Hồ Chí Minh', 90, 2.5, 4.7, 'manual'),
  ('Bưu điện Trung tâm Sài Gòn', 'tourism', ST_SetSRID(ST_MakePoint(106.6998, 10.7798), 4326), '02 Công xã Paris, Bến Nghé, Quận 1', 'TP. Hồ Chí Minh', 45, 0, 4.6, 'manual'),
  ('Chợ Bến Thành', 'amenity=marketplace', ST_SetSRID(ST_MakePoint(106.6980, 10.7725), 4326), 'Đường Lê Lợi, Phường Bến Thành, Quận 1', 'TP. Hồ Chí Minh', 75, 5.0, 4.4, 'manual'),
  ('Bảo tàng Chứng tích Chiến tranh', 'tourism', ST_SetSRID(ST_MakePoint(106.6921, 10.7795), 4326), '28 Võ Văn Tần, Phường 6, Quận 3', 'TP. Hồ Chí Minh', 90, 2.0, 4.8, 'manual'),
  ('Phố đi bộ Nguyễn Huệ & Trụ sở UBND TP', 'tourism', ST_SetSRID(ST_MakePoint(106.7032, 10.7739), 4326), 'Đường Nguyễn Huệ, Bến Nghé, Quận 1', 'TP. Hồ Chí Minh', 60, 0, 4.7, 'manual'),
  ('Cơm Tấm Ba Ghiền', 'amenity=restaurant', ST_SetSRID(ST_MakePoint(106.6711, 10.7933), 4326), '84 Đặng Văn Ngữ, Phường 10, Phú Nhuận', 'TP. Hồ Chí Minh', 45, 4.0, 4.6, 'manual'),

  -- 6. HUẾ
  ('Đại Nội Huế (Hoàng Thành Huế)', 'tourism', ST_SetSRID(ST_MakePoint(107.5794, 16.4697), 4326), 'Đường 23 Tháng 8, Thuận Hòa, TP. Huế', 'Huế', 150, 8.0, 4.8, 'manual'),
  ('Chùa Thiên Mụ', 'tourism', ST_SetSRID(ST_MakePoint(107.5451, 16.4528), 4326), 'Đường Kim Long, Hương Long, TP. Huế', 'Huế', 60, 0, 4.7, 'manual'),
  ('Lăng Khải Định', 'tourism', ST_SetSRID(ST_MakePoint(107.5905, 16.3989), 4326), 'Xã Thủy Bằng, TP. Huế', 'Huế', 80, 6.0, 4.7, 'manual'),
  ('Chợ Đông Ba', 'amenity=marketplace', ST_SetSRID(ST_MakePoint(107.5936, 16.4678), 4326), '2 Trần Hưng Đạo, Phú Hòa, TP. Huế', 'Huế', 75, 3.0, 4.4, 'manual'),
  ('Bún Bò Huế Mụ Rơi', 'amenity=restaurant', ST_SetSRID(ST_MakePoint(107.5855, 16.4714), 4326), '40 Nguyễn Chí Diểu, Thuận Thành, TP. Huế', 'Huế', 40, 2.0, 4.6, 'manual')
ON CONFLICT DO NOTHING;
