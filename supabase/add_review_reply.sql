-- ============================================
-- Review System Migration
-- Add owner reply columns to reviews table
-- ============================================

-- Add columns for owner replies
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS owner_reply TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reply_at TIMESTAMPTZ;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reviews';
