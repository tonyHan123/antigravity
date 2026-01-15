"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from 'next/link';
import { User, LogOut } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function UserButton() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <Button variant="ghost" size="sm" disabled>...</Button>;
    }

    if (!session?.user) {
        return (
            <Button variant="ghost" size="sm" onClick={() => signIn()}>
                Log In
            </Button>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/my-page">
                <Button variant="ghost" size="sm">
                    <User size={18} style={{ marginRight: 8 }} />
                    {session.user.name || 'My Trip'}
                </Button>
            </Link>

            <Button variant="ghost" size="sm" title="Sign Out" onClick={() => signOut()}>
                <LogOut size={16} />
            </Button>
        </div>
    );
}
