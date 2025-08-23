
"use client";

import { useAuth } from "@/context/auth-context";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin-dashboard";

export default function AdminPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a proper skeleton loader
    }

    if (!user || user.role !== 'admin') {
        return redirect('/login');
    }
    
    return <AdminDashboard />;
}
