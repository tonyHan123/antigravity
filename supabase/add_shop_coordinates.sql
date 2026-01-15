-- Add geolocation columns to shops table
ALTER TABLE shops ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS road_address TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS detail_address TEXT;

-- Create index for coordinate-based queries
CREATE INDEX IF NOT EXISTS idx_shops_coordinates ON shops(latitude, longitude);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'shops' 
AND column_name IN ('latitude', 'longitude', 'postal_code', 'road_address', 'detail_address');
