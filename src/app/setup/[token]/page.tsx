
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { data, type User } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GuardianMailLogo from "@/components/icons/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { KeyRound } from "lucide-react";
import { Timestamp } from "firebase/firestore";

export default function SetupAccountPage() {
    const router = useRouter();
    const params = useParams();
    const token = params.token as string;
    const { toast } = useToast();
    
    const [user, setUser] = useState<User | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) {
            setError("Invalid setup link. No token provided.");
            setIsLoading(false);
            return;
        }

        const verifyToken = async () => {
            const userDoc = await data.users.findByToken(token);
            if (!userDoc || !userDoc.setupTokenExpires) {
                setError("Invalid or expired setup link.");
                setIsLoading(false);
                return;
            }
            
            const expires = (userDoc.setupTokenExpires as Timestamp).toDate();
            if (expires < new Date()) {
                 setError("This setup link has expired. Please contact your administrator.");
                 setIsLoading(false);
                 return;
            }

            setUser(userDoc);
            setIsLoading(false);
        };

        verifyToken();
    }, [token]);

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!auth.currentUser || auth.currentUser.uid !== user?.id) {
             toast({ variant: "destructive", title: "Authentication Error", description: "It seems you are not logged in as the correct user. Please log out and click the link from your email again." });
             return;
        }
        
        if (password.length < 6) {
            toast({ variant: "destructive", title: "Password Too Short", description: "Password must be at least 6 characters long." });
            return;
        }
        if (password !== confirmPassword) {
            toast({ variant: "destructive", title: "Passwords Do Not Match", description: "Please ensure both passwords are the same." });
            return;
        }
        setIsLoading(true);

        try {
            // 1. Update Firebase Auth password
            await updatePassword(auth.currentUser, password);

            // 2. Clear the setup token from Firestore so it can't be reused
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
                setupToken: null,
                setupTokenExpires: null,
            });
            
            toast({ title: "Account Setup Successful", description: "Your password has been set. You can now log in." });
            router.push("/login");

        } catch (error: any) {
            console.error("Account setup error:", error);
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to set up account. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isLoading) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>
    }
    
    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
                 <Card className="w-full max-w-sm text-center">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                        <Button onClick={() => router.push('/login')} className="mt-4">Go to Login</Button>
                    </CardContent>
                 </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
             <div className="absolute top-8 flex items-center gap-2">
                <GuardianMailLogo className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">GuardianMail</span>
            </div>
            <Card className="w-full max-w-sm">
                 <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <KeyRound className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Set Your Password</CardTitle>
                    <CardDescription>
                       Welcome, {user?.name}! Complete your account setup by creating a secure password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSetup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="confirmPassword">Confirm Password</Label>
                             <Input 
                                id="confirmPassword" 
                                type="password" 
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                             />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                           {isLoading ? "Saving..." : "Set Password and Login"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

    