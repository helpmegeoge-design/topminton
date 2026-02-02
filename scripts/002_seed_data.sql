-- Seed data for Courts table
INSERT INTO public.courts (id, name, address, price_per_hour, court_count, amenities, images, rating)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ice Burg badminton', '45 ถนน วุฒากาศ แขวงตลาดพลู เขตธนบุรี', 120, 8, ARRAY['ที่จอดรถ', 'ห้องอาบน้ำ', 'เช่าไม้แบด'], ARRAY['/images/courts/court-1.jpg'], 4.5),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'BBW BADMINTON', '123 ถนน สุขุมวิท แขวงคลองเตย', 180, 12, ARRAY['ที่จอดรถ', 'EV Charging', 'ห้องอาบน้ำ'], ARRAY['/images/courts/court-2.jpg'], 4.8),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'สนามแบดมินตันบางนา', '456 ถนน บางนา-ตราด แขวงบางนา', 100, 6, ARRAY['ที่จอดรถ'], ARRAY['/images/courts/court-3.jpg'], 4.2);
