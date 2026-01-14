-- Fix FK constraint for review_moderation_requests
-- Completely remove the FK constraint on requester_id to prevent any issues with mock data

DO $$
BEGIN
    -- Drop existing FK if exists (original name)
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'review_moderation_requests_requester_id_fkey') THEN
        ALTER TABLE review_moderation_requests DROP CONSTRAINT review_moderation_requests_requester_id_fkey;
    END IF;
    
    -- Drop potentially new FK name (if previous script ran partially)
    -- Postgres auto-names constraints if not specified, but we specified names.
    -- Just in case.
END $$;
