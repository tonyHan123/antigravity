-- ============================================
-- TEST SHOP DATA - For Testing Purposes Only
-- ============================================
-- All test shops have '[TEST]' prefix in their names
-- To delete all test data: DELETE FROM shops WHERE name->>'en' LIKE '[TEST]%';
-- ============================================

-- K-Beauty: Hair (Busan)
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Busan Hair Studio", "jp": "[TEST] 釜山ヘアスタジオ", "cn": "[TEST] 釜山美发工作室"}'::jsonb,
    'Hair', 'k-beauty', 'hair',
    '{"en": "Busan", "jp": "釜山", "cn": "釜山"}'::jsonb,
    '{"en": "123 Haeundae Beach Road, Busan", "jp": "釜山市海雲台ビーチロード123", "cn": "釜山海云台海滩路123号"}'::jsonb,
    '{"en": "Premium hair salon with ocean view. Expert stylists for all hair types.", "jp": "オーシャンビューのプレミアムヘアサロン", "cn": "拥有海景的高级美发沙龙"}'::jsonb,
    4.7, 45, 120, '/images/hair-1.jpg', ARRAY['/images/hair-1.jpg', '/images/hair-2.jpg'], 'approved'
);

-- K-Beauty: Nail (Jeju)
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Jeju Nail Art", "jp": "[TEST] 済州ネイルアート", "cn": "[TEST] 济州美甲艺术"}'::jsonb,
    'Nail', 'k-beauty', 'nail',
    '{"en": "Jeju", "jp": "済州", "cn": "济州"}'::jsonb,
    '{"en": "456 Seogwipo Main Street, Jeju", "jp": "済州西帰浦メインストリート456", "cn": "济州西归浦主街456号"}'::jsonb,
    '{"en": "Beautiful nail designs inspired by Jeju nature. Gel, acrylic, and art nails.", "jp": "済州の自然にインスピレーションを受けた美しいネイル", "cn": "灵感来自济州自然的美丽美甲设计"}'::jsonb,
    4.9, 78, 200, '/images/nail-1.jpg', ARRAY['/images/nail-1.jpg'], 'approved'
);

-- K-Beauty: Massage (Incheon)
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Incheon Healing Spa", "jp": "[TEST] 仁川ヒーリングスパ", "cn": "[TEST] 仁川疗愈水疗"}'::jsonb,
    'Massage', 'k-beauty', 'massage',
    '{"en": "Incheon", "jp": "仁川", "cn": "仁川"}'::jsonb,
    '{"en": "789 Songdo Central Park, Incheon", "jp": "仁川松島セントラルパーク789", "cn": "仁川松岛中央公园789号"}'::jsonb,
    '{"en": "Traditional Korean massage and modern spa treatments. Perfect after a long flight.", "jp": "韓国伝統マッサージとモダンスパ", "cn": "传统韩式按摩和现代水疗护理"}'::jsonb,
    4.6, 92, 150, '/images/spa-1.jpg', ARRAY['/images/spa-1.jpg'], 'approved'
);

-- K-Beauty: Makeup (Busan)
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Busan Glamour Studio", "jp": "[TEST] 釜山グラマースタジオ", "cn": "[TEST] 釜山魅力工作室"}'::jsonb,
    'Makeup', 'k-beauty', 'makeup',
    '{"en": "Busan", "jp": "釜山", "cn": "釜山"}'::jsonb,
    '{"en": "55 Gwangalli Beach Road, Busan", "jp": "釜山広安里ビーチロード55", "cn": "釜山广安里海滩路55号"}'::jsonb,
    '{"en": "Professional makeup for photoshoots, weddings, and special events.", "jp": "撮影、結婚式、特別イベント用のプロメイク", "cn": "专业化妆服务，适用于拍摄、婚礼和特殊活动"}'::jsonb,
    4.8, 63, 180, '/images/makeup-1.jpg', ARRAY['/images/makeup-1.jpg'], 'approved'
);

-- Health: Rehab (Jeju)
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Jeju Wellness Center", "jp": "[TEST] 済州ウェルネスセンター", "cn": "[TEST] 济州健康中心"}'::jsonb,
    'Rehab', 'health', 'rehab',
    '{"en": "Jeju", "jp": "済州", "cn": "济州"}'::jsonb,
    '{"en": "100 Hallasan Road, Jeju", "jp": "済州漢拏山ロード100", "cn": "济州汉拿山路100号"}'::jsonb,
    '{"en": "Physical therapy and rehabilitation center with natural hot springs.", "jp": "天然温泉付きリハビリセンター", "cn": "拥有天然温泉的物理治疗和康复中心"}'::jsonb,
    4.5, 35, 80, '/images/placeholder.jpg', ARRAY['/images/placeholder.jpg'], 'approved'
);

-- Health: Gym (Incheon)
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Incheon Fitness Club", "jp": "[TEST] 仁川フィットネスクラブ", "cn": "[TEST] 仁川健身俱乐部"}'::jsonb,
    'Gym', 'health', 'gym',
    '{"en": "Incheon", "jp": "仁川", "cn": "仁川"}'::jsonb,
    '{"en": "200 Airport Road, Incheon", "jp": "仁川空港ロード200", "cn": "仁川机场路200号"}'::jsonb,
    '{"en": "24/7 gym with personal trainers. Convenient for travelers.", "jp": "パーソナルトレーナー付き24時間ジム", "cn": "配备私人教练的24小时健身房"}'::jsonb,
    4.4, 28, 60, '/images/placeholder.jpg', ARRAY['/images/placeholder.jpg'], 'approved'
);

-- Additional Hair shops in different regions
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Jeju Natural Hair", "jp": "[TEST] 済州ナチュラルヘア", "cn": "[TEST] 济州自然美发"}'::jsonb,
    'Hair', 'k-beauty', 'hair',
    '{"en": "Jeju", "jp": "済州", "cn": "济州"}'::jsonb,
    '{"en": "77 Aewol Coastal Road, Jeju", "jp": "済州涯月海岸ロード77", "cn": "济州涯月海岸路77号"}'::jsonb,
    '{"en": "Organic hair care using Jeju natural ingredients.", "jp": "済州の天然成分を使用したオーガニックヘアケア", "cn": "使用济州天然成分的有机护发"}'::jsonb,
    4.8, 55, 140, '/images/hair-2.jpg', ARRAY['/images/hair-2.jpg'], 'approved'
);

-- Additional Nail shops
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Incheon Nail Lounge", "jp": "[TEST] 仁川ネイルラウンジ", "cn": "[TEST] 仁川美甲休息室"}'::jsonb,
    'Nail', 'k-beauty', 'nail',
    '{"en": "Incheon", "jp": "仁川", "cn": "仁川"}'::jsonb,
    '{"en": "88 Paradise City, Incheon", "jp": "仁川パラダイスシティ88", "cn": "仁川天堂城88号"}'::jsonb,
    '{"en": "Luxury nail salon near Incheon Airport. Perfect for travelers.", "jp": "仁川空港近くの高級ネイルサロン", "cn": "仁川机场附近的豪华美甲沙龙"}'::jsonb,
    4.7, 42, 95, '/images/nail-1.jpg', ARRAY['/images/nail-1.jpg'], 'approved'
);

-- Additional Massage shops
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Busan Ocean Massage", "jp": "[TEST] 釜山オーシャンマッサージ", "cn": "[TEST] 釜山海洋按摩"}'::jsonb,
    'Massage', 'k-beauty', 'massage',
    '{"en": "Busan", "jp": "釜山", "cn": "釜山"}'::jsonb,
    '{"en": "99 Marine City, Busan", "jp": "釜山マリンシティ99", "cn": "釜山海洋城99号"}'::jsonb,
    '{"en": "Relaxing massage with stunning ocean views. Thai and Korean styles.", "jp": "素晴らしい海の景色とリラックスマッサージ", "cn": "拥有迷人海景的放松按摩"}'::jsonb,
    4.9, 88, 220, '/images/spa-1.jpg', ARRAY['/images/spa-1.jpg'], 'approved'
);

-- Additional Makeup shops
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Jeju Bridal Beauty", "jp": "[TEST] 済州ブライダルビューティー", "cn": "[TEST] 济州新娘美妆"}'::jsonb,
    'Makeup', 'k-beauty', 'makeup',
    '{"en": "Jeju", "jp": "済州", "cn": "济州"}'::jsonb,
    '{"en": "33 Seongsan Sunrise Peak Road, Jeju", "jp": "済州城山日出峰ロード33", "cn": "济州城山日出峰路33号"}'::jsonb,
    '{"en": "Bridal makeup specialists. Perfect for destination weddings.", "jp": "ブライダルメイクスペシャリスト", "cn": "新娘化妆专家，适合目的地婚礼"}'::jsonb,
    4.7, 51, 130, '/images/makeup-1.jpg', ARRAY['/images/makeup-1.jpg'], 'approved'
);

-- ============================================
-- ADD SERVICES FOR TEST SHOPS
-- ============================================

-- Note: You may need to add services separately after shops are created
-- Example:
-- INSERT INTO services (shop_id, name, duration_min, price)
-- SELECT id, '{"en": "Basic Cut", "jp": "ベーシックカット", "cn": "基础剪发"}'::jsonb, 60, 35000
-- FROM shops WHERE name->>'en' = '[TEST] Busan Hair Studio';

-- ============================================
-- ADDITIONAL HEALTH CATEGORY SHOPS
-- ============================================

-- Health: Rehab (Busan)
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Busan Sports Rehab", "jp": "[TEST] 釜山スポーツリハビリ", "cn": "[TEST] 釜山运动康复"}'::jsonb,
    'Rehab', 'health', 'rehab',
    '{"en": "Busan", "jp": "釜山", "cn": "釜山"}'::jsonb,
    '{"en": "150 Centum City, Busan", "jp": "釜山センタムシティ150", "cn": "釜山仙台市150号"}'::jsonb,
    '{"en": "Sports injury rehabilitation and physical therapy.", "jp": "スポーツ傷害リハビリと理学療法", "cn": "运动损伤康复和物理治疗"}'::jsonb,
    4.6, 38, 90, '/images/placeholder.jpg', ARRAY['/images/placeholder.jpg'], 'approved'
);

-- Health: Rehab (Incheon)
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Incheon Recovery Center", "jp": "[TEST] 仁川リカバリーセンター", "cn": "[TEST] 仁川康复中心"}'::jsonb,
    'Rehab', 'health', 'rehab',
    '{"en": "Incheon", "jp": "仁川", "cn": "仁川"}'::jsonb,
    '{"en": "300 Yeonsu District, Incheon", "jp": "仁川延寿区300", "cn": "仁川延寿区300号"}'::jsonb,
    '{"en": "Comprehensive rehabilitation services with modern equipment.", "jp": "最新設備による総合リハビリサービス", "cn": "配备现代设备的综合康复服务"}'::jsonb,
    4.5, 42, 75, '/images/placeholder.jpg', ARRAY['/images/placeholder.jpg'], 'approved'
);

-- Health: Gym (Busan)
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Busan Beach Gym", "jp": "[TEST] 釜山ビーチジム", "cn": "[TEST] 釜山海滩健身房"}'::jsonb,
    'Gym', 'health', 'gym',
    '{"en": "Busan", "jp": "釜山", "cn": "釜山"}'::jsonb,
    '{"en": "88 Gwangalli Beach, Busan", "jp": "釜山広安里ビーチ88", "cn": "釜山广安里海滩88号"}'::jsonb,
    '{"en": "Beachfront gym with outdoor training area.", "jp": "屋外トレーニングエリア付きビーチフロントジム", "cn": "拥有户外训练区的海滨健身房"}'::jsonb,
    4.7, 55, 120, '/images/placeholder.jpg', ARRAY['/images/placeholder.jpg'], 'approved'
);

-- Health: Gym (Jeju)
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Jeju Nature Fitness", "jp": "[TEST] 済州ネイチャーフィットネス", "cn": "[TEST] 济州自然健身"}'::jsonb,
    'Gym', 'health', 'gym',
    '{"en": "Jeju", "jp": "済州", "cn": "济州"}'::jsonb,
    '{"en": "55 Jeju City Center, Jeju", "jp": "済州市内中心部55", "cn": "济州市中心55号"}'::jsonb,
    '{"en": "Eco-friendly gym with mountain views.", "jp": "山の景色が見えるエコフレンドリーなジム", "cn": "拥有山景的环保健身房"}'::jsonb,
    4.4, 32, 65, '/images/placeholder.jpg', ARRAY['/images/placeholder.jpg'], 'approved'
);

-- ============================================
-- TOURISM CATEGORY SHOPS
-- ============================================

-- Tourism: Tour (Jeju)
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Jeju Island Tours", "jp": "[TEST] 済州島ツアーズ", "cn": "[TEST] 济州岛旅游"}'::jsonb,
    'Tour', 'tourism', 'tour',
    '{"en": "Jeju", "jp": "済州", "cn": "济州"}'::jsonb,
    '{"en": "1 Jeju Airport, Jeju", "jp": "済州空港1", "cn": "济州机场1号"}'::jsonb,
    '{"en": "Explore Jeju volcanic landscapes, beaches, and traditional villages.", "jp": "済州の火山の景観、ビーチ、伝統的な村を探索", "cn": "探索济州火山景观、海滩和传统村庄"}'::jsonb,
    4.8, 150, 350, '/images/placeholder.jpg', ARRAY['/images/placeholder.jpg'], 'approved'
);

-- Tourism: Tour (Busan)
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Busan City Tours", "jp": "[TEST] 釜山シティツアーズ", "cn": "[TEST] 釜山城市旅游"}'::jsonb,
    'Tour', 'tourism', 'tour',
    '{"en": "Busan", "jp": "釜山", "cn": "釜山"}'::jsonb,
    '{"en": "5 Busan Station, Busan", "jp": "釜山駅5", "cn": "釜山站5号"}'::jsonb,
    '{"en": "Discover Busan temples, markets, and coastal scenery.", "jp": "釜山の寺院、市場、海岸の景色を発見", "cn": "探索釜山寺庙、市场和海岸风光"}'::jsonb,
    4.7, 120, 280, '/images/placeholder.jpg', ARRAY['/images/placeholder.jpg'], 'approved'
);

-- Tourism: Tour (Incheon)
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Incheon Heritage Tours", "jp": "[TEST] 仁川ヘリテージツアーズ", "cn": "[TEST] 仁川遗产旅游"}'::jsonb,
    'Tour', 'tourism', 'tour',
    '{"en": "Incheon", "jp": "仁川", "cn": "仁川"}'::jsonb,
    '{"en": "10 Chinatown, Incheon", "jp": "仁川中華街10", "cn": "仁川唐人街10号"}'::jsonb,
    '{"en": "Historical tours including Chinatown and colonial architecture.", "jp": "中華街と植民地時代の建築を含む歴史ツアー", "cn": "包括唐人街和殖民地建筑的历史之旅"}'::jsonb,
    4.5, 85, 180, '/images/placeholder.jpg', ARRAY['/images/placeholder.jpg'], 'approved'
);

-- ============================================
-- STAY CATEGORY SHOPS
-- ============================================

-- Stay: Hotel (Jeju)
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Jeju Ocean Resort", "jp": "[TEST] 済州オーシャンリゾート", "cn": "[TEST] 济州海洋度假村"}'::jsonb,
    'Hotel', 'stay', 'hotel',
    '{"en": "Jeju", "jp": "済州", "cn": "济州"}'::jsonb,
    '{"en": "200 Jungmun Resort Road, Jeju", "jp": "済州中文リゾートロード200", "cn": "济州中文度假路200号"}'::jsonb,
    '{"en": "5-star beachfront resort with spa and infinity pool.", "jp": "スパとインフィニティプール付き5つ星ビーチフロントリゾート", "cn": "拥有水疗和无边泳池的五星级海滨度假村"}'::jsonb,
    4.9, 200, 500, '/images/placeholder.jpg', ARRAY['/images/placeholder.jpg'], 'approved'
);

-- Stay: Hotel (Busan)
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Busan Skyline Hotel", "jp": "[TEST] 釜山スカイラインホテル", "cn": "[TEST] 釜山天际线酒店"}'::jsonb,
    'Hotel', 'stay', 'hotel',
    '{"en": "Busan", "jp": "釜山", "cn": "釜山"}'::jsonb,
    '{"en": "100 Haeundae Beach Road, Busan", "jp": "釜山海雲台ビーチロード100", "cn": "釜山海云台海滩路100号"}'::jsonb,
    '{"en": "Luxury hotel with rooftop bar and ocean views.", "jp": "ルーフトップバーとオーシャンビュー付きラグジュアリーホテル", "cn": "拥有屋顶酒吧和海景的豪华酒店"}'::jsonb,
    4.8, 180, 420, '/images/placeholder.jpg', ARRAY['/images/placeholder.jpg'], 'approved'
);

-- Stay: Hotel (Incheon)
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Incheon Airport Hotel", "jp": "[TEST] 仁川空港ホテル", "cn": "[TEST] 仁川机场酒店"}'::jsonb,
    'Hotel', 'stay', 'hotel',
    '{"en": "Incheon", "jp": "仁川", "cn": "仁川"}'::jsonb,
    '{"en": "1 Airport Road, Incheon", "jp": "仁川空港ロード1", "cn": "仁川机场路1号"}'::jsonb,
    '{"en": "Convenient hotel connected to Incheon Airport. Free shuttle service.", "jp": "仁川空港直結の便利なホテル。無料シャトルサービス", "cn": "与仁川机场相连的便捷酒店。免费班车服务"}'::jsonb,
    4.6, 250, 380, '/images/placeholder.jpg', ARRAY['/images/placeholder.jpg'], 'approved'
);

-- Stay: Hotel (Jeju - Budget)
INSERT INTO shops (
    name, category, main_category, sub_category, region, address, description,
    rating, review_count, like_count, image_url, images, status
) VALUES (
    '{"en": "[TEST] Jeju Backpackers Inn", "jp": "[TEST] 済州バックパッカーズイン", "cn": "[TEST] 济州背包客旅馆"}'::jsonb,
    'Hotel', 'stay', 'hotel',
    '{"en": "Jeju", "jp": "済州", "cn": "济州"}'::jsonb,
    '{"en": "50 Jeju City Center, Jeju", "jp": "済州市内中心部50", "cn": "济州市中心50号"}'::jsonb,
    '{"en": "Budget-friendly hostel with shared kitchen and lounge.", "jp": "共用キッチンとラウンジ付きのバジェットホステル", "cn": "配有共用厨房和休息室的经济型旅馆"}'::jsonb,
    4.3, 95, 150, '/images/placeholder.jpg', ARRAY['/images/placeholder.jpg'], 'approved'
);

-- ============================================
-- TO DELETE ALL TEST DATA:
-- ============================================
-- DELETE FROM services WHERE shop_id IN (SELECT id FROM shops WHERE name->>'en' LIKE '[TEST]%');
-- DELETE FROM shops WHERE name->>'en' LIKE '[TEST]%';
