
import { signIn, signOut, auth } from "@/auth";
import Link from 'next/link';
import { User, LogOut } from 'lucide-react';
import Button from '@/components/ui/Button';

export default async function UserButton() {
    const session = await auth();

    if (!session?.user) {
        return (
            <form
                action={async () => {
                    "use server";
                    await signIn();
                }}
            >
                <Button variant="ghost" size="sm">Log In</Button>
            </form>
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

            <form
                action={async () => {
                    "use server";
                    await signOut();
                }}
            >
                <Button variant="ghost" size="sm" title="Sign Out">
                    <LogOut size={16} />
                </Button>
            </form>
        </div>
    );
}
