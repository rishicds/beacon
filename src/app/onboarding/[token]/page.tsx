"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { updatePassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { data, type User } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GuardianMailLogo from "@/components/icons/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, LockKeyhole } from "lucide-react";
import { Timestamp } from "firebase/firestore";

export default function OnboardingPage() {
    const router = useRouter();
    const params = useParams();
    const token = params.token as string;
    const { toast } = useToast();
    
    const [user, setUser] = useState<User | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState<'password' | 'pin'>('password');

    useEffect(() => {
        if (!token) {
            setError("Invalid onboarding link. No token provided.");
            setIsLoading(false);
            return;
        }

        const verifyToken = async () => {
            try {
                // Sign out any existing user first
                await signOut(auth);
                
                const userDoc = await data.users.findByToken(token);
                if (!userDoc || !userDoc.setupTokenExpires) {
                    setError("Invalid or expired onboarding link.");
                    setIsLoading(false);
                    return;
                }
                
                const expires = (userDoc.setupTokenExpires as Timestamp).toDate();
                if (expires < new Date()) {
                    setError("This onboarding link has expired. Please contact your administrator.");
                    setIsLoading(false);
                    return;
                }

                setUser(userDoc);
                setIsLoading(false);
            } catch (error) {
                console.error("Token verification error:", error);
                setError("Failed to verify onboarding link. Please try again.");
                setIsLoading(false);
            }
        };

        verifyToken();
    }, [token]);

    const handlePasswordSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password.length < 6) {
            toast({ variant: "destructive", title: "Password Too Short", description: "Password must be at least 6 characters long." });
            return;
        }
        if (password !== confirmPassword) {
            toast({ variant: "destructive", title: "Passwords Do Not Match", description: "Please ensure both passwords are the same." });
            return;
        }
        
        setIsSubmitting(true);
        try {
            // Sign in with the temporary password (setupToken) and then update to the new password
            await signInWithEmailAndPassword(auth, user!.email, user!.setupToken!);
            
            // Update password
            if (auth.currentUser) {
                await updatePassword(auth.currentUser, password);
            }
            
            toast({ title: "Password Set Successfully", description: "Now let's set up your secure PIN." });
            setStep('pin');
        } catch (error: any) {
            console.error("Password setup error:", error);
            // If sign in fails, it might be because the user is already signed in
            // Try to update password directly
            try {
                if (auth.currentUser && auth.currentUser.email === user!.email) {
                    await updatePassword(auth.currentUser, password);
                    toast({ title: "Password Set Successfully", description: "Now let's set up your secure PIN." });
                    setStep('pin');
                } else {
                    throw new Error("Authentication failed. Please try clicking the link from your email again.");
                }
            } catch (fallbackError: any) {
                toast({ variant: "destructive", title: "Error", description: fallbackError.message || "Failed to set up password. Please try again." });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePinSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (pin.length !== 6) {
            toast({ variant: "destructive", title: "Invalid PIN", description: "PIN must be exactly 6 digits." });
            return;
        }
        if (pin !== confirmPin) {
            toast({ variant: "destructive", title: "PINs Do Not Match", description: "Please ensure both PINs are the same." });
            return;
        }
        
        setIsSubmitting(true);
        try {
            // Update user with PIN and clear setup token
            const userRef = doc(db, "users", user!.id);
            await updateDoc(userRef, {
                pinHash: pin, // This will be hashed by the data.users.update function
                pinSet: true,
                setupToken: null,
                setupTokenExpires: null,
            });

            // Use the data.users.update to properly hash the PIN
            await data.users.update(user!.id, { pinHash: pin, pinSet: true });
            
            toast({ title: "Onboarding Complete", description: "Your account is now fully set up. Welcome to BeaconMail!" });
            
            // Redirect based on role
            if (user?.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/company-dashboard');
            }
        } catch (error: any) {
            console.error("PIN setup error:", error);
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to set up PIN. Please try again." });
        } finally {
            setIsSubmitting(false);
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
                <span className="text-xl font-bold text-foreground">BeaconMail</span>
            </div>
            <Card className="w-full max-w-sm">
                 <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        {step === 'password' ? (
                            <KeyRound className="h-8 w-8 text-primary" />
                        ) : (
                            <LockKeyhole className="h-8 w-8 text-primary" />
                        )}
                    </div>
                    <CardTitle className="text-2xl">
                        {step === 'password' ? 'Set Your Password' : 'Set Your Secure PIN'}
                    </CardTitle>
                    <CardDescription>
                        {step === 'password' 
                            ? `Welcome, ${user?.name}! Complete your account setup by creating a secure password.`
                            : 'Great! Now create a 6-digit PIN to secure your email access.'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 'password' ? (
                        <form onSubmit={handlePasswordSetup} className="space-y-4">
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
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                               {isSubmitting ? "Setting Password..." : "Set Password"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handlePinSetup} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pin">New 6-Digit PIN</Label>
                                <Input
                                    id="pin"
                                    type="password"
                                    maxLength={6}
                                    value={pin}
                                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))} // Only allow digits
                                    required
                                    className="text-center text-2xl tracking-[0.5em]"
                                    placeholder="••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                 <Label htmlFor="confirmPin">Confirm PIN</Label>
                                 <Input 
                                    id="confirmPin" 
                                    type="password" 
                                    maxLength={6}
                                    value={confirmPin}
                                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                    required
                                    className="text-center text-2xl tracking-[0.5em]"
                                    placeholder="••••••"
                                 />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                               {isSubmitting ? "Setting PIN..." : "Complete Setup"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
