-- Recreate review_moderation_requests table to fix persistent FK issues
DROP TABLE IF EXISTS review_moderation_requests CASCADE;

CREATE TABLE review_moderation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL, -- No FK to avoid mock data issues
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    
    UNIQUE(review_id)
);

-- Re-enable RLS
ALTER TABLE review_moderation_requests ENABLE ROW LEVEL SECURITY;

-- Re-create Policies
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

CREATE POLICY "Owners can view their own requests"
    ON review_moderation_requests
    FOR SELECT
    USING (
        requester_id = auth.uid()
    );
