import { Shop, User, Booking } from '@/types';

export const MOCK_SHOPS: Shop[] = [
    {
        id: 'shop-1',
        name: 'Jenny House Premium',
        category: 'Hair',
        region: 'Seoul',
        address: 'Gangnam-gu, Seoul',
        rating: 4.8,
        reviewCount: 120,
        description: 'Celebrity favorite hair salon located in the heart of Gangnam using premium products.',
        imageUrl: '/images/hair-1.jpg',
        images: ['/images/hair-1.jpg', '/images/hair-inner.jpg'],
        services: [
            { id: 'srv-1', name: 'Premium Cut & Style', durationMin: 60, price: 55000 },
            { id: 'srv-2', name: 'K-Pop Idol Perm', durationMin: 180, price: 250000 },
            { id: 'srv-3', name: 'Scalp Treatment', durationMin: 90, price: 120000 },
        ],
    },
    {
        id: 'shop-2',
        name: 'Sulwhasoo Spa',
        category: 'Massage',
        region: 'Seoul',
        address: 'Gangnam-gu, Seoul',
        rating: 4.9,
        reviewCount: 340,
        description: 'Traditional Korean herbal medicine spa experience for ultimate relaxation.',
        imageUrl: '/images/spa-1.jpg',
        images: ['/images/spa-1.jpg', '/images/spa-inner.jpg'],
        services: [
            { id: 'srv-4', name: 'Ginseng Signature Spa', durationMin: 90, price: 220000 },
            { id: 'srv-5', name: 'Facial Balance', durationMin: 60, price: 150000 },
        ],
    },
    {
        id: 'shop-3',
        name: 'Busan Ocean Nail',
        category: 'Nail',
        region: 'Busan',
        address: 'Haeundae-gu, Busan',
        rating: 4.5,
        reviewCount: 45,
        description: 'Beautiful nail art with an ocean view in Haeundae.',
        imageUrl: '/images/nail-1.jpg',
        images: ['/images/nail-1.jpg'],
        services: [
            { id: 'srv-6', name: 'Gel Manicure', durationMin: 60, price: 60000 },
            { id: 'srv-7', name: 'Pedicure Spa', durationMin: 70, price: 70000 },
        ],
    },
    {
        id: 'shop-4',
        name: 'Artist Makeup Studio',
        category: 'Makeup',
        region: 'Seoul',
        address: 'Mapo-gu, Seoul',
        rating: 4.7,
        reviewCount: 89,
        description: 'Get the trendy K-Drama look with our professional makeup artists.',
        imageUrl: '/images/makeup-1.jpg',
        images: ['/images/makeup-1.jpg'],
        services: [
            { id: 'srv-8', name: 'Daily Natural Makeup', durationMin: 60, price: 80000 },
            { id: 'srv-9', name: 'Idol Stage Makeup', durationMin: 90, price: 150000 },
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
