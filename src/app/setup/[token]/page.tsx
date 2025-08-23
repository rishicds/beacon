
"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function SetupRedirect() {
    const router = useRouter();
    const params = useParams();
    const token = params.token as string;

    useEffect(() => {
        // Redirect to the new onboarding flow
        if (token) {
            router.replace(`/onboarding/${token}`);
        } else {
            router.replace('/login');
        }
    }, [token, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">Redirecting...</h2>
                <p className="text-muted-foreground">Taking you to the onboarding page.</p>
            </div>
        </div>
    );
}

    