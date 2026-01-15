-- 1. Add new category columns
ALTER TABLE shops ADD COLUMN IF NOT EXISTS main_category TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS sub_category TEXT;

-- 2. Migrate existing data
-- K-Beauty subcategories
UPDATE shops 
SET main_category = 'k-beauty', 
    sub_category = LOWER(category) 
WHERE category IN ('Hair', 'Nail', 'Massage', 'Makeup', 'Spa');

-- 3. Set default for any remaining or NULL categories
UPDATE shops 
SET main_category = 'k-beauty',
    sub_category = 'hair'
WHERE main_category IS NULL;

-- 4. Create index for performance
CREATE INDEX IF NOT EXISTS idx_shops_main_category ON shops(main_category);
CREATE INDEX IF NOT EXISTS idx_shops_sub_category ON shops(sub_category);
