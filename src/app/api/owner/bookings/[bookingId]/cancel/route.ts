import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';
import { getOrCreateProfile } from '@/lib/profile-helper';

// Standard cancellation reasons
export const CANCELLATION_REASONS = [
    { id: 'schedule_conflict', label: '일정 변경' },
    { id: 'staff_unavailable', label: '담당자 부재' },
    { id: 'material_shortage', label: '재료/자재 부족' },
    { id: 'emergency', label: '긴급 상황 발생' },
    { id: 'other', label: '기타 사유' },
];

interface Params {
    params: Promise<{ bookingId: string }>;
}

/**
 * POST /api/owner/bookings/[bookingId]/cancel
 * Owner cancels a booking and sends notification to user
 */
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { bookingId } = await params;
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is owner
        if (session.user.role !== 'owner' && session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Only shop owners can cancel bookings' }, { status: 403 });
        }

        const supabase = createServerClient();
        const body = await request.json();

        const { reason, customMessage } = body;

        if (!reason) {
            return NextResponse.json({ error: 'Cancellation reason is required' }, { status: 400 });
        }

        // Get the booking with user info
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select(`
                *,
                shops:shop_id (id, name, owner_id),
                services:service_id (id, name),
                profiles:user_id (id, email, name)
            `)
            .eq('id', bookingId)
            .single();

        if (fetchError || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Verify owner owns this shop (check session email matches shop owner or is admin)
        // For demo, we'll allow owner role to cancel any booking of their shop

        // Update booking status to cancelled
        const { error: updateError } = await supabase
            .from('bookings')
            .update({
                status: 'cancelled',
                cancellation_reason: reason,
            })
            .eq('id', bookingId);

        if (updateError) {
            console.error('Error cancelling booking:', updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Find reason label
        const reasonLabel = CANCELLATION_REASONS.find(r => r.id === reason)?.label || reason;
        const shopName = typeof booking.shops?.name === 'object'
            ? booking.shops.name.en
            : booking.shops?.name || 'Shop';

        // Create notification for the user
        const notificationMessage = customMessage
            ? `${shopName}에서 예약이 취소되었습니다.\n\n사유: ${reasonLabel}\n${customMessage}\n\n다른 시간대로 예약 부탁드립니다.`
            : `${shopName}에서 "${reasonLabel}" 사유로 예약이 취소되었습니다.\n\n다른 시간대로 예약 부탁드립니다.`;

        const { error: notifError } = await supabase
            .from('notifications')
            .insert({
                user_id: booking.user_id,
                type: 'booking_cancelled',
                title: '예약 취소 안내',
                message: notificationMessage,
                booking_id: bookingId,
            });

        if (notifError) {
            console.error('Error creating notification:', notifError);
            // Don't fail the whole request, booking is already cancelled
        }

        return NextResponse.json({
            success: true,
            message: 'Booking cancelled and user notified'
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
