-- 1. Remove FK constraint from shops.owner_id (if exists) to allow NextAuth mock users
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'shops_owner_id_fkey') THEN
    ALTER TABLE shops DROP CONSTRAINT shops_owner_id_fkey;
  END IF;
  
  -- Also check for other potential names
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'shops_owner_id_users_fkey') THEN
    ALTER TABLE shops DROP CONSTRAINT shops_owner_id_users_fkey;
  END IF;
END $$;

-- 2. Insert Mock Shop (Jenny House Premium)
INSERT INTO shops (
    id, 
    name, 
    description, 
    address, 
    region, 
    category, 
    image_url, 
    owner_id,
    business_number,
    representative_name,
    contact_phone,
    business_hours
) VALUES (
    'dfee852d-8b82-4228-b1d4-f655848d5d1f',
    '{"en": "Jenny House Premium", "jp": "ジェニーハウスプレミアム"}',
    '{"en": "Premium K-Beauty Salon located in Apgujeong", "jp": "アックジョンにあるプレミアムKビューティーサロン"}',
    '{"en": "123 Apgujeong-ro, Gangnam-gu, Seoul", "jp": "ソウル市江南区アックジョン路123"}',
    '{"en": "Gangnam/Apgujeong", "jp": "江南/アックジョン"}',
    'Hair',
    '/images/shops/jennyhouse.jpg', -- Ensure this exists or use placeholder
    'owner-shop-1-mock-id', -- Arbitrary owner ID
    '123-45-67890',
    'Jenny Kim',
    '010-1234-5678',
    '{"mon": "10:00-20:00", "tue": "10:00-20:00", "wed": "10:00-20:00", "thu": "10:00-20:00", "fri": "10:00-20:00", "sat": "10:00-18:00", "sun": "closed"}'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    business_number = EXCLUDED.business_number,
    owner_id = EXCLUDED.owner_id;

-- 3. Insert Services
INSERT INTO services (id, shop_id, name, duration_min, price, category) VALUES
('serv-1-cut', 'dfee852d-8b82-4228-b1d4-f655848d5d1f', '{"en": "Design Cut", "jp": "デザインカット"}', 60, 55000, 'Hair'),
('serv-1-perm', 'dfee852d-8b82-4228-b1d4-f655848d5d1f', '{"en": "Volume Perm", "jp": "ボリュームパーマ"}', 120, 150000, 'Hair'),
('serv-1-color', 'dfee852d-8b82-4228-b1d4-f655848d5d1f', '{"en": "Full Color", "jp": "フルカラー"}', 90, 120000, 'Hair')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Coupons
INSERT INTO coupons (id, shop_id, code, name, description, discount_type, discount_value, min_purchase, valid_until, is_active) VALUES
('coup-1-summer', 'dfee852d-8b82-4228-b1d4-f655848d5d1f', 'SUMMER10', '{"en": "Summer Special"}', '{"en": "10% off for summer season"}', 'percent', 10, 0, '2025-08-31', true),
('coup-1-welcome', 'dfee852d-8b82-4228-b1d4-f655848d5d1f', 'WELCOME5000', '{"en": "Welcome Coupon"}', '{"en": "5000 KRW off your first visit"}', 'fixed', 5000, 50000, '2025-12-31', true)
ON CONFLICT (id) DO NOTHING;
