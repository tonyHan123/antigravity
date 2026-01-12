"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { Session } from "next-auth";
import React, { createContext, useContext } from "react";

const AuthContext = createContext<{ session: Session | null; user: Session['user'] | null | undefined }>({
    session: null,
    user: null,
});

export const AuthProvider = ({ children, session }: { children: React.ReactNode, session: Session | null }) => {
    return (
        <SessionProvider session={session}>
            <AuthContextWrapper session={session}>{children}</AuthContextWrapper>
        </SessionProvider>
    );
};

function AuthContextWrapper({ children, session }: { children: React.ReactNode, session: Session | null }) {
    const { data: clientSession } = useSession();
    // Use client session if available, otherwise server session
    const currentSession = clientSession || session;

    return (
        <AuthContext.Provider value={{ session: currentSession, user: currentSession?.user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
