/**
 * API Service Layer
 * Centralized functions for all API calls
 */

const API_BASE = '';

// Helper function for fetch
async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
}

// ============================================
// SHOPS
// ============================================

export interface Shop {
    id: string;
    owner_id: string | null;
    name: { en: string; jp?: string; cn?: string };
    category: string;
    region: { en: string; jp?: string; cn?: string };
    address: { en: string; jp?: string; cn?: string };
    description: { en: string; jp?: string; cn?: string };
    rating: number;
    review_count: number;
    like_count: number;
    image_url: string | null;
    images: string[];
    status: 'pending' | 'approved' | 'suspended';
    commission_rate?: number;
    services?: Service[];
    coupons?: Coupon[];
    reviews?: Review[];
}

export interface Service {
    id: string;
    shop_id: string;
    name: { en: string; jp?: string; cn?: string };
    duration_min: number;
    price: number;
}

export interface Coupon {
    id: string;
    shop_id: string;
    code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    min_purchase: number;
    valid_until: string;
    is_active: boolean;
}

export interface Review {
    id: string;
    user_id: string;
    shop_id: string;
    booking_id: string | null;
    rating: number;
    content: string;
    created_at: string;
    profiles?: { name: string; email: string };
}

export interface ShopsResponse {
    shops: Shop[];
}

export interface ShopResponse {
    shop: Shop;
}

export async function getShops(params?: {
    category?: string;
    location?: string;
    sort?: string;
}): Promise<Shop[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.location) searchParams.set('location', params.location);
    if (params?.sort) searchParams.set('sort', params.sort);

    const query = searchParams.toString();
    const { shops } = await fetchAPI<ShopsResponse>(`/api/shops${query ? `?${query}` : ''}`);
    return shops;
}

export async function getShop(id: string): Promise<Shop> {
    const { shop } = await fetchAPI<ShopResponse>(`/api/shops/${id}`);
    return shop;
}

// ============================================
// BOOKINGS
// ============================================

export interface Booking {
    id: string;
    user_id: string;
    shop_id: string;
    service_id: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    total_price: number;
    coupon_id: string | null;
    discount_amount: number;
    created_at: string;
    shops?: Shop;
    services?: Service;
}

export async function getMyBookings(): Promise<Booking[]> {
    const { bookings } = await fetchAPI<{ bookings: Booking[] }>('/api/bookings');
    return bookings;
}

export async function createBooking(data: {
    shopId: string;
    serviceId: string;
    date: string;
    time: string;
    totalPrice: number;
    couponId?: string;
    discountAmount?: number;
}): Promise<Booking> {
    const { booking } = await fetchAPI<{ booking: Booking }>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return booking;
}

export async function cancelBooking(id: string): Promise<Booking> {
    const { booking } = await fetchAPI<{ booking: Booking }>(`/api/bookings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
    });
    return booking;
}

// ============================================
// WISHLISTS
// ============================================

export async function getWishlist(): Promise<{ shopIds: string[]; wishlists: { shop_id: string; shops: Shop }[] }> {
    return fetchAPI('/api/wishlists');
}

export async function addToWishlist(shopId: string): Promise<void> {
    await fetchAPI(`/api/wishlists/${shopId}`, { method: 'POST' });
}

export async function removeFromWishlist(shopId: string): Promise<void> {
    await fetchAPI(`/api/wishlists/${shopId}`, { method: 'DELETE' });
}

// ============================================
// COUPONS
// ============================================

export interface UserCoupon {
    id: string;
    user_id: string;
    coupon_id: string;
    claimed_at: string;
    used_at: string | null;
    coupons: Coupon & { shops: { id: string; name: { en: string } } };
}

export async function getMyCoupons(): Promise<UserCoupon[]> {
    const { userCoupons } = await fetchAPI<{ userCoupons: UserCoupon[] }>('/api/coupons/my');
    return userCoupons;
}

export async function claimCoupon(couponId: string): Promise<void> {
    await fetchAPI(`/api/coupons/claim/${couponId}`, { method: 'POST' });
}

export async function getShopCoupons(shopId: string): Promise<Coupon[]> {
    const { coupons } = await fetchAPI<{ coupons: Coupon[] }>(`/api/coupons?shopId=${shopId}`);
    return coupons;
}

// ============================================
// REVIEWS
// ============================================

export async function getShopReviews(shopId: string): Promise<Review[]> {
    const { reviews } = await fetchAPI<{ reviews: Review[] }>(`/api/reviews/${shopId}`);
    return reviews;
}

export async function createReview(shopId: string, data: {
    rating: number;
    content: string;
    bookingId?: string;
}): Promise<Review> {
    const { review } = await fetchAPI<{ review: Review }>(`/api/reviews/${shopId}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return review;
}

// ============================================
// USER
// ============================================

export interface User {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    role: 'user' | 'owner' | 'admin';
    is_blocked?: boolean;
    created_at: string;
}

export async function getCurrentUser(): Promise<User | null> {
    const { user } = await fetchAPI<{ user: User | null }>('/api/users/me');
    return user;
}

export async function updateProfile(data: { name?: string; phone?: string }): Promise<User> {
    const { user } = await fetchAPI<{ user: User }>('/api/users/me', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return user;
}

// ============================================
// UPLOAD
// ============================================

export async function uploadImage(file: File, folder: string = 'general'): Promise<{ url: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
    }

    return res.json();
}

// ============================================
// ADMIN
// ============================================

export async function getAdminAnalytics(): Promise<{
    users: { total: number; byRole: { user: number; owner: number; admin: number } };
    shops: { total: number; byStatus: { approved: number; pending: number; suspended: number } };
    bookings: { total: number; totalGMV: number; completedGMV: number };
    financials: { platformRevenue: number; commissionRate: number };
}> {
    return fetchAPI('/api/admin/analytics');
}
