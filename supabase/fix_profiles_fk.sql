-- ============================================
-- K-Beauty Platform - Fix Profile Constraint
-- Remove the foreign key to auth.users since we use NextAuth
-- ============================================

-- Drop the foreign key constraint from profiles table
-- The constraint name is typically "profiles_id_fkey"
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- If the above doesn't work, try this alternative:
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;
-- ALTER TABLE profiles ADD PRIMARY KEY (id);
