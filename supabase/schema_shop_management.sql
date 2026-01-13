-- Add private business fields to shops table
ALTER TABLE shops ADD COLUMN IF NOT EXISTS business_number VARCHAR(20);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS representative_name VARCHAR(100);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS business_license_url TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS contract_url TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS bank_name VARCHAR(50);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS bank_account VARCHAR(50);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS bank_holder VARCHAR(100);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS business_hours JSONB;

-- Create Storage Bucket 'images' if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies (Enable public read, authenticated insert)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'images' );
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'images' AND auth.role() = 'authenticated' );
