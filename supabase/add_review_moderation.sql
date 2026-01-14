-- Create a table for review moderation requests
CREATE TABLE IF NOT EXISTS review_moderation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES auth.users(id), -- Owner who requested
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    
    -- Ensure 1 pending request per review to avoid spam
    UNIQUE(review_id)
);

-- Enable RLS
ALTER TABLE review_moderation_requests ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Owners can insert requests for their own shops reviews
CREATE POLICY "Owners can create moderation requests"
    ON review_moderation_requests
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM shops
            WHERE shops.id = review_moderation_requests.shop_id
            AND shops.owner_id = auth.uid()
        )
    );

-- 2. Owners can view requests for their own shops
CREATE POLICY "Owners can view their own requests"
    ON review_moderation_requests
    FOR SELECT
    USING (
        requester_id = auth.uid()
    );

-- 3. Admins can view all requests
-- Assuming admin check is done via role or specific user ID in separate table. 
-- For simplicity, since we use SERVICE_ROLE on server-side for admin, we might not strictly need SELECT policy for "admin" role if accessed via admin API.
-- However, if we want to allow select for authenticated admins:
-- (Skipping strict admin check in RLS for now, relying on API logic or assumption that admin uses service role)

-- Initial seed data (optional)
-- No seed needed as it's user generated.
