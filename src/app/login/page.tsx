
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GuardianMailLogo from "@/components/icons/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";


export default function LoginPage() {
    const { login, user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email, password);
            // Redirection is handled by the useEffect below
        } catch (error: any) {
            console.error("Login failed", error);
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.message || "Invalid credentials. Please try again.",
            })
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (!authLoading && authUser) {
            // Let the auth context handle redirection based on PIN status
            // This ensures users without PIN are sent to set-pin first
            if (authUser.pinSet) {
                if (authUser.role === 'admin') {
                    router.push('/admin');
                } else {
                    router.push('/company-dashboard');
                }
            }
            // If PIN is not set, auth context will redirect to /set-pin
        }
    }, [authUser, authLoading, router])

    if (authLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                 <div>Loading...</div>
            </div>
        )
    }
    
    // If user is already logged in, redirect them
    if (authUser) {
      return null; // Or a loading spinner while redirect happens
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
             <div className="absolute top-8 flex items-center gap-2">
                <GuardianMailLogo className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">GuardianMail</span>
            </div>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="password">Password</Label>
                             <Input 
                                id="password" 
                                type="password" 
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                             />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                           {isLoading ? "Logging in..." : "Login"}
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/signup">
                                Create an account
                            </Link>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
