import { Shop, User, Booking } from '@/types';

export const MOCK_SHOPS: Shop[] = [
    {
        id: 'shop-1',
        ownerId: 'owner-1',
        name: { en: 'Jenny House Premium', jp: 'ジェニーハウスプレミアム', cn: 'Jenny House 高级', id: 'Jenny House Premium', hi: 'जेनी हाउस प्रीमियम' },
        category: 'Hair',
        region: { en: 'Seoul', jp: 'ソウル', cn: '首尔', id: 'Seoul', hi: 'सियोल' },
        address: { en: 'Gangnam-gu, Seoul', jp: 'ソウル江南区', cn: '首尔江南区', id: 'Gangnam-gu, Seoul', hi: 'गंगनम-गु, सियोल' },
        rating: 4.8,
        reviewCount: 120,
        description: {
            en: 'Celebrity favorite hair salon located in the heart of Gangnam using premium products.',
            jp: 'カンナムの中心に位置するセレブ御用達のヘアサロン。高級製品を使用。',
            cn: '位于江南中心的明星最爱发廊，使用高档产品。',
            id: 'Salon rambut favorit selebriti yang terletak di jantung Gangnam menggunakan produk premium.',
            hi: 'गंगनम के केंद्र में स्थित सेलिब्रिटी पसंदीदा हेयर सैलून प्रीमियम उत्पादों का उपयोग करता है।'
        },
        imageUrl: '/images/hair-1.jpg',
        images: ['/images/hair-1.jpg', '/images/hair-inner.jpg'],
        coupons: [
            {
                id: 'cpn-1',
                code: 'SUMMER10',
                name: 'Summer Hair Special',
                description: '10% off on all hair treatments',
                discountType: 'percent',
                discountValue: 10,
                validUntil: '2025-08-31',
                shopId: 'shop-1'
            },
            {
                id: 'cpn-2',
                code: 'FIRSTVISIT',
                name: 'First Visit Discount',
                description: '₩5,000 off for first time visitors',
                discountType: 'fixed',
                discountValue: 5000,
                validUntil: '2025-12-31',
                shopId: 'shop-1'
            }
        ],
        services: [
            { id: 'srv-1', name: { en: 'Premium Cut & Style', jp: 'プレミアムカット＆スタイル', cn: '高级剪发造型', id: 'Potong & Gaya Premium', hi: 'प्रीमियम कट और स्टाइल' }, durationMin: 60, price: 55000 },
            { id: 'srv-2', name: { en: 'K-Pop Idol Perm', jp: 'K-POPアイドルパーマ', cn: 'K-Pop偶像烫发', id: 'Keriting Idol K-Pop', hi: 'के-पॉप आइडल पर्म' }, durationMin: 180, price: 250000 },
            { id: 'srv-3', name: { en: 'Scalp Treatment', jp: 'スカルプトリートメント', cn: '头皮护理', id: 'Perawatan Kulit Kepala', hi: 'स्कैल्प ट्रीटमेंट' }, durationMin: 90, price: 120000 },
        ],
    },
    {
        id: 'shop-2',
        ownerId: 'owner-2',
        name: { en: 'Sulwhasoo Spa', jp: '雪花秀スパ', cn: '雪花秀水疗', id: 'Sulwhasoo Spa', hi: 'सुलह्वासू स्पा' },
        category: 'Massage',
        region: { en: 'Seoul', jp: 'ソウル', cn: '首尔', id: 'Seoul', hi: 'सियोल' },
        address: { en: 'Gangnam-gu, Seoul', jp: 'ソウル江南区', cn: '首尔江南区', id: 'Gangnam-gu, Seoul', hi: 'गंगनम-गु, सियोल' },
        rating: 4.9,
        reviewCount: 340,
        description: {
            en: 'Traditional Korean herbal medicine spa experience for ultimate relaxation.',
            jp: '究極のリラクゼーションのための韓国伝統漢方スパ体験。',
            cn: '体验极致放松的传统韩方水疗。',
            id: 'Pengalaman spa obat herbal tradisional Korea untuk relaksasi maksimal.',
            hi: 'परम विश्राम के लिए पारंपरिक कोरियाई हर्बल चिकित्सा स्पा अनुभव।'
        },
        imageUrl: '/images/spa-1.jpg',
        images: ['/images/spa-1.jpg', '/images/spa-inner.jpg'],
        services: [
            { id: 'srv-4', name: { en: 'Ginseng Signature Spa', jp: '高麗人参シグネチャースパ', cn: '人参招牌水疗', id: 'Spa Khas Ginseng', hi: 'जिनसेंग सिग्नेचर स्पा' }, durationMin: 90, price: 220000 },
            { id: 'srv-5', name: { en: 'Facial Balance', jp: 'フェイシャルバランス', cn: '面部平衡', id: 'Keseimbangan Wajah', hi: 'फेशियल बैलेंस' }, durationMin: 60, price: 150000 },
        ],
    },
    {
        id: 'shop-3',
        ownerId: 'owner-3',
        name: { en: 'Busan Ocean Nail', jp: '釜山オーシャンネイル', cn: '釜山海洋美甲', id: 'Busan Ocean Nail', hi: 'बुसान ओशन नेल' },
        category: 'Nail',
        region: { en: 'Busan', jp: '釜山', cn: '釜山', id: 'Busan', hi: 'बुसान' },
        address: { en: 'Haeundae-gu, Busan', jp: '釜山海雲台区', cn: '釜山海云台区', id: 'Haeundae-gu, Busan', hi: 'हे雲ड-गु, बुसान' },
        rating: 4.5,
        reviewCount: 45,
        description: {
            en: 'Beautiful nail art with an ocean view in Haeundae.',
            jp: '海雲台のオーシャンビューを楽しめる美しいネイルアート。',
            cn: '在海云台欣赏海景的同时享受美丽的美甲。',
            id: 'Seni kuku yang indah dengan pemandangan laut di Haeundae.',
            hi: 'हे雲ड में समुद्र के नज़ारों के साथ खूबसूरत नेल आर्ट।'
        },
        imageUrl: '/images/nail-1.jpg',
        images: ['/images/nail-1.jpg'],
        services: [
            { id: 'srv-6', name: { en: 'Gel Manicure', jp: 'ジェルマニキュア', cn: '凝胶美甲', id: 'Manikur Gel', hi: 'जेल मैनीक्योर' }, durationMin: 60, price: 60000 },
            { id: 'srv-7', name: { en: 'Pedicure Spa', jp: 'ペディキュアスパ', cn: '足部水疗', id: 'Spa Pedikur', hi: 'पेडिक्योर स्पा' }, durationMin: 70, price: 70000 },
        ],
    },
    {
        id: 'shop-4',
        ownerId: 'owner-4',
        name: { en: 'Artist Makeup Studio', jp: 'アーティストメイクスタジオ', cn: '艺术家化妆工作室', id: 'Artist Makeup Studio', hi: 'आर्टिस्ट मेकअप स्टूडियो' },
        category: 'Makeup',
        region: { en: 'Seoul', jp: 'ソウル', cn: '首尔', id: 'Seoul', hi: 'सियोल' },
        address: { en: 'Mapo-gu, Seoul', jp: 'ソウル麻浦区', cn: '首尔麻浦区', id: 'Mapo-gu, Seoul', hi: 'मापो-गु, सियोल' },
        rating: 4.7,
        reviewCount: 89,
        description: {
            en: 'Get the trendy K-Drama look with our professional makeup artists.',
            jp: 'プロのメイクアップアーティストによるトレンディなKドラマルックを。',
            cn: '由我们的专业化妆师打造时尚的韩剧造型。',
            id: 'Dapatkan tampilan K-Drama yang trendi dengan penata rias profesional kami.',
            hi: 'हमारे पेशेवर मेकअप कलाकारों के साथ ट्रेंडी के-ड्रामा लुक पाएं।'
        },
        imageUrl: '/images/makeup-1.jpg',
        images: ['/images/makeup-1.jpg'],
        services: [
            { id: 'srv-8', name: { en: 'Daily Natural Makeup', jp: 'デイリーナチュラルメイク', cn: '日常自然妆', id: 'Makeup Natural Harian', hi: 'डेली नेचुरल मेकअप' }, durationMin: 60, price: 80000 },
            { id: 'srv-9', name: { en: 'Idol Stage Makeup', jp: 'アイドルステージメイク', cn: '偶像舞台妆', id: 'Makeup Panggung Idol', hi: 'आइडल स्टेज मेकअप' }, durationMin: 90, price: 150000 },
        ],
    },
];

export const MOCK_USER: User = {
    id: 'user-guest',
    name: 'Foreign Visitor',
    email: 'visitor@example.com',
};

export const MOCK_BOOKINGS: Booking[] = [
    {
        id: 'bk-1',
        userId: 'user-guest',
        shopId: 'shop-1',
        serviceId: 'srv-1',
        date: '2026-02-15',
        time: '14:00',
        status: 'confirmed',
        totalPrice: 55000,
    },
    {
        id: 'bk-2',
        userId: 'user-guest',
        shopId: 'shop-2',
        serviceId: 'srv-4',
        date: '2026-03-01',
        time: '10:00',
        status: 'confirmed',
        totalPrice: 220000,
    }
];
