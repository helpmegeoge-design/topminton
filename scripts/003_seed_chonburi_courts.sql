-- Seed data for Chonburi Courts
INSERT INTO public.courts (name, address, price_per_hour, court_count, amenities, images, rating, phone, latitude, longitude, province)
VALUES
(
  'ICEBERG Sportclub Chonburi', 
  'ใกล้เซ็นทรัลพลาซ่าชลบุรี', 
  150.00, 
  10, 
  ARRAY['Wi-Fi', 'ที่จอดรถ', 'น้ำดื่ม', 'ร้านขายอุปกรณ์'], 
  ARRAY['/images/courts/iceberg.jpg'], 
  4.8, 
  '-',
  13.3611, 100.9847,
  'Chonburi'
),
(
  'สนามแบดมินตันเอสคอร์ทอมตะนคร (S Court)', 
  '88 หมู่ 7 ซอยเรืองอร่าม ต.ดอนหัวฬ่อ อ.เมือง จ.ชลบุรี', 
  160.00, 
  8, 
  ARRAY['ที่จอดรถ', 'ห้องอาบน้ำ'], 
  ARRAY['/images/courts/scourt.jpg'], 
  4.5, 
  '090 989 7999',
  13.4164, 101.0025,
  'Chonburi'
),
(
  'Bowin Arena', 
  '789/239 ม.3 ต.บ่อวิน อ.ศรีราชา จ.ชลบุรี', 
  200.00, 
  14, 
  ARRAY['ที่จอดรถ', 'ห้องอาบน้ำ', 'ร้านอาหาร'], 
  ARRAY['/images/courts/bowin.jpg'], 
  4.7, 
  '088 566 2242',
  13.0375, 101.1092,
  'Chonburi'
),
(
  'ศรีราชาอารีน่า สปอร์ทคลับ', 
  '888 หมู่ 6 ถ.สุขุมวิท ต.ทุ่งสุขลา อ.ศรีราชา จ.ชลบุรี', 
  150.00, 
  12, 
  ARRAY['ที่จอดรถ', 'ฟิตเนส', 'สนามฟุตบอล'], 
  ARRAY['/images/courts/sriracha.jpg'], 
  4.6, 
  '085 972 1888',
  13.1167, 100.9167,
  'Chonburi'
),
(
  'สนามแบดมินตัน ชลบุรีสปอร์ตคลับ', 
  '68 ต.บ้านสวน อ.เมือง จ.ชลบุรี', 
  140.00, 
  7, 
  ARRAY['ที่จอดรถ', 'พื้นยาง'], 
  ARRAY['/images/courts/chonburisport.jpg'], 
  4.3, 
  '038 283337',
  13.3630, 100.9850,
  'Chonburi'
),
(
  'DSC Diamond Sport Complex', 
  'หมู่ 1 111/11 ถนนบ้านเก่า ต.บ้านเก่า อ.พานทอง จ.ชลบุรี', 
  150.00, 
  7, 
  ARRAY['ที่จอดรถ', 'พื้นยางมาตรฐาน'], 
  ARRAY['/images/courts/dsc.jpg'], 
  4.5, 
  '083 174 5555',
  13.4667, 101.0000,
  'Chonburi'
);
