-- ============================================
-- K-Beauty Platform - Notifications Schema
-- For booking cancellation notifications
-- ============================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'booking_cancelled',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = user_id AND email = current_setting('request.jwt.claims', true)::json->>'email'
    ));

-- For server-side operations with service role key
CREATE POLICY "Service role can manage all notifications"
    ON notifications FOR ALL
    USING (true)
    WITH CHECK (true);

-- Add cancellation_reason column to bookings if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'cancellation_reason'
    ) THEN
        ALTER TABLE bookings ADD COLUMN cancellation_reason VARCHAR(100);
    END IF;
END $$;

-- Update bookings status default to 'confirmed' instead of 'pending'
-- (Bookings are auto-confirmed on creation)
