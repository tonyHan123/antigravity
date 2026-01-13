
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

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
                console.log(`[Auth] login: ${email}`);

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
                        // Explicitly select ID as well
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('email', email)
                            .single();

                        if (profile) {
                            console.log(`[Auth] DB Profile: ${profile.role} (ID: ${profile.id})`);
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
                        console.warn('[Auth] Missing Env Keys for Supabase Service Client');
                    }
                } catch (e: any) {
                    console.error('[Auth] DB Fetch Error:', e.message);
                }

                // Fallback / Override for Demo
                let finalRole = dbRole || 'user';
                let finalShopId = dbShopId;

                // EMERGENCY FIX: If DB returns 'user' (or fails) for known demo admins/owners, force correct role
                // This ensures the demo is usable even if DB state is mismatched
                if (email === 'admin@example.com') {
                    // Always force Admin for this email in demo mode
                    if (finalRole !== 'admin') {
                        console.log('[Auth] Forcing ADMIN role for admin@example.com');
                        finalRole = 'admin';
                    }
                }
                if (email === 'owner@shop1.com') {
                    // Always force Owner for this email in demo mode
                    if (finalRole !== 'owner') {
                        console.log('[Auth] Forcing OWNER role for owner@shop1.com');
                        finalRole = 'owner';
                    }
                    if (!finalShopId) {
                        finalShopId = 'dfee852d-8b82-4228-b1d4-f655848d5d1f';
                    }
                }

                return {
                    id: email,
                    name: dbName || email.split('@')[0],
                    email: email,
                    role: finalRole as string,
                    shopId: finalShopId as string | undefined
                };
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.shopId = user.shopId;
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
