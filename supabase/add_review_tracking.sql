-- Add column to track when owner last viewed reviews
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_reviews_seen_at TIMESTAMPTZ DEFAULT NOW();

-- Set default for existing rows
UPDATE profiles SET last_reviews_seen_at = NOW() WHERE last_reviews_seen_at IS NULL;
