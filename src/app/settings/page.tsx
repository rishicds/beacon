"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { data } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LockKeyhole, ArrowLeft, Settings, Shield, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import AppHeader from "@/components/app-header";
import Link from "next/link";

export default function SettingsPage() {
    const { user, refreshUser, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [currentPin, setCurrentPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPinSection, setShowPinSection] = useState(false);
    const [showPinRequestSection, setShowPinRequestSection] = useState(false);
    const [pinRequestReason, setPinRequestReason] = useState("");

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col bg-muted/40">
                <AppHeader />
                <main className="flex-1 p-4 sm:p-6">
                    <Card className="max-w-4xl mx-auto shadow-lg">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">Loading...</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen flex-col bg-muted/40">
                <AppHeader />
                <main className="flex-1 p-4 sm:p-6">
                    <Card className="max-w-4xl mx-auto shadow-lg">
                        <CardContent className="p-8">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
                                <p className="text-muted-foreground mb-4">You must be logged in to access settings.</p>
                                <Button onClick={() => router.push('/login')}>Sign In</Button>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    // All authenticated users can access settings

    const dashboardHref = user.role === 'admin' ? '/admin' : '/company-dashboard';

    const handleSetPin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You are not logged in." });
            return;
        }

        // For users who already have a PIN, verify current PIN first
        if (user.pinSet) {
            if (!currentPin) {
                toast({ variant: "destructive", title: "Current PIN Required", description: "Please enter your current PIN to update it." });
                return;
            }
            try {
                const isCurrentPinValid = await data.users.verifyPin(user.id, currentPin);
                if (!isCurrentPinValid) {
                    toast({ variant: "destructive", title: "Invalid Current PIN", description: "The current PIN you entered is incorrect." });
                    return;
                }
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to verify current PIN." });
                return;
            }
        }

        if (newPin.length !== 6) {
            toast({ variant: "destructive", title: "Invalid PIN", description: "PIN must be exactly 6 digits." });
            return;
        }
        if (newPin !== confirmPin) {
            toast({ variant: "destructive", title: "PINs Do Not Match", description: "Please ensure both PINs are the same." });
            return;
        }

        setIsLoading(true);
        try {
            // The `update` function in data.ts handles hashing
            await data.users.update(user.id, { pinHash: newPin, pinSet: true });
            await refreshUser(); // Refresh user state in context
            toast({ title: "PIN Updated Successfully", description: "Your PIN has been updated." });
            setCurrentPin("");
            setNewPin("");
            setConfirmPin("");
            setShowPinSection(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update PIN. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPin = async () => {
        if (!user) return;
        
        setIsLoading(true);
        try {
            await data.users.resetPin(user.id);
            await refreshUser();
            toast({ title: "PIN Reset Successfully", description: "Your PIN has been reset. You can now set a new one." });
            setCurrentPin("");
            setNewPin("");
            setConfirmPin("");
            setShowPinSection(true);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to reset PIN. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePinRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !user.companyId) {
            toast({ variant: "destructive", title: "Error", description: "Missing user information." });
            return;
        }

        if (pinRequestReason.trim().length < 10) {
            toast({ variant: "destructive", title: "Invalid Reason", description: "Please provide a detailed reason (at least 10 characters)." });
            return;
        }

        setIsLoading(true);
        try {
            await data.pinResetRequests.create({
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                companyId: user.companyId,
                reason: pinRequestReason.trim(),
                status: 'pending',
            });
            toast({ title: "Request Submitted", description: "Your PIN change request has been submitted for admin approval." });
            setPinRequestReason("");
            setShowPinRequestSection(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to submit PIN change request. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <AppHeader />
            <main className="flex-1 p-4 sm:p-6">
                <Card className="max-w-4xl mx-auto shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <Link href={dashboardHref} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Dashboard</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            <h1 className="text-2xl font-bold">Settings</h1>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Profile Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-semibold">Profile Information</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                                    <p className="text-sm">{user.name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                    <p className="text-sm">{user.email}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                                    <p className="text-sm capitalize">{user.role.replace('_', ' ')}</p>
                                </div>
                                {user.companyId && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Company ID</Label>
                                        <p className="text-sm">{user.companyId}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Security Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-semibold">Security Settings</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <LockKeyhole className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="font-medium">Secure PIN</p>
                                            <p className="text-sm text-muted-foreground">
                                                {user.pinSet 
                                                    ? "PIN is currently set and active"
                                                    : "No PIN set - required for sending secure emails"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {user.role !== 'employee' && user.pinSet && (
                                            <Button 
                                                variant="outline" 
                                                onClick={handleResetPin}
                                                disabled={isLoading}
                                            >
                                                Reset PIN
                                            </Button>
                                        )}
                                        {user.role === 'employee' ? (
                                            <Button 
                                                onClick={() => setShowPinRequestSection(!showPinRequestSection)}
                                                disabled={isLoading}
                                            >
                                                Request PIN Change
                                            </Button>
                                        ) : (
                                            <Button 
                                                onClick={() => setShowPinSection(!showPinSection)}
                                                disabled={isLoading}
                                            >
                                                {user.pinSet ? "Change PIN" : "Set PIN"}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {showPinSection && (
                                    <Card className="border-primary/20">
                                        <CardHeader>
                                            <CardTitle className="text-lg">
                                                {user.pinSet ? "Update Your PIN" : "Set Your PIN"}
                                            </CardTitle>
                                            <CardDescription>
                                                {user.pinSet 
                                                    ? "Enter your current PIN and choose a new 6-digit PIN."
                                                    : "Choose a secure 6-digit PIN for authorizing email operations."
                                                }
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <form onSubmit={handleSetPin} className="space-y-4">
                                                {user.pinSet && (
                                                    <div className="space-y-2">
                                                        <Label htmlFor="currentPin">Current PIN</Label>
                                                        <Input
                                                            id="currentPin"
                                                            type="password"
                                                            maxLength={6}
                                                            value={currentPin}
                                                            onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                                                            required={user.pinSet}
                                                            className="text-center text-2xl tracking-[0.5em]"
                                                            placeholder="••••••"
                                                        />
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <Label htmlFor="newPin">New 6-Digit PIN</Label>
                                                    <Input
                                                        id="newPin"
                                                        type="password"
                                                        maxLength={6}
                                                        value={newPin}
                                                        onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                                                        required
                                                        className="text-center text-2xl tracking-[0.5em]"
                                                        placeholder="••••••"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="confirmPin">Confirm New PIN</Label>
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
                                                <div className="flex gap-2">
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        onClick={() => setShowPinSection(false)}
                                                        disabled={isLoading}
                                                        className="flex-1"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button 
                                                        type="submit" 
                                                        disabled={isLoading}
                                                        className="flex-1"
                                                    >
                                                        {isLoading ? "Saving..." : user.pinSet ? "Update PIN" : "Set PIN"}
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                )}

                                {showPinRequestSection && user.role === 'employee' && (
                                    <Card className="border-primary/20">
                                        <CardHeader>
                                            <CardTitle className="text-lg">Request PIN Change</CardTitle>
                                            <CardDescription>
                                                Please provide a reason for the PIN change request. This will be sent to your admin for approval.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <form onSubmit={handlePinRequest} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="pinRequestReason">Reason for PIN Change</Label>
                                                    <Textarea
                                                        id="pinRequestReason"
                                                        value={pinRequestReason}
                                                        onChange={e => setPinRequestReason(e.target.value)}
                                                        required
                                                        maxLength={250}
                                                        className="text-sm min-h-[80px]"
                                                        placeholder="Please provide a detailed reason for your PIN change request..."
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        {pinRequestReason.length}/250 characters (minimum 10 required)
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        onClick={() => setShowPinRequestSection(false)}
                                                        disabled={isLoading}
                                                        className="flex-1"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button 
                                                        type="submit" 
                                                        disabled={isLoading}
                                                        className="flex-1"
                                                    >
                                                        {isLoading ? "Submitting..." : "Submit Request"}
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Additional Settings Placeholder */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Preferences</h2>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    Additional settings and preferences will be available here in future updates.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
