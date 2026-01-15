
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * ============================================
 * 종합 테스트 데이터 생성 API
 * ============================================
 * 
 * 기능:
 * - Upcoming 예약 생성 (미래 날짜)
 * - History 예약 생성 (과거 완료)
 * - 리뷰 데이터 생성
 * - Wishlist 생성
 * 
 * ⚠️ 개발 환경 전용 - Production에서는 403 반환
 */

export async function GET(request: NextRequest) {
    // Production 환경 차단
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: 'Debug APIs are disabled in production' },
            { status: 403 }
        );
    }

    try {
        const supabase = createServerClient();
        const results: any = {
            users: [],
            shops: [],
            services: [],
            upcomingBookings: [],
            historyBookings: [],
            reviews: [],
            wishlists: [],
            errors: []
        };

        // ============================================
        // 1. Demo Users 확인/생성
        // ============================================
        const DEMO_USERS = [
            { email: 'user@example.com', role: 'user', name: 'Demo User', id: '11111111-1111-1111-1111-111111111111' },
            { email: 'owner@shop1.com', role: 'owner', name: 'Jenny Owner', id: '22222222-2222-2222-2222-222222222222' },
            { email: 'admin@example.com', role: 'admin', name: 'Super Admin', id: '33333333-3333-3333-3333-333333333333' }
        ];

        for (const u of DEMO_USERS) {
            const { data: existing } = await supabase.from('profiles').select('*').eq('email', u.email).single();

            if (!existing) {
                const { error } = await supabase.from('profiles').insert({
                    id: u.id,
                    email: u.email,
                    role: u.role,
                    name: u.name
                });

                if (error) {
                    results.errors.push({ type: 'user', email: u.email, error: error.message });
                } else {
                    results.users.push({ email: u.email, status: 'created' });
                }
            } else {
                results.users.push({ email: u.email, status: 'exists' });
            }
        }

        // ============================================
        // 2. Shop과 Services 조회
        // ============================================
        const { data: shops } = await supabase
            .from('shops')
            .select('id, name, owner_id')
            .limit(5);

        if (!shops || shops.length === 0) {
            results.errors.push({ type: 'shops', error: 'No shops found in database' });
            return NextResponse.json(results);
        }

        results.shops = shops.map(s => ({ id: s.id, name: s.name }));

        // 각 shop의 services 조회
        const allServices: any[] = [];
        for (const shop of shops) {
            const { data: services } = await supabase
                .from('services')
                .select('*')
                .eq('shop_id', shop.id)
                .limit(3);

            if (services && services.length > 0) {
                allServices.push(...services.map(s => ({ ...s, shopId: shop.id })));
            }
        }

        results.services = allServices.map(s => ({ id: s.id, name: s.name, shopId: s.shopId }));

        // ============================================
        // 3. Demo User ID 조회 (실제 DB에서)
        // ============================================
        const { data: demoUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', 'user@example.com')
            .single();

        if (!demoUser) {
            results.errors.push({ type: 'user_lookup', error: 'Demo user not found in database' });
            return NextResponse.json({
                success: false,
                error: 'Demo user (user@example.com) not found. Please run /api/debug/seed-users first.',
                details: results
            });
        }

        const userId = demoUser.id;
        console.log('[Seed All] Using user ID:', userId);

        // ============================================
        // 4. Upcoming 예약 생성 (미래)
        // ============================================
        const today = new Date();

        const upcomingDates = [
            new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3일 후
            new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7일 후
            new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 14일 후
        ];

        for (let i = 0; i < Math.min(3, allServices.length); i++) {
            const service = allServices[i];
            const date = upcomingDates[i];

            const booking = {
                user_id: userId,
                shop_id: service.shopId,
                service_id: service.id,
                date: date.toISOString().split('T')[0],
                time: i === 0 ? '14:00' : i === 1 ? '15:30' : '10:00',
                status: 'confirmed',
                total_price: service.price || 50000,
                discount_amount: 0
            };

            const { data: created, error } = await supabase
                .from('bookings')
                .insert(booking)
                .select()
                .single();

            if (error) {
                results.errors.push({ type: 'upcoming_booking', error: error.message });
            } else {
                results.upcomingBookings.push({
                    id: created.id,
                    date: booking.date,
                    time: booking.time,
                    shopId: service.shopId
                });
            }
        }

        // ============================================
        // 4. History 예약 생성 (과거 완료)
        // ============================================
        const historyDates = [
            new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7일 전
            new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000), // 14일 전
            new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000), // 21일 전
            new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // 30일 전
        ];

        const completedBookings: any[] = [];

        for (let i = 0; i < Math.min(4, allServices.length); i++) {
            const service = allServices[i % allServices.length];
            const date = historyDates[i];

            const booking = {
                user_id: userId,
                shop_id: service.shopId,
                service_id: service.id,
                date: date.toISOString().split('T')[0],
                time: i % 2 === 0 ? '11:00' : '16:00',
                status: 'completed',
                total_price: service.price || 50000,
                discount_amount: 0
            };

            const { data: created, error } = await supabase
                .from('bookings')
                .insert(booking)
                .select()
                .single();

            if (error) {
                results.errors.push({ type: 'history_booking', error: error.message });
            } else {
                completedBookings.push(created);
                results.historyBookings.push({
                    id: created.id,
                    date: booking.date,
                    time: booking.time,
                    shopId: service.shopId
                });
            }
        }

        // ============================================
        // 5. 리뷰 생성 (완료된 예약의 70%에)
        // ============================================
        const reviewTexts = [
            '정말 만족스러운 서비스였어요! 다음에도 꼭 다시 방문하겠습니다.',
            '친절한 직원분들과 깨끗한 시설이 인상적이었습니다.',
            '가격 대비 훌륭한 퀄리티입니다. 추천해요!',
            '예약 시간도 잘 지켜주시고 서비스도 좋았습니다.'
        ];

        const ratings = [5, 5, 4, 5]; // 대부분 좋은 평가

        for (let i = 0; i < Math.min(3, completedBookings.length); i++) {
            const booking = completedBookings[i];

            const review = {
                user_id: userId,
                shop_id: booking.shop_id,
                booking_id: booking.id,
                rating: ratings[i % ratings.length],
                content: reviewTexts[i % reviewTexts.length]
            };

            const { data: created, error } = await supabase
                .from('reviews')
                .insert(review)
                .select()
                .single();

            if (error) {
                results.errors.push({ type: 'review', error: error.message });
            } else {
                results.reviews.push({
                    id: created.id,
                    rating: review.rating,
                    shopId: booking.shop_id
                });
            }
        }

        // ============================================
        // 6. Wishlist 생성
        // ============================================
        for (let i = 0; i < Math.min(2, shops.length); i++) {
            const shop = shops[i];

            const { error } = await supabase
                .from('wishlists')
                .insert({
                    user_id: userId,
                    shop_id: shop.id
                });

            if (error && error.code !== '23505') { // 23505 = unique violation (이미 존재)
                results.errors.push({ type: 'wishlist', error: error.message });
            } else {
                results.wishlists.push({ shopId: shop.id });
            }
        }

        // ============================================
        // 결과 요약
        // ============================================
        return NextResponse.json({
            success: true,
            summary: {
                users: results.users.length,
                upcomingBookings: results.upcomingBookings.length,
                historyBookings: results.historyBookings.length,
                reviews: results.reviews.length,
                wishlists: results.wishlists.length,
                errors: results.errors.length
            },
            details: results
        });

    } catch (e: any) {
        console.error('[Seed All] Error:', e);
        return NextResponse.json({
            success: false,
            error: e.message,
            stack: e.stack
        }, { status: 500 });
    }
}
