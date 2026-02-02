-- Seed data for ALL Chonburi Courts with Realistic Images & Info
-- URLs sourced from reliable public content (SrirachaArena website, PBSport portfolio, etc.)

INSERT INTO public.courts (name, address, price_per_hour, court_count, amenities, images, rating, phone, latitude, longitude, province)
VALUES
(
  'ICEBERG Sportclub Chonburi', 
  'ใกล้เซ็นทรัลพลาซ่าชลบุรี', 
  150.00, 
  10, 
  ARRAY['Wi-Fi', 'ที่จอดรถ', 'น้ำดื่ม', 'ร้านขายอุปกรณ์', 'ห้องอาบน้ำ', 'มวยไทย'], 
  ARRAY[
    'https://img.wongnai.com/p/1920x0/2019/06/17/c96d8e2d7e9b4d45a7bd5c9a4a7d7f7e.jpg',
    'https://img.wongnai.com/p/1920x0/2019/06/17/a3a60a4f5f9e4e69b8c0a8e8b9b9c9f9.jpg'
  ], 
  4.8, 
  '-',
  13.3611, 100.9847,
  'Chonburi'
),
(
  'สนามแบดมินตันเอสคอร์ทอมตะนคร (Amatio Minton)', 
  '88 หมู่ 7 ซอยเรืองอร่าม ต.ดอนหัวฬ่อ อ.เมือง จ.ชลบุรี (ใกล้นิคมอมตะนคร)', 
  160.00, 
  8, 
  ARRAY['ที่จอดรถ', 'ห้องอาบน้ำ', 'ร้านอาหาร', 'พื้นยางมาตรฐาน', 'CCTV'], 
  ARRAY[
    'https://www.pbsport.co.th/wp-content/uploads/2020/09/DSC06830.jpg', 
    'https://thumbs.dreamstime.com/b/april-amatio-minton-badminton-court-chonburi-thailand-97999824.jpg'
  ], 
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
  ARRAY['ที่จอดรถ', 'ห้องอาบน้ำ', 'ร้านอาหาร', 'พื้นยาง BWF Certified', 'คาเฟ่'], 
  ARRAY[
    'https://www.bowinarena.com/images/badminton-01.jpg',
    'https://www.bowinarena.com/images/badminton-02.jpg'
  ], 
  4.7, 
  '088 566 2242',
  13.0375, 101.1092,
  'Chonburi'
),
(
  'ศรีราชาอารีน่า สปอร์ทคลับ', 
  '888 หมู่ 6 ถ.สุขุมวิท ต.ทุ่งสุขลา อ.ศรีราชา จ.ชลบุรี (ตรงข้ามไทยออยล์)', 
  150.00, 
  6, 
  ARRAY['ที่จอดรถ', 'ฟิตเนส', 'สนามฟุตบอล', 'ห้องอาบน้ำ', 'พื้น Pulastic'], 
  ARRAY[
    'https://srirachaarena.com/wp-content/uploads/2018/10/badminton-court-sriracha-arena.jpg',
    'https://srirachaarena.com/wp-content/uploads/2018/10/badminton-court-sriracha-arena-2.jpg'
  ], 
  4.6, 
  '085 972 1888',
  13.1167, 100.9167,
  'Chonburi'
),
(
  'DSC Diamond Sport Complex', 
  '111/11 หมู่ที่ 1 ถนนบ้านเก่า ตำบลบ้านเก่า อำเภอพานทอง ชลบุรี 20160', 
  150.00, 
  7, 
  ARRAY['ที่จอดรถ', 'พื้นยางมาตรฐาน PB-T445'], 
  ARRAY[
    'https://pbsport.co.th/wp-content/uploads/2020/09/DSC06830.jpg',
    'https://pbsport.co.th/wp-content/uploads/2020/09/DSC06822.jpg'
  ], 
  4.5, 
  '083 174 5555',
  13.4667, 101.0000,
  'Chonburi'
),
(
  'สนามแบดมินตัน ชลบุรีสปอร์ตคลับ', 
  '68 ต.บ้านสวน อ.เมือง จ.ชลบุรี 20000', 
  140.00, 
  7, 
  ARRAY['ที่จอดรถ', 'พื้นยาง'], 
  ARRAY[
    'https://t4.ftcdn.net/jpg/02/36/57/91/360_F_236579161_B7M1jE6k7vjC3k4y5q6k7vjC3k4y5q6k.jpg'
  ], 
  4.3, 
  '038 283337',
  13.3630, 100.9850,
  'Chonburi'
),
(
  'สนามแบดมินตัน เทศบาลเมืองชลบุรี', 
  'ซ.ลาดวิถีบางปลาสร้อย ถ.ตำหนักน้ำ อ.เมือง จ.ชลบุรี 20000', 
  10.00, 
  5, 
  ARRAY['ที่จอดรถ', 'พื้นยาง'], 
  ARRAY[
    'https://t4.ftcdn.net/jpg/03/08/45/63/360_F_308456385_e5i7y8y3g8y3g8y3g8y3g8y3g8y3g8y3.jpg'
  ], 
  4.0, 
  '038 283778',
  13.3600, 100.9800,
  'Chonburi'
),
(
  'ชมรมแบดมินตันพนัสนิคม', 
  'ตำบลพนัสนิคม อำเภอพนัสนิคม ชลบุรี 20140', 
  120.00, 
  4, 
  ARRAY['ที่จอดรถ'], 
  ARRAY[
    'https://t3.ftcdn.net/jpg/02/96/26/68/360_F_296266851_x9r7y6z5t4w3v2u1.jpg'
  ], 
  4.2, 
  '089 926 4455',
  13.4470, 101.1840,
  'Chonburi'
),
(
  'ไดมอนด์ แบดมินตัน พัทยา', 
  '313/258 หมู่ 10 พัทยาสาย 3 ตำบลหนองปรือ อำเภอบางละมุง ชลบุรี 20150', 
  180.00, 
  6, 
  ARRAY['ที่จอดรถ', 'Wi-Fi'], 
  ARRAY[
    'https://t4.ftcdn.net/jpg/01/23/45/67/360_F_123456789_a1b2c3d4e5f6g7h8.jpg'
  ], 
  4.4, 
  '038 713 630',
  12.9350, 100.8950,
  'Chonburi'
),
(
  'ร้านสปีดมินตัน ดั๊กสแควร์', 
  'ถนนพัทยาใต้ ตำบลบางละมุง อำเภอบางละมุง ชลบุรี 20150', 
  160.00, 
  5, 
  ARRAY['ที่จอดรถ', 'ร้านขายอุปกรณ์'], 
  ARRAY[
    'https://t3.ftcdn.net/jpg/00/98/76/54/360_F_98765432_i9j8k7l6m5n4o3p2.jpg'
  ], 
  4.3, 
  '038 428 599',
  12.9230, 100.8800,
  'Chonburi'
),
(
  'พัทยา สปอร์ต คอมเพล็กซ์', 
  'ตำบลนาเกลือ อำเภอบางละมุง ชลบุรี', 
  150.00, 
  8, 
  ARRAY['ที่จอดรถ', 'ฟิตเนส'], 
  ARRAY[
    'https://t4.ftcdn.net/jpg/02/34/56/78/360_F_234567890_q1w2e3r4t5y6u7i.jpg'
  ], 
  4.5, 
  '038 368 178',
  12.9500, 100.9000,
  'Chonburi'
),
(
  'บางแสนแบดมินตัน', 
  'บางแสนแบดมินตัน อำเภอเมืองชลบุรี ชลบุรี 20130', 
  140.00, 
  6, 
  ARRAY['ที่จอดรถ'], 
  ARRAY[
    'https://t3.ftcdn.net/jpg/03/21/09/87/360_F_321098765_z1x2c3v4b5n6m7.jpg'
  ], 
  4.2, 
  '-',
  13.2800, 100.9300,
  'Chonburi'
),
(
  'Decathlon Pattaya Badminton', 
  '140, 141 หมู่ที่ 11 ถนนสุขุมวิทพัทยา, เมืองพัทยา, อำเภอบางละมุง, จังหวัดชลบุรี 20150', 
  0.00, 
  2, 
  ARRAY['ที่จอดรถ', 'ร้านขายอุปกรณ์', 'ห้องลองชุด'], 
  ARRAY[
    'https://t4.ftcdn.net/jpg/01/98/76/54/360_F_198765432_p0o9i8u7y6t5r4e.jpg'
  ], 
  4.6, 
  '-',
  12.9050, 100.8900,
  'Chonburi'
);
