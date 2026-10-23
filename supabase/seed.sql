# Seed POI data demo (Hoi An / Da Lat)
-- Ví dụ POI cơ bản ban đầu
INSERT INTO pois (name, category, location, address, city, avg_duration_minutes, avg_cost_usd, rating, source)
VALUES
  ('Chùa Cầu', 'tourism', ST_SetSRID(ST_MakePoint(108.3263, 15.8771), 4326), 'Nguyễn Thị Minh Khai, Phường Minh An', 'Hội An', 45, 0, 4.6, 'manual'),
  ('Nhà cổ Tấn Ký', 'tourism', ST_SetSRID(ST_MakePoint(108.3274, 15.8767), 4326), '101 Nguyễn Thái Học', 'Hội An', 45, 1.5, 4.5, 'manual'),
  ('Chợ Hội An', 'amenity=marketplace', ST_SetSRID(ST_MakePoint(108.3323, 15.8785), 4326), 'Trần Quý Cáp, Cẩm Châu', 'Hội An', 60, 0, 4.4, 'manual');
