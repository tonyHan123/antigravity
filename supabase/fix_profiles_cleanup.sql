-- ============================================
-- K-Beauty Platform: Profile Cleanup & Fix
-- 실행 날짜: 2026-01-14
-- 목적: 중복 프로필 정리 및 데모 계정 설정
-- ============================================

-- ============================================
-- STEP 1: 중복 프로필 삭제 (최신 것 제외)
-- ============================================
-- 같은 email로 여러 프로필이 있으면, 가장 최근 것만 남기고 삭제

DELETE FROM profiles p1
WHERE EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.email = p1.email
    AND p2.created_at > p1.created_at
);

-- 삭제 결과 확인
-- SELECT email, COUNT(*) FROM profiles GROUP BY email HAVING COUNT(*) > 1;

-- ============================================
-- STEP 2: 데모 계정 설정 (올바른 role 부여)
-- ============================================
-- 📌 데모 계정 목록:
--   - user@example.com    → role: 'user'
--   - owner@shop1.com     → role: 'owner', 고정 ID: 22222222-2222-2222-2222-222222222222
--   - admin@example.com   → role: 'admin', 고정 ID: 33333333-3333-3333-3333-333333333333

-- User Demo
UPDATE profiles 
SET role = 'user', name = 'Demo User'
WHERE email = 'user@example.com';

-- Owner Demo (Jenny House Premium 소유자)
UPDATE profiles 
SET 
    id = '22222222-2222-2222-2222-222222222222',
    role = 'owner', 
    name = 'Jenny House Owner'
WHERE email = 'owner@shop1.com';

-- Admin Demo
UPDATE profiles 
SET 
    id = '33333333-3333-3333-3333-333333333333',
    role = 'admin', 
    name = 'Platform Admin'
WHERE email = 'admin@example.com';

-- phdddblack@gmail.com도 Admin인 경우
UPDATE profiles 
SET role = 'admin', name = 'Platform Admin'
WHERE email = 'phdddblack@gmail.com';

-- ============================================
-- STEP 3: shops 테이블 owner_id 수정
-- ============================================
-- Jenny House Premium의 owner_id를 올바른 프로필 ID로 연결

UPDATE shops 
SET owner_id = '22222222-2222-2222-2222-222222222222'
WHERE id = 'dfee852d-8b82-4228-b1d4-f655848d5d1f';

-- 또는 모든 owner@shop1.com 관련 샵 수정
-- UPDATE shops 
-- SET owner_id = '22222222-2222-2222-2222-222222222222'
-- WHERE owner_id IN (SELECT id FROM profiles WHERE email = 'owner@shop1.com');

-- ============================================
-- STEP 4: UNIQUE 제약조건 추가 (중복 방지)
-- ============================================
-- ⚠️ 주의: 이미 존재하면 에러 발생할 수 있음

-- 먼저 기존 제약조건 확인 후 없으면 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_unique'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
    END IF;
END $$;

-- ============================================
-- STEP 5: 결과 확인 쿼리
-- ============================================

-- 데모 계정 확인
SELECT id, email, name, role, created_at 
FROM profiles 
WHERE email IN ('user@example.com', 'owner@shop1.com', 'admin@example.com', 'phdddblack@gmail.com')
ORDER BY email;

-- 전체 프로필 수 확인
SELECT COUNT(*) as total_profiles FROM profiles;

-- 역할별 분포
SELECT role, COUNT(*) FROM profiles GROUP BY role;
