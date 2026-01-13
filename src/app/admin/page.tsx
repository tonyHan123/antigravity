
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard'; // Client component

export default async function PartnerDashboard() {
    const session = await auth();

    // 1. Check Auth & Role
    if (!session?.user) redirect('/login');
    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
        return <div className="container">Access Denied</div>;
    }

    // 2. Pass user to client dashboard
    return <AdminDashboard user={session.user} />;
}
