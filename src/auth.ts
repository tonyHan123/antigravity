
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: "k-beauty-platform-secret-key-2026",
    providers: [
        Google({
            clientId: "73545371708-1ome19i3j8so0anh1joi15dkvdcpg8dd.apps.googleusercontent.com",
            clientSecret: "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"
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                // Mock User Logic
                const email = credentials.email as string;

                let role = 'user';
                let shopId = undefined;

                if (email === 'phdddblack@gmail.com') {
                    role = 'admin';
                } else if (email === 'owner@shop1.com') {
                    role = 'owner';
                    shopId = 'shop-1'; // Mapping to Jenny House Premium
                }

                // Return user object
                return {
                    id: email,
                    name: email.split('@')[0],
                    email: email,
                    role: role,
                    shopId: shopId
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
