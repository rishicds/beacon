
"use client";
import { redirect } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import AdminDashboard from './admin-dashboard';
import CompanyDashboard from './company-dashboard';

export default function Dashboard() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a proper skeleton loader
    }

    if (!user) {
        return redirect('/login');
    }

    if (user.role === 'admin') {
        return <AdminDashboard />;
    }

    if (user.role === 'company_admin' || user.role === 'employee') {
        return <CompanyDashboard />;
    }

    return redirect('/login');
}
