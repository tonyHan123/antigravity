import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/shops
 * Fetch all approved shops with optional filters
 * 
 * Query Params:
 * - category: Filter by category (Hair, Nail, Massage, Makeup)
 * - location: Filter by region (Seoul, Busan, Jeju, etc.)
 * - sort: Sorting option (recommended, rating, price_low, price_high)
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient();
        const searchParams = request.nextUrl.searchParams;

        const category = searchParams.get('category');
        const mainCategory = searchParams.get('main');
        const subCategory = searchParams.get('sub');
        const location = searchParams.get('location');
        const sort = searchParams.get('sort') || 'recommended';

        // Build query
        let query = supabase
            .from('shops')
            .select(`
        *,
        services (*)
      `)
            .eq('status', 'approved');

        // Apply filters
        // 1. New Hierarchical Filters
        if (mainCategory) {
            query = query.eq('main_category', mainCategory);
        }
        if (subCategory) {
            query = query.eq('sub_category', subCategory);
        }

        // 2. Legacy Category Filter (Backward Compatibility)
        // If 'category' is passed (e.g. 'Hair'), search in both old and new columns
        if (category && !mainCategory && !subCategory) {
            query = query.or(`category.ilike.${category},sub_category.ilike.${category}`);
        }

        if (location) {
            // Use ->> to extract as TEXT for ilike comparison
            query = query.or(`region->>en.ilike.%${location}%,region->>jp.ilike.%${location}%`);
        }

        // Apply sorting
        switch (sort) {
            case 'rating':
                query = query.order('rating', { ascending: false });
                break;
            case 'price_low':
                // Will sort by first service price on frontend
                query = query.order('rating', { ascending: false });
                break;
            case 'price_high':
                query = query.order('rating', { ascending: false });
                break;
            case 'recommended':
            default:
                query = query.order('like_count', { ascending: false });
                break;
        }

        const { data: shops, error } = await query;

        if (error) {
            console.error('Error fetching shops:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ shops });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

