-- ============================================
-- Storage Bucket: announcements
-- Used for handling announcement image uploads
-- ============================================

-- 1. Create Bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('announcements', 'announcements', true)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS Policies
-- Enable RLS (buckets have RLS enabled by default via storage.objects)

-- Policy: Anyone can view (public)
DROP POLICY IF EXISTS "Public View Announcements" ON storage.objects;
CREATE POLICY "Public View Announcements"
ON storage.objects FOR SELECT
USING ( bucket_id = 'announcements' );

-- Policy: Authenticated Admins can upload
-- Note: 'service_role' bypasses RLS, but for client-side upload we need a policy.
-- Assuming admins are authenticated users with role 'admin' in profiles table
-- OR simply allow any authenticated user to upload for now (refined later if needed)
DROP POLICY IF EXISTS "Auth Users Upload Announcements" ON storage.objects;
CREATE POLICY "Auth Users Upload Announcements"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'announcements' 
    AND auth.role() = 'authenticated'
);

-- Policy: Users can update/delete their own uploads (optional, usually admin only)
DROP POLICY IF EXISTS "Users Update Own Announcements" ON storage.objects;
CREATE POLICY "Users Update Own Announcements"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'announcements' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'announcements' AND auth.uid() = owner );

DROP POLICY IF EXISTS "Users Delete Own Announcements" ON storage.objects;
CREATE POLICY "Users Delete Own Announcements"
ON storage.objects FOR DELETE
USING ( bucket_id = 'announcements' AND auth.uid() = owner );
