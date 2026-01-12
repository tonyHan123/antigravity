export type Language = 'en' | 'jp' | 'cn' | 'id' | 'hi';
export type LocalizedString = string | Partial<Record<Language, string>>;

export type Category = 'Hair' | 'Nail' | 'Massage' | 'Makeup' | 'Spa';

export interface Service {
    id: string;
    name: LocalizedString;
    durationMin: number;
    price: number;
    description?: string;
}

export interface Coupon {
    id: string;
    code: string;
    name: string;
    description: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    validUntil: string;
    shopId?: string; // If specific to a shop, null if platform-wide
}

export interface Shop {
    id: string;
    ownerId: string;
    name: string;
    category: Category;
    region: LocalizedString; // e.g., 'Seoul', 'Busan'
    address: LocalizedString;
    rating: number; // 0-5
    reviewCount: number;
    description: LocalizedString;
    imageUrl: string; // Placeholder for now
    services: Service[];
    images: string[]; // Gallery
    coupons?: Coupon[]; // Available coupons to claim
}

export interface Booking {
    id: string;
    userId: string;
    shopId: string;
    serviceId: string;
    date: string; // ISO Date
    time: string; // HH:mm
    status: 'confirmed' | 'cancelled' | 'pending';
    totalPrice: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
}
