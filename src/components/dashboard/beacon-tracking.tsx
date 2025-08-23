"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BeaconService } from "@/lib/beacon-service";
import { EmailService } from "@/lib/email-service";
import { 
    Eye, 
    Globe, 
    Smartphone, 
    Monitor, 
    Chrome,
    Firefox,
    Safari,
    MapPin,
    Clock,
    TrendingUp,
    Users,
    Mail
} from "lucide-react";

interface BeaconTrackingProps {
    companyId?: string;
    isAdmin?: boolean;
}

export default function BeaconTracking({ companyId, isAdmin = false }: BeaconTrackingProps) {
    const [beaconLogs, setBeaconLogs] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [topEmails, setTopEmails] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch revoked/flagged emails for warning display
    const [revokedEmails, setRevokedEmails] = useState<string[]>([]);
    useEffect(() => {
        // Fetch revoked emails from your backend (Firestore/Appwrite)
        // This is a placeholder, replace with your actual fetch logic
        async function fetchRevokedEmails() {
            // Example: fetch all emails with revoked: true
            // You may want to move this to a service
            try {
                const revoked = await EmailService.getRevokedEmails(companyId);
                setRevokedEmails(revoked);
            } catch (e) {
                setRevokedEmails([]);
            }
        }
        fetchRevokedEmails();
    }, [companyId]);

    useEffect(() => {
        fetchBeaconData();
    }, [companyId]);

    const fetchBeaconData = async () => {
        try {
            setLoading(true);
            
            // Fetch recent logs
            const logs = isAdmin 
                ? await BeaconService.getAllBeaconLogs(50)
                : await BeaconService.getBeaconLogsByCompany(companyId!, 50);
            
            // Fetch analytics
            const analyticsData = await BeaconService.getBeaconAnalytics(isAdmin ? undefined : companyId);
            
            // Fetch top opened emails
            const topEmailsData = await BeaconService.getTopOpenedEmails(isAdmin ? undefined : companyId, 5);
            
            setBeaconLogs(logs);
            setAnalytics(analyticsData);
            setTopEmails(topEmailsData);
        } catch (error) {
            console.error('Failed to fetch beacon data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getBrowserIcon = (browser: string) => {
        switch (browser.toLowerCase()) {
            case 'chrome':
                return <Chrome className="h-4 w-4" />;
            case 'firefox':
                return <Firefox className="h-4 w-4" />;
            case 'safari':
                return <Safari className="h-4 w-4" />;
            default:
                return <Globe className="h-4 w-4" />;
        }
    };

    const getDeviceIcon = (device: string) => {
        switch (device.toLowerCase()) {
            case 'mobile':
            case 'tablet':
                return <Smartphone className="h-4 w-4" />;
            default:
                return <Monitor className="h-4 w-4" />;
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!analytics) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-muted-foreground">No beacon tracking data available.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Show warning for revoked emails */}
            {revokedEmails.length > 0 && (
                <Card className="border-red-500">
                    <CardHeader>
                        <CardTitle className="text-red-600">Warning: Some secure links have been disabled due to suspicious activity</CardTitle>
                        <CardDescription>
                            The following emails had their secure links revoked after being opened from multiple devices or locations:
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-6">
                            {revokedEmails.map(emailId => (
                                <li key={emailId} className="text-red-500">Email ID: {emailId}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Analytics Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Opens</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalOpens}</div>
                        <p className="text-xs text-muted-foreground">
                            +{analytics.recentOpens} in last 7 days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Opens</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.uniqueOpens}</div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.openRate}% open rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Device</CardTitle>
                        {getDeviceIcon(Object.keys(analytics.deviceStats)[0] || 'desktop')}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Object.keys(analytics.deviceStats)[0] || 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {Object.values(analytics.deviceStats)[0] || 0} opens
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Location</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Object.keys(analytics.locationStats)[0] || 'Unknown'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {Object.values(analytics.locationStats)[0] || 0} opens
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Opened Emails */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Most Opened Emails
                    </CardTitle>
                    <CardDescription>
                        Emails with the highest open rates
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topEmails.length > 0 ? (
                            topEmails.map((email, index) => (
                                <div key={email.emailId} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline">#{index + 1}</Badge>
                                        <div>
                                            <p className="font-medium">{email.recipientEmail}</p>
                                            <p className="text-sm text-muted-foreground">Email ID: {email.emailId.slice(0, 8)}...</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">
                                        {email.openCount} opens
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground">No email opens tracked yet</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Tracking Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Recent Email Opens
                    </CardTitle>
                    <CardDescription>
                        Latest email tracking activity
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {beaconLogs.length > 0 ? (
                            beaconLogs.slice(0, 10).map((log, index) => (
                                <div key={log.$id} className="flex items-center justify-between border-b pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            {getBrowserIcon(log.browser)}
                                            {getDeviceIcon(log.device)}
                                        </div>
                                        <div>
                                            <p className="font-medium">{log.recipientEmail}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{log.device}</span>
                                                <Separator orientation="vertical" className="h-3" />
                                                <span>{log.browser}</span>
                                                <Separator orientation="vertical" className="h-3" />
                                                <span>{log.os}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-3 w-3" />
                                            <span>{log.location?.city || 'Unknown'}, {log.location?.country || 'Unknown'}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {formatTimestamp(log.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground">No tracking activity yet</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Device & Browser Statistics */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Monitor className="h-5 w-5" />
                            Device Types
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(analytics.deviceStats).map(([device, count]: [string, any]) => (
                                <div key={device} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {getDeviceIcon(device)}
                                        <span className="capitalize">{device}</span>
                                    </div>
                                    <Badge variant="secondary">{count}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Browser Types
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(analytics.browserStats).map(([browser, count]: [string, any]) => (
                                <div key={browser} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {getBrowserIcon(browser)}
                                        <span>{browser}</span>
                                    </div>
                                    <Badge variant="secondary">{count}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
