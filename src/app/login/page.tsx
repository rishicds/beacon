
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
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
             <div className="absolute top-8 flex items-center gap-2">
                <GuardianMailLogo className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold text-slate-200">GuardianMail</span>
            </div>
            <Card className="w-full max-w-sm bg-slate-800/80 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-black/30">
                <CardHeader>
                    <CardTitle className="text-2xl text-slate-200">Login</CardTitle>
                    <CardDescription className="text-slate-400">
                        Enter your email below to login to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                            />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="password" className="text-slate-300">Password</Label>
                             <Input 
                                id="password" 
                                type="password" 
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                             />
                        </div>
                        <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0" disabled={isLoading}>
                           {isLoading ? "Logging in..." : "Login"}
                        </Button>
                        <Button variant="outline" className="w-full border-slate-600 bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 hover:text-slate-200" asChild>
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
