import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

/**
 * GET /api/admin/analytics
 * Get admin dashboard analytics (Admin only)
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();

        // Check if admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('email', session.user.email)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get various analytics
        const [
            usersResult,
            shopsResult,
            bookingsResult,
            reviewsResult,
        ] = await Promise.all([
            // Total users by role
            supabase.from('profiles').select('role'),
            // Shops by status
            supabase.from('shops').select('status, rating, review_count, like_count'),
            // Bookings with totals
            supabase.from('bookings').select('status, total_price, created_at'),
            // Reviews
            supabase.from('reviews').select('rating'),
        ]);

        // Calculate user stats
        const users = usersResult.data || [];
        const userStats = {
            total: users.length,
            byRole: {
                user: users.filter(u => u.role === 'user').length,
                owner: users.filter(u => u.role === 'owner').length,
                admin: users.filter(u => u.role === 'admin').length,
            },
        };

        // Calculate shop stats
        const shops = shopsResult.data || [];
        const shopStats = {
            total: shops.length,
            byStatus: {
                approved: shops.filter(s => s.status === 'approved').length,
                pending: shops.filter(s => s.status === 'pending').length,
                suspended: shops.filter(s => s.status === 'suspended').length,
            },
            averageRating: shops.length > 0
                ? shops.reduce((sum, s) => sum + (s.rating || 0), 0) / shops.length
                : 0,
            totalReviews: shops.reduce((sum, s) => sum + (s.review_count || 0), 0),
            totalLikes: shops.reduce((sum, s) => sum + (s.like_count || 0), 0),
        };

        // Calculate booking stats
        const bookings = bookingsResult.data || [];
        const bookingStats = {
            total: bookings.length,
            byStatus: {
                pending: bookings.filter(b => b.status === 'pending').length,
                confirmed: bookings.filter(b => b.status === 'confirmed').length,
                completed: bookings.filter(b => b.status === 'completed').length,
                cancelled: bookings.filter(b => b.status === 'cancelled').length,
            },
            totalGMV: bookings.reduce((sum, b) => sum + (b.total_price || 0), 0),
            completedGMV: bookings
                .filter(b => b.status === 'completed')
                .reduce((sum, b) => sum + (b.total_price || 0), 0),
        };

        // Calculate review stats
        const reviews = reviewsResult.data || [];
        const reviewStats = {
            total: reviews.length,
            averageRating: reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0,
            distribution: {
                5: reviews.filter(r => r.rating === 5).length,
                4: reviews.filter(r => r.rating === 4).length,
                3: reviews.filter(r => r.rating === 3).length,
                2: reviews.filter(r => r.rating === 2).length,
                1: reviews.filter(r => r.rating === 1).length,
            },
        };

        // Platform revenue (assuming 10% commission)
        const commissionRate = 0.10;
        const platformRevenue = Math.round(bookingStats.completedGMV * commissionRate);

        return NextResponse.json({
            users: userStats,
            shops: shopStats,
            bookings: bookingStats,
            reviews: reviewStats,
            financials: {
                totalGMV: bookingStats.totalGMV,
                completedGMV: bookingStats.completedGMV,
                platformRevenue,
                commissionRate: commissionRate * 100,
            },
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

