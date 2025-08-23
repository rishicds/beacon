
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { data } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GuardianMailLogo from "@/components/icons/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LockKeyhole } from "lucide-react";

export default function SetPinPage() {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Redirect users based on their setup status
    if (user) {
        if (!user.pinSet) {
            // Users without PIN stay on this page for initial setup
        } else {
            // Users with PIN already set go to appropriate dashboard
            if (user.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/company-dashboard');
            }
            return null;
        }
    }


    const handleSetPin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You are not logged in." });
            return;
        }
        if (pin.length !== 6) {
            toast({ variant: "destructive", title: "Invalid PIN", description: "PIN must be exactly 6 digits." });
            return;
        }
        if (pin !== confirmPin) {
            toast({ variant: "destructive", title: "PINs Do Not Match", description: "Please ensure both PINs are the same." });
            return;
        }
        setIsLoading(true);
        try {
            // The `update` function in data.ts now handles hashing
            await data.users.update(user.id, { pinHash: pin, pinSet: true });
            await refreshUser(); // Refresh user state in context
            toast({ title: "PIN Set Successfully", description: "You can now access the dashboard." });
            
            // Redirect based on user role
            if (user.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/company-dashboard');
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to set PIN. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
             <div className="absolute top-8 flex items-center gap-2">
                <GuardianMailLogo className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">GuardianMail</span>
            </div>
            <Card className="w-full max-w-sm">
                 <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <LockKeyhole className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Set Your Secure PIN</CardTitle>
                    <CardDescription>
                       Welcome! To secure your account, please create a 6-digit PIN. You will use this PIN to authorize sending secure emails. You can update your PIN later in Settings.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSetPin} className="space-y-4">
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
                        <Button type="submit" className="w-full" disabled={isLoading}>
                           {isLoading ? "Saving..." : "Set PIN and Continue"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
