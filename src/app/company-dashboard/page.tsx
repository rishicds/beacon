
"use client";

import { useAuth } from "@/context/auth-context";
import { redirect } from "next/navigation";
import CompanyDashboard from "@/components/company-dashboard";

export default function CompanyDashboardPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a proper skeleton loader
    }

    if (!user || (user.role !== 'company_admin' && user.role !== 'employee')) {
        return redirect('/login');
    }

    return <CompanyDashboard />;
}
