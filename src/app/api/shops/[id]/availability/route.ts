import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * ============================================
 * Shop Availability API
 * GET /api/shops/[id]/availability?date=2026-01-15
 * 
 * Returns available time slots for a specific date
 * Considers: business hours, blocked slots, holidays, existing bookings
 * ============================================
 */

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id: shopId } = await context.params;
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        if (!date) {
            return NextResponse.json({ error: 'date is required (YYYY-MM-DD)' }, { status: 400 });
        }

        const supabase = createServerClient();

        // Get day of week (0 = Sunday, 6 = Saturday)
        const dayOfWeek = new Date(date).getDay();

        interface ShopHours {
            shop_id: string;
            day_of_week: number;
            open_time: string;
            close_time: string;
            is_closed: boolean;
        }

        interface BlockedSlot {
            start_time: string;
        }

        interface Holiday {
            reason?: string;
        }

        interface BookingMock {
            time: string;
            services?: {
                duration_min: number;
            } | null;
        }

        // ... existing code ...

        // Fetch all relevant data in parallel
        const [hoursResult, blockedResult, holidaysResult, bookingsResult] = await Promise.all([
            // 1. Business hours for this day
            supabase
                .from('shop_hours')
                .select('*')
                .eq('shop_id', shopId)
                .eq('day_of_week', dayOfWeek)
                .single(),

            // 2. Blocked slots for this date
            supabase
                .from('shop_blocked_slots')
                .select('start_time, end_time')
                .eq('shop_id', shopId)
                .eq('blocked_date', date),

            // 3. Check if this date is a holiday
            supabase
                .from('shop_holidays')
                .select('*')
                .eq('shop_id', shopId)
                .eq('date', date)
                .single(),

            // 4. Existing bookings for this date (confirmed or pending)
            supabase
                .from('bookings')
                .select('time, services(duration_min)')
                .eq('shop_id', shopId)
                .eq('date', date)
                .in('status', ['confirmed', 'pending'])
        ]);

        const hours = hoursResult.data as ShopHours | null;
        const blockedSlots = (blockedResult.data || []) as BlockedSlot[];
        const holiday = holidaysResult.data as Holiday | null;
        const bookings = (bookingsResult.data || []) as unknown as BookingMock[];

        // Check if holiday
        if (holiday) {
            return NextResponse.json({
                available: false,
                reason: 'holiday',
                message: holiday.reason || 'Shop is closed on this day',
                slots: []
            });
        }

        // If no hours set or shop closed on this day
        if (!hours || hours.is_closed) {
            return NextResponse.json({
                available: false,
                reason: 'closed',
                message: 'Shop is closed on this day',
                slots: []
            });
        }

        // Generate time slots based on business hours (30min intervals)
        const slots = generateTimeSlots(hours.open_time, hours.close_time);

        // Get blocked times (Owner explicitly blocked)
        const blockedTimes = new Set(blockedSlots.map(b => b.start_time.substring(0, 5)));

        // Calculate occupied time ranges from bookings
        const occupiedRanges = bookings.map(b => {
            const startStr = b.time.substring(0, 5);
            const [h, m] = startStr.split(':').map(Number);
            const startMin = h * 60 + m;
            const duration = b.services?.duration_min || 30; // Default to 30 if service missing
            return { start: startMin, end: startMin + duration };
        });

        // Mark slot availability
        const availableSlots = slots.map(timeStr => {
            const [h, m] = timeStr.split(':').map(Number);
            const slotStartMin = h * 60 + m;

            // Check if slot falls within any booked range
            // Slot is occupied if: BookedStart <= SlotStart < BookedEnd
            const isBooked = occupiedRanges.some(range =>
                slotStartMin >= range.start && slotStartMin < range.end
            );

            // Check if explicitly blocked
            const isBlocked = blockedTimes.has(timeStr);

            return {
                time: timeStr,
                available: !isBooked && !isBlocked,
                blocked: isBlocked,
                booked: isBooked
            };
        });

        return NextResponse.json({
            available: true,
            date,
            openTime: hours.open_time,
            closeTime: hours.close_time,
            slots: availableSlots
        });

    } catch (error: any) {
        console.error('Error in GET /api/shops/[id]/availability:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * Generate time slots between open and close times
 * @param openTime - Opening time (e.g., "10:00")
 * @param closeTime - Closing time (e.g., "20:00")
 * @returns Array of time strings
 */
function generateTimeSlots(openTime: string, closeTime: string): string[] {
    const slots: string[] = [];

    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);

    let currentHour = openHour;
    let currentMin = openMin;

    while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
        slots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`);

        // Add 30 minutes
        currentMin += 30;
        if (currentMin >= 60) {
            currentMin = 0;
            currentHour++;
        }
    }

    return slots;
}
