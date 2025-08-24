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
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
                <AppHeader />
                <main className="flex-1 p-4 sm:p-6">
                    <Card className="w-[90%] mx-auto shadow-xl bg-white border-gray-200">
                        <CardContent className="p-12">
                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
                                    <p className="text-gray-600 text-lg">Loading settings...</p>
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
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
                <AppHeader />
                <main className="flex-1 p-4 sm:p-6">
                    <Card className="w-[90%] mx-auto shadow-xl bg-white border-gray-200">
                        <CardContent className="p-12">
                            <div className="text-center">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                    <Shield className="h-8 w-8 text-red-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">Authentication Required</h2>
                                <p className="text-gray-600 mb-6">You must be logged in to access settings.</p>
                                <Button 
                                    onClick={() => router.push('/login')}
                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3"
                                >
                                    Sign In
                                </Button>
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
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <AppHeader />
            <main className="flex-1 p-4 sm:p-6">
                <Card className="w-[90%] mx-auto shadow-xl bg-white border-gray-200">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                        <div className="flex flex-row items-center justify-between">
                            <Link href={dashboardHref} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back to Dashboard</span>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
                                    <Settings className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8 p-8">
                        {/* Profile Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                                    <User className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                            </div>
                            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-green-700">Name</Label>
                                            <p className="text-lg text-gray-900 font-medium">{user.name}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-green-700">Email</Label>
                                            <p className="text-lg text-gray-900 font-medium">{user.email}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-green-700">Role</Label>
                                            <p className="text-lg text-gray-900 font-medium capitalize">{user.role.replace('_', ' ')}</p>
                                        </div>
                                        {user.companyId && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-green-700">Company ID</Label>
                                                <p className="text-lg text-gray-900 font-medium font-mono">{user.companyId}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                        {/* Security Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500">
                                    <Shield className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 hover:shadow-lg transition-all duration-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500">
                                                    <LockKeyhole className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-semibold text-gray-900">Secure PIN</p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {user.pinSet 
                                                            ? "✅ PIN is currently set and active"
                                                            : "⚠️ No PIN set - required for sending secure emails"
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                {user.role !== 'employee' && user.pinSet && (
                                                    <Button 
                                                        variant="outline" 
                                                        onClick={handleResetPin}
                                                        disabled={isLoading}
                                                        className="border-red-300 text-red-700 hover:bg-red-50"
                                                    >
                                                        Reset PIN
                                                    </Button>
                                                )}
                                                {user.role === 'employee' ? (
                                                    <Button 
                                                        onClick={() => setShowPinRequestSection(!showPinRequestSection)}
                                                        disabled={isLoading}
                                                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                                                    >
                                                        Request PIN Change
                                                    </Button>
                                                ) : (
                                                    <Button 
                                                        onClick={() => setShowPinSection(!showPinSection)}
                                                        disabled={isLoading}
                                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                                                    >
                                                        {user.pinSet ? "Change PIN" : "Set PIN"}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {showPinSection && (
                                    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
                                        <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100">
                                            <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
                                                <LockKeyhole className="h-5 w-5" />
                                                {user.pinSet ? "Update Your PIN" : "Set Your PIN"}
                                            </CardTitle>
                                            <CardDescription className="text-blue-700">
                                                {user.pinSet 
                                                    ? "Enter your current PIN and choose a new 6-digit PIN."
                                                    : "Choose a secure 6-digit PIN for authorizing email operations."
                                                }
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <form onSubmit={handleSetPin} className="space-y-6">
                                                {user.pinSet && (
                                                    <div className="space-y-3">
                                                        <Label htmlFor="currentPin" className="text-lg font-semibold text-gray-900">Current PIN</Label>
                                                        <Input
                                                            id="currentPin"
                                                            type="password"
                                                            maxLength={6}
                                                            value={currentPin}
                                                            onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                                                            required={user.pinSet}
                                                            className="text-center text-3xl tracking-[0.8em] h-16 border-2 border-blue-300 focus:border-blue-500 bg-white"
                                                            placeholder="••••••"
                                                        />
                                                    </div>
                                                )}
                                                <div className="space-y-3">
                                                    <Label htmlFor="newPin" className="text-lg font-semibold text-gray-900">New 6-Digit PIN</Label>
                                                    <Input
                                                        id="newPin"
                                                        type="password"
                                                        maxLength={6}
                                                        value={newPin}
                                                        onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                                                        required
                                                        className="text-center text-3xl tracking-[0.8em] h-16 border-2 border-blue-300 focus:border-blue-500 bg-white"
                                                        placeholder="••••••"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label htmlFor="confirmPin" className="text-lg font-semibold text-gray-900">Confirm New PIN</Label>
                                                    <Input 
                                                        id="confirmPin" 
                                                        type="password" 
                                                        maxLength={6}
                                                        value={confirmPin}
                                                        onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                                        required
                                                        className="text-center text-3xl tracking-[0.8em] h-16 border-2 border-blue-300 focus:border-blue-500 bg-white"
                                                        placeholder="••••••"
                                                    />
                                                </div>
                                                <div className="flex gap-4 pt-4">
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        onClick={() => setShowPinSection(false)}
                                                        disabled={isLoading}
                                                        className="flex-1 h-12 text-lg border-gray-300 hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button 
                                                        type="submit" 
                                                        disabled={isLoading}
                                                        className="flex-1 h-12 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                                                    >
                                                        {isLoading ? "Saving..." : user.pinSet ? "Update PIN" : "Set PIN"}
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                )}

                                {showPinRequestSection && user.role === 'employee' && (
                                    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg">
                                        <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100">
                                            <CardTitle className="text-xl text-orange-900 flex items-center gap-2">
                                                <User className="h-5 w-5" />
                                                Request PIN Change
                                            </CardTitle>
                                            <CardDescription className="text-orange-700">
                                                Please provide a reason for the PIN change request. This will be sent to your admin for approval.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <form onSubmit={handlePinRequest} className="space-y-6">
                                                <div className="space-y-3">
                                                    <Label htmlFor="pinRequestReason" className="text-lg font-semibold text-gray-900">Reason for PIN Change</Label>
                                                    <Textarea
                                                        id="pinRequestReason"
                                                        value={pinRequestReason}
                                                        onChange={e => setPinRequestReason(e.target.value)}
                                                        required
                                                        maxLength={250}
                                                        className="text-base min-h-[120px] border-2 border-orange-300 focus:border-orange-500 bg-white"
                                                        placeholder="Please provide a detailed reason for your PIN change request..."
                                                    />
                                                    <p className="text-sm text-orange-600 font-medium">
                                                        {pinRequestReason.length}/250 characters (minimum 10 required)
                                                    </p>
                                                </div>
                                                <div className="flex gap-4 pt-4">
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        onClick={() => setShowPinRequestSection(false)}
                                                        disabled={isLoading}
                                                        className="flex-1 h-12 text-lg border-gray-300 hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button 
                                                        type="submit" 
                                                        disabled={isLoading}
                                                        className="flex-1 h-12 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
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

                        <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                        {/* Additional Settings Placeholder */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                                    <Settings className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Preferences</h2>
                            </div>
                            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                                <CardContent className="p-6">
                                    <div className="text-center py-8">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                                            <Settings className="h-8 w-8 text-white" />
                                        </div>
                                        <p className="text-lg text-gray-600">
                                            Additional settings and preferences will be available here in future updates.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
