export type Language = 'en' | 'jp' | 'cn' | 'id' | 'hi';
export type LocalizedString = string | Partial<Record<Language, string>>;

// Main Categories
export type MainCategory = 'k-beauty' | 'skin-laser' | 'health' | 'tourism' | 'stay';

// Subcategories
export type KBeautySubCategory = 'hair' | 'nail' | 'massage' | 'makeup';
export type HealthSubCategory = 'rehab' | 'gym';
export type SubCategory = KBeautySubCategory | HealthSubCategory | null;

// Legacy compatibility
export type Category = 'Hair' | 'Nail' | 'Massage' | 'Makeup' | 'Spa' | string;

export const CATEGORY_CONFIG = {
    'k-beauty': {
        label: 'K-Beauty',
        subcategories: ['hair', 'nail', 'massage', 'makeup'] as const
    },
    'skin-laser': {
        label: 'Skin & Laser',
        subcategories: [] as const
    },
    'health': {
        label: 'Health',
        subcategories: ['rehab', 'gym'] as const
    },
    'tourism': {
        label: 'Tourism',
        subcategories: [] as const
    },
    'stay': {
        label: 'Stay',
        subcategories: [] as const
    }
} as const;

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
    name: LocalizedString;
    description: LocalizedString;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    validUntil: string;
    shopId?: string; // If specific to a shop, null if platform-wide
    shopName?: LocalizedString; // Shop name for display in wallet
}

export interface Shop {
    id: string;
    ownerId: string;
    name: LocalizedString;
    category: Category;
    mainCategory?: MainCategory;
    subCategory?: SubCategory;
    region: LocalizedString; // e.g., 'Seoul', 'Busan'
    address: LocalizedString;
    rating: number; // 0-5
    reviewCount: number;
    likeCount: number; // For "Recommended" sort
    description: LocalizedString;
    imageUrl: string; // Placeholder for now
    services: Service[];
    images: string[]; // Gallery
    coupons?: Coupon[]; // Available coupons to claim

    // Private/Business Fields
    businessNumber?: string;
    representativeName?: string;
    businessLicenseUrl?: string; // URL
    contractUrl?: string; // URL
    bankName?: string;
    bankAccount?: string;
    bankHolder?: string;
    contactPhone?: string;
    businessHours?: Record<string, string>; // e.g. { "mon": "09:00-18:00" }
}

export interface Review {
    id: string;
    shopId: string;
    userId: string;
    userName: string;
    rating: number;
    content: string;
    photos?: string[]; // URLs of uploaded photos
    date: string;
    reply?: string; // Owner's reply
    replyDate?: string;
    moderationRequest?: {
        status: 'pending' | 'approved' | 'rejected';
        reason: string;
        requestDate: string;
    };
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

export interface Message {
    id: string;
    shopId: string;
    sender: 'admin' | 'owner';
    content: string;
    timestamp: string;
    isRead: boolean;
}
