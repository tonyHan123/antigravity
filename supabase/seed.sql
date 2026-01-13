-- ============================================
-- K-Beauty Platform - Seed Data
-- Run this after schema.sql to populate sample data
-- ============================================

-- Insert sample shops (let PostgreSQL auto-generate UUIDs)
INSERT INTO shops (owner_id, name, category, region, address, description, rating, review_count, like_count, image_url, images, status) VALUES
(
    NULL, -- Will be assigned to owner later
    '{"en": "Jenny House Premium", "jp": "ジェニーハウスプレミアム", "cn": "珍妮屋高级"}',
    'Hair',
    '{"en": "Seoul", "jp": "ソウル", "cn": "首尔"}',
    '{"en": "Gangnam-gu, Seoul", "jp": "ソウル市江南区", "cn": "首尔市江南区"}',
    '{"en": "Celebrity favorite hair salon located in the heart of Gangnam.", "jp": "江南の中心にあるセレブ御用達のヘアサロン。", "cn": "位于江南中心的名人最爱发廊。"}',
    4.8,
    120,
    85,
    '/images/hair-1.jpg',
    ARRAY['/images/hair-1.jpg', '/images/hair-2.jpg', '/images/hair-inner.jpg'],
    'approved'
),
(
    NULL,
    '{"en": "Sulwhasoo Spa", "jp": "雪花秀スパ", "cn": "雪花秀水疗中心"}',
    'Massage',
    '{"en": "Seoul", "jp": "ソウル", "cn": "首尔"}',
    '{"en": "Myeongdong, Seoul", "jp": "ソウル市明洞", "cn": "首尔市明洞"}',
    '{"en": "Traditional Korean herbal medicine spa experience for ultimate relaxation.", "jp": "究極のリラクゼーションのための伝統的な韓方スパ体験。", "cn": "传统韩方草药水疗体验，带来极致放松。"}',
    4.9,
    340,
    210,
    '/images/spa-1.jpg',
    ARRAY['/images/spa-1.jpg', '/images/spa-inner.jpg'],
    'approved'
),
(
    NULL,
    '{"en": "Artist Makeup Studio", "jp": "アーティストメイクアップスタジオ", "cn": "艺术家化妆工作室"}',
    'Makeup',
    '{"en": "Seoul", "jp": "ソウル", "cn": "首尔"}',
    '{"en": "Hongdae, Seoul", "jp": "ソウル市弘大", "cn": "首尔市弘大"}',
    '{"en": "Get the trendy K-Drama look with our professional makeup artists.", "jp": "プロのメイクアップアーティストによるトレンディなK-ドラマルックを手に入れよう。", "cn": "由专业化妆师打造时尚的韩剧妆容。"}',
    4.7,
    89,
    56,
    '/images/makeup-1.jpg',
    ARRAY['/images/makeup-1.jpg', '/images/makeup-inner.jpg'],
    'approved'
),
(
    NULL,
    '{"en": "Vogue Hair Lounge", "jp": "ヴォーグ ヘアラウンジ", "cn": "Vogue发型沙龙"}',
    'Hair',
    '{"en": "Seoul", "jp": "ソウル", "cn": "首尔"}',
    '{"en": "Itaewon, Seoul", "jp": "ソウル市梨泰院", "cn": "首尔市梨泰院"}',
    '{"en": "Trend-setting styles in the heart of Gangnam.", "jp": "江南の中心でトレンドを発信するスタイル。", "cn": "江南中心引领潮流的风格。"}',
    4.7,
    98,
    72,
    '/images/hair-2.jpg',
    ARRAY['/images/hair-2.jpg', '/images/hair-inner.jpg'],
    'approved'
),
(
    NULL,
    '{"en": "Nail Art Gallery", "jp": "ネイルアートギャラリー", "cn": "美甲艺术馆"}',
    'Nail',
    '{"en": "Seoul", "jp": "ソウル", "cn": "首尔"}',
    '{"en": "Sinsa-dong, Seoul", "jp": "ソウル市新沙洞", "cn": "首尔市新沙洞"}',
    '{"en": "Where nail art becomes masterpiece. Premium gel and art designs.", "jp": "ネイルアートが傑作になる場所。プレミアムジェルとアートデザイン。", "cn": "美甲艺术成为杰作的地方。高级凝胶和艺术设计。"}',
    4.6,
    156,
    89,
    '/images/nail-1.jpg',
    ARRAY['/images/nail-1.jpg', '/images/nail-inner.jpg'],
    'approved'
);

-- Insert services for each shop (using subquery to get shop IDs by name)
INSERT INTO services (shop_id, name, duration_min, price) VALUES
-- Jenny House Premium
((SELECT id FROM shops WHERE name->>'en' = 'Jenny House Premium'), '{"en": "Premium Cut & Styling", "jp": "プレミアムカット＆スタイリング", "cn": "高级剪发造型"}', 60, 55000),
((SELECT id FROM shops WHERE name->>'en' = 'Jenny House Premium'), '{"en": "Color Treatment", "jp": "カラートリートメント", "cn": "染发护理"}', 120, 150000),
((SELECT id FROM shops WHERE name->>'en' = 'Jenny House Premium'), '{"en": "Digital Perm", "jp": "デジタルパーマ", "cn": "数码烫"}', 180, 200000),

-- Sulwhasoo Spa
((SELECT id FROM shops WHERE name->>'en' = 'Sulwhasoo Spa'), '{"en": "Signature Relaxation", "jp": "シグネチャーリラクゼーション", "cn": "招牌放松护理"}', 90, 220000),
((SELECT id FROM shops WHERE name->>'en' = 'Sulwhasoo Spa'), '{"en": "Deep Tissue Massage", "jp": "ディープティシューマッサージ", "cn": "深层组织按摩"}', 60, 150000),
((SELECT id FROM shops WHERE name->>'en' = 'Sulwhasoo Spa'), '{"en": "Herbal Body Wrap", "jp": "ハーブボディラップ", "cn": "草药身体裹敷"}', 120, 280000),

-- Artist Makeup Studio
((SELECT id FROM shops WHERE name->>'en' = 'Artist Makeup Studio'), '{"en": "K-Drama Makeup", "jp": "K-ドラマメイク", "cn": "韩剧妆容"}', 60, 80000),
((SELECT id FROM shops WHERE name->>'en' = 'Artist Makeup Studio'), '{"en": "Bridal Makeup", "jp": "ブライダルメイク", "cn": "新娘妆"}', 120, 180000),
((SELECT id FROM shops WHERE name->>'en' = 'Artist Makeup Studio'), '{"en": "Daily Natural Look", "jp": "デイリーナチュラルルック", "cn": "日常自然妆"}', 45, 60000),

-- Vogue Hair Lounge
((SELECT id FROM shops WHERE name->>'en' = 'Vogue Hair Lounge'), '{"en": "Trendy Cut", "jp": "トレンドカット", "cn": "时尚剪发"}', 45, 45000),
((SELECT id FROM shops WHERE name->>'en' = 'Vogue Hair Lounge'), '{"en": "Balayage Highlight", "jp": "バレイヤージュハイライト", "cn": "挑染"}', 150, 180000),

-- Nail Art Gallery
((SELECT id FROM shops WHERE name->>'en' = 'Nail Art Gallery'), '{"en": "Gel Manicure", "jp": "ジェルマニキュア", "cn": "凝胶美甲"}', 45, 45000),
((SELECT id FROM shops WHERE name->>'en' = 'Nail Art Gallery'), '{"en": "Nail Art Design", "jp": "ネイルアートデザイン", "cn": "美甲设计"}', 90, 80000),
((SELECT id FROM shops WHERE name->>'en' = 'Nail Art Gallery'), '{"en": "Full Set (Hands + Feet)", "jp": "フルセット（手＋足）", "cn": "全套（手+脚）"}', 120, 100000);

-- Insert sample coupons
INSERT INTO coupons (shop_id, code, discount_type, discount_value, min_purchase, valid_until, is_active) VALUES
((SELECT id FROM shops WHERE name->>'en' = 'Jenny House Premium'), 'JENNYHOUSE10', 'percent', 10, 50000, '2025-12-31', true),
((SELECT id FROM shops WHERE name->>'en' = 'Sulwhasoo Spa'), 'SULWHASOO20', 'percent', 20, 200000, '2025-06-30', true),
((SELECT id FROM shops WHERE name->>'en' = 'Artist Makeup Studio'), 'FIRSTMAKEUP', 'fixed', 10000, 60000, '2025-12-31', true),
((SELECT id FROM shops WHERE name->>'en' = 'Vogue Hair Lounge'), 'VOGUENEW', 'percent', 15, 40000, '2025-09-30', true),
((SELECT id FROM shops WHERE name->>'en' = 'Nail Art Gallery'), 'NAILART5000', 'fixed', 5000, 40000, '2025-12-31', true);
