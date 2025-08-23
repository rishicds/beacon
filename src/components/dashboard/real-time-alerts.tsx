
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";

import { useAuth } from "@/context/auth-context";
import { data, type Alert } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function RealTimeAlerts() {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [isReportOpen, setReportOpen] = useState(false);

    const fetchAlerts = async () => {
        setIsLoading(true);
        if (!user) return;
        const companyId = user.role === 'admin' ? undefined : user.companyId;
        const alertData = await data.alerts.list({ companyId });
        setAlerts(alertData);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAlerts();
        
        const interval = setInterval(fetchAlerts, 30000);

        return () => clearInterval(interval);
    }, [user]);

    const handleResolve = (alertId: string) => {
        setAlerts(alerts.filter(a => a.id !== alertId));
    }
    
    const handleViewReport = (report: string) => {
        setSelectedReport(report);
        setReportOpen(true);
    };
    
    if (isLoading) {
        return (
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                        Real-Time Security Alerts
                    </CardTitle>
                    <CardDescription>
                        Active threats and suspicious activities requiring your attention.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2">
                             <Skeleton className="h-4 w-64" />
                             <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2">
                             <Skeleton className="h-4 w-72" />
                             <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (alerts.length === 0) {
        return (
            <Card className="shadow-lg">
                <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-green-500" />
                        System Secure
                    </CardTitle>
                    <CardDescription>
                        No active security alerts to report at this time.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-4">
                        <p>All systems are operating normally.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card className="shadow-lg border-destructive/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-6 w-6" />
                        Real-Time Security Alerts
                    </CardTitle>
                    <CardDescription>
                        Active threats and suspicious activities requiring your attention.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {alerts.map(alert => (
                        <div key={alert.id} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-destructive/10">
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="h-5 w-5 mt-1 text-destructive flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-sm">{alert.type}</p>
                                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow((alert.timestamp as Timestamp).toDate(), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {alert.incidentReport && (
                                    <Button variant="secondary" size="sm" onClick={() => handleViewReport(alert.incidentReport!)}>
                                        View Report
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => handleResolve(alert.id)}>
                                    Resolve
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Dialog open={isReportOpen} onOpenChange={setReportOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-6 w-6" />
                            AI-Generated Incident Report
                        </DialogTitle>
                        <DialogDescription>
                            This report was automatically generated based on the detected security event.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto rounded-lg border bg-secondary/30 p-4">
                        <pre className="whitespace-pre-wrap font-sans">{selectedReport}</pre>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
