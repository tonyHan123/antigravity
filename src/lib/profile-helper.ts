/**
 * ============================================
 * Profile Helper - 프로필 관리 유틸리티
 * ============================================
 * 
 * 용도: API 라우트에서 사용자 프로필을 조회하거나 생성
 * 
 * 📌 데모 계정 설정:
 *   - user@example.com    → role: 'user'
 *   - owner@shop1.com     → role: 'owner', 고정 ID: 22222222-...
 *   - admin@example.com   → role: 'admin', 고정 ID: 33333333-...
 * 
 * ⚠️ 주의: DB에 UNIQUE(email) 제약이 있어야 중복 방지됨
 */

import { createServerClient } from '@/lib/supabase';
import { randomUUID } from 'crypto';

// ============================================
// 데모 계정 설정 (상수로 관리하여 일관성 유지)
// ============================================

const DEMO_ACCOUNTS: Record<string, { id: string; role: 'user' | 'owner' | 'admin'; name: string }> = {
    'user@example.com': {
        id: '11111111-1111-1111-1111-111111111111',
        role: 'user',
        name: 'Demo User',
    },
    'owner@shop1.com': {
        id: '22222222-2222-2222-2222-222222222222',
        role: 'owner',
        name: 'Jenny House Owner',
    },
    'admin@example.com': {
        id: '33333333-3333-3333-3333-333333333333',
        role: 'admin',
        name: 'Platform Admin',
    },
    'phdddblack@gmail.com': {
        id: '44444444-4444-4444-4444-444444444444',
        role: 'admin',
        name: 'Platform Admin',
    },
};

// ============================================
// 메인 함수: getOrCreateProfile
// ============================================

/**
 * 이메일로 프로필 조회, 없으면 새로 생성
 * 
 * @param supabase - Supabase 클라이언트
 * @param email - 사용자 이메일
 * @param name - 선택적 이름 (없으면 이메일에서 추출)
 * @returns 프로필 객체 { id, email, name, role, ... }
 */
export async function getOrCreateProfile(
    supabase: ReturnType<typeof createServerClient>,
    email: string,
    name?: string
) {
    // --------------------------------------------
    // STEP 1: 기존 프로필 조회
    // --------------------------------------------
    const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

    // 프로필이 이미 존재하면 반환
    if (existingProfile) {
        console.log(`[Profile] Found existing: ${email} (role: ${existingProfile.role})`);
        return existingProfile;
    }

    // --------------------------------------------
    // STEP 2: 신규 프로필 생성
    // --------------------------------------------
    // PGRST116 = "no rows returned" → 프로필 없음
    if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[Profile] Fetch error:', fetchError);
        throw new Error(`Failed to fetch profile: ${fetchError.message}`);
    }

    // 데모 계정인지 확인
    const demoConfig = DEMO_ACCOUNTS[email];

    const newProfile = {
        id: demoConfig?.id || randomUUID(),
        email,
        name: name || demoConfig?.name || email.split('@')[0],
        role: demoConfig?.role || 'user',
    };

    console.log(`[Profile] Creating new: ${email} (role: ${newProfile.role}, id: ${newProfile.id})`);

    // --------------------------------------------
    // STEP 3: 데모 계정 ID 충돌 처리 (자기 치유)
    // --------------------------------------------
    if (demoConfig) {
        const { data: existingById } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', demoConfig.id)
            .single();

        if (existingById && existingById.email !== email) {
            // 같은 ID로 다른 이메일이 등록된 경우 → 업데이트
            console.log(`[Profile] Self-healing: Updating ID ${demoConfig.id} from ${existingById.email} to ${email}`);

            const { data: updated, error: updateError } = await supabase
                .from('profiles')
                .update({ email, name: newProfile.name, role: newProfile.role })
                .eq('id', demoConfig.id)
                .select()
                .single();

            if (updateError) {
                console.error('[Profile] Update error:', updateError);
                throw new Error(`Failed to update demo profile: ${updateError.message}`);
            }
            return updated;
        }
    }

    // --------------------------------------------
    // STEP 4: 새 프로필 삽입
    // --------------------------------------------
    const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

    if (insertError) {
        // 23505 = unique_violation (이미 존재)
        if (insertError.code === '23505') {
            console.log('[Profile] Duplicate detected, fetching existing...');
            // 중복이면 기존 것 다시 조회
            const { data: retry } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', email)
                .single();
            return retry;
        }

        console.error('[Profile] Insert error:', insertError);
        throw new Error(`Failed to create profile: ${insertError.message}`);
    }

    console.log(`[Profile] Created successfully: ${email}`);
    return created;
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 데모 계정인지 확인
 */
export function isDemoAccount(email: string): boolean {
    return email in DEMO_ACCOUNTS;
}

/**
 * 데모 계정 설정 조회
 */
export function getDemoAccountConfig(email: string) {
    return DEMO_ACCOUNTS[email] || null;
}
