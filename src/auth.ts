
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DEMO_ACCOUNTS } from "@/lib/profile-helper";

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const email = credentials.email as string;
                console.log(`[Auth] Login attempt: ${email}`);

                let dbRole = null;
                let dbShopId = undefined;
                let dbName = undefined;

                try {
                    const { createClient } = await import('@supabase/supabase-js');
                    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
                        const supabase = createClient(
                            process.env.NEXT_PUBLIC_SUPABASE_URL,
                            process.env.SUPABASE_SERVICE_ROLE_KEY
                        );

                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('email', email)
                            .single();

                        if (profile) {
                            console.log(`[Auth] DB Profile found: ${profile.role} (ID: ${profile.id})`);
                            dbRole = profile.role;
                            dbName = profile.name;

                            if (profile.role === 'owner') {
                                const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', profile.id).single();
                                if (shop) dbShopId = shop.id;
                            }
                        } else {
                            console.warn(`[Auth] Profile not found in DB for ${email}`);
                        }
                    } else {
                        console.warn('[Auth] Missing Supabase env keys');
                    }
                } catch (e: any) {
                    console.error('[Auth] DB Fetch Error:', e.message);
                }

                // ============================================
                // 데모 계정 강제 처리 (통합 로직)
                // ============================================
                const demoConfig = DEMO_ACCOUNTS[email];
                let finalRole = dbRole || 'user';
                let finalShopId = dbShopId;

                if (demoConfig) {
                    // 데모 계정인 경우 항상 설정된 role로 강제
                    if (finalRole !== demoConfig.role) {
                        console.log(`[Auth] ⚠️ FORCING role for ${email}: ${finalRole} → ${demoConfig.role}`);
                        finalRole = demoConfig.role;
                    }

                    // owner@shop1.com의 경우 고정 shop ID 할당
                    if (email === 'owner@shop1.com' && !finalShopId) {
                        finalShopId = 'dfee852d-8b82-4228-b1d4-f655848d5d1f';
                    }
                }

                console.log(`[Auth] ✓ Login successful: ${email} as ${finalRole}${finalShopId ? ` (shop: ${finalShopId})` : ''}`);

                return {
                    id: email,
                    name: dbName || demoConfig?.name || email.split('@')[0],
                    email: email,
                    role: finalRole as string,
                    shopId: finalShopId as string | undefined
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            // 최초 로그인 시 user 객체에서 role 가져오기
            if (user) {
                console.log(`[JWT] Initial token creation for ${user.email}, role: ${user.role}`);
                token.role = user.role;
                token.shopId = user.shopId;
                return token;
            }

            // ============================================
            // JWT 갱신 시 데모 계정 role 재확인 (캐싱 이슈 해결)
            // ============================================
            if (token.email && typeof token.email === 'string') {
                const demoConfig = DEMO_ACCOUNTS[token.email];

                if (demoConfig && token.role !== demoConfig.role) {
                    console.log(`[JWT] 🔄 Correcting cached role for ${token.email}: ${token.role} → ${demoConfig.role}`);
                    token.role = demoConfig.role;

                    // owner@shop1.com의 경우 shopId도 재설정
                    if (token.email === 'owner@shop1.com') {
                        token.shopId = 'dfee852d-8b82-4228-b1d4-f655848d5d1f';
                    }
                }
            }

            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.shopId = token.shopId as string | undefined;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    }
});
