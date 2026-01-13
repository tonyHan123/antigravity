/**
 * Supabase Database Type Definitions
 * Generated from schema - update when schema changes
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

// Localized string type for multi-language support
export interface LocalizedString {
    en: string;
    jp?: string;
    cn?: string;
    id?: string;
    hi?: string;
}

// Enum types
export type UserRole = 'user' | 'owner' | 'admin';
export type ShopStatus = 'pending' | 'approved' | 'suspended';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type DiscountType = 'percent' | 'fixed';

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    name: string | null;
                    phone: string | null;
                    role: UserRole;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    name?: string | null;
                    phone?: string | null;
                    role?: UserRole;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string | null;
                    phone?: string | null;
                    role?: UserRole;
                    updated_at?: string;
                };
            };
            shops: {
                Row: {
                    id: string;
                    owner_id: string;
                    name: Json; // LocalizedString
                    category: string;
                    region: Json; // LocalizedString
                    address: Json; // LocalizedString
                    description: Json; // LocalizedString
                    rating: number;
                    review_count: number;
                    like_count: number;
                    image_url: string | null;
                    images: string[];
                    status: ShopStatus;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    owner_id: string;
                    name: Json;
                    category: string;
                    region: Json;
                    address: Json;
                    description: Json;
                    rating?: number;
                    review_count?: number;
                    like_count?: number;
                    image_url?: string | null;
                    images?: string[];
                    status?: ShopStatus;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    name?: Json;
                    category?: string;
                    region?: Json;
                    address?: Json;
                    description?: Json;
                    rating?: number;
                    review_count?: number;
                    like_count?: number;
                    image_url?: string | null;
                    images?: string[];
                    status?: ShopStatus;
                    updated_at?: string;
                };
            };
            services: {
                Row: {
                    id: string;
                    shop_id: string;
                    name: Json; // LocalizedString
                    duration_min: number;
                    price: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    shop_id: string;
                    name: Json;
                    duration_min: number;
                    price: number;
                    created_at?: string;
                };
                Update: {
                    name?: Json;
                    duration_min?: number;
                    price?: number;
                };
            };
            bookings: {
                Row: {
                    id: string;
                    user_id: string;
                    shop_id: string;
                    service_id: string;
                    date: string;
                    time: string;
                    status: BookingStatus;
                    total_price: number;
                    coupon_id: string | null;
                    discount_amount: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    shop_id: string;
                    service_id: string;
                    date: string;
                    time: string;
                    status?: BookingStatus;
                    total_price: number;
                    coupon_id?: string | null;
                    discount_amount?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    status?: BookingStatus;
                    updated_at?: string;
                };
            };
            reviews: {
                Row: {
                    id: string;
                    user_id: string;
                    shop_id: string;
                    booking_id: string | null;
                    rating: number;
                    content: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    shop_id: string;
                    booking_id?: string | null;
                    rating: number;
                    content: string;
                    created_at?: string;
                };
                Update: {
                    rating?: number;
                    content?: string;
                };
            };
            coupons: {
                Row: {
                    id: string;
                    shop_id: string;
                    code: string;
                    discount_type: DiscountType;
                    discount_value: number;
                    min_purchase: number;
                    valid_until: string;
                    is_active: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    shop_id: string;
                    code: string;
                    discount_type: DiscountType;
                    discount_value: number;
                    min_purchase?: number;
                    valid_until: string;
                    is_active?: boolean;
                    created_at?: string;
                };
                Update: {
                    code?: string;
                    discount_type?: DiscountType;
                    discount_value?: number;
                    min_purchase?: number;
                    valid_until?: string;
                    is_active?: boolean;
                };
            };
            wishlists: {
                Row: {
                    id: string;
                    user_id: string;
                    shop_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    shop_id: string;
                    created_at?: string;
                };
                Update: never;
            };
            user_coupons: {
                Row: {
                    id: string;
                    user_id: string;
                    coupon_id: string;
                    claimed_at: string;
                    used_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    coupon_id: string;
                    claimed_at?: string;
                    used_at?: string | null;
                };
                Update: {
                    used_at?: string | null;
                };
            };
        };
    };
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Shop = Database['public']['Tables']['shops']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Coupon = Database['public']['Tables']['coupons']['Row'];
export type Wishlist = Database['public']['Tables']['wishlists']['Row'];
export type UserCoupon = Database['public']['Tables']['user_coupons']['Row'];
