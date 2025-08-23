"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { redirect } from "next/navigation";
import { data, type PinResetRequest } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Key, ArrowLeft } from "lucide-react";
import AppHeader from "@/components/app-header";
import Link from "next/link";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Timestamp } from "firebase/firestore";

export default function PinRequestsPage() {
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const [requests, setRequests] = useState<PinResetRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRequests = async () => {
        try {
            const requestData = user?.role === 'admin' 
                ? await data.pinResetRequests.list()
                : await data.pinResetRequests.list({ companyId: user?.companyId });
            setRequests(requestData);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to fetch PIN requests." });
        }
    };

    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'company_admin')) {
            fetchRequests();
        }
    }, [user]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user || (user.role !== 'admin' && user.role !== 'company_admin')) {
        return redirect('/login');
    }

    const handleApprove = async (requestId: string, userId: string) => {
        setIsLoading(true);
        try {
            // Reset the user's PIN
            await data.users.resetPin(userId);
            
            // Update the request status
            await data.pinResetRequests.update(requestId, {
                status: 'approved',
                reviewedAt: Timestamp.now(),
                reviewedBy: user.id,
                reviewerName: user.name,
            });

            toast({ 
                title: "Request Approved", 
                description: "PIN has been reset. The user can now set a new PIN on their next login." 
            });
            
            fetchRequests();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to approve request." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async (requestId: string) => {
        setIsLoading(true);
        try {
            await data.pinResetRequests.update(requestId, {
                status: 'rejected',
                reviewedAt: Timestamp.now(),
                reviewedBy: user.id,
                reviewerName: user.name,
            });

            toast({ 
                title: "Request Rejected", 
                description: "The PIN change request has been rejected." 
            });
            
            fetchRequests();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to reject request." });
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: PinResetRequest['status']) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'approved':
                return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    const formatDate = (timestamp: Timestamp) => {
        return timestamp.toDate().toLocaleDateString() + ' at ' + timestamp.toDate().toLocaleTimeString();
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const processedRequests = requests.filter(r => r.status !== 'pending');

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <AppHeader />
            <main className="flex-1 p-4 sm:p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back to Admin</span>
                            </Link>
                            <div className="flex items-center gap-2">
                                <Key className="h-6 w-6 text-primary" />
                                <h1 className="text-2xl font-bold">PIN Reset Requests</h1>
                            </div>
                        </div>
                    </div>

                    {/* Pending Requests */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Pending Requests ({pendingRequests.length})
                            </CardTitle>
                            <CardDescription>
                                PIN change requests awaiting approval
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingRequests.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Requested</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingRequests.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell className="font-medium">{request.userName}</TableCell>
                                                <TableCell>{request.userEmail}</TableCell>
                                                <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                                                <TableCell>{formatDate(request.requestedAt)}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button size="sm" disabled={isLoading}>
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    Approve
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Approve PIN Reset Request</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to approve this PIN reset request for {request.userName}? 
                                                                        This will immediately reset their PIN and they will need to set a new one on their next login.
                                                                        <br /><br />
                                                                        <strong>Reason:</strong> {request.reason}
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction 
                                                                        onClick={() => handleApprove(request.id, request.userId)}
                                                                        disabled={isLoading}
                                                                    >
                                                                        Approve Reset
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                        
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="outline" size="sm" disabled={isLoading}>
                                                                    <XCircle className="h-4 w-4 mr-1" />
                                                                    Reject
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Reject PIN Reset Request</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to reject this PIN reset request for {request.userName}? 
                                                                        The employee will need to contact support or submit a new request.
                                                                        <br /><br />
                                                                        <strong>Reason:</strong> {request.reason}
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction 
                                                                        onClick={() => handleReject(request.id)}
                                                                        disabled={isLoading}
                                                                        className="bg-destructive hover:bg-destructive/90"
                                                                    >
                                                                        Reject Request
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8">
                                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                                    <p className="text-muted-foreground text-sm">
                                        All PIN reset requests have been processed
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Processed Requests History */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Request History</CardTitle>
                            <CardDescription>
                                Previously processed PIN reset requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {processedRequests.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Requested</TableHead>
                                            <TableHead>Reviewed By</TableHead>
                                            <TableHead>Reviewed At</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {processedRequests.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell className="font-medium">{request.userName}</TableCell>
                                                <TableCell>{request.userEmail}</TableCell>
                                                <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                                                <TableCell>{getStatusBadge(request.status)}</TableCell>
                                                <TableCell>{formatDate(request.requestedAt)}</TableCell>
                                                <TableCell>{request.reviewerName || 'N/A'}</TableCell>
                                                <TableCell>{request.reviewedAt ? formatDate(request.reviewedAt) : 'N/A'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8">
                                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Request History</h3>
                                    <p className="text-muted-foreground text-sm">
                                        No PIN reset requests have been processed yet
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
