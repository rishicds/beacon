"use client";

import { useAuth } from "@/context/auth-context";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, ExternalLink, Eye, AlertTriangle, Clock, CheckCircle, XCircle, Copy, MapPin, Monitor, Calendar, User as UserIcon, Building2, Paperclip } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { data, type Email, type User, type Company, type BeaconLog, type AccessLog } from "@/lib/data";
import { BeaconService } from "@/lib/beacon-service";
import AppHeader from "@/components/app-header";

type EmailDetails = Email & {
  senderName?: string;
  companyName?: string;
  beaconLogs: any[]; // Use BeaconService data instead
  accessLogs: AccessLog[];
};

export default function EmailDetailPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const emailId = params.id as string;
  const [email, setEmail] = useState<EmailDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEmailDetails() {
      if (!user || user.role !== 'admin' || !emailId) return;
      
      setIsLoading(true);
      try {
        const [allEmails, usersData, companiesData, accessLogsData] = await Promise.all([
          data.emails.list(),
          data.users.list(),
          data.companies.list(),
          data.accessLogs.list()
        ]);

        const emailData = allEmails.find(e => e.id === emailId);
        if (!emailData) {
          toast({
            variant: "destructive",
            title: "Email Not Found",
            description: "The requested email could not be found."
          });
          return;
        }

        // Fetch beacon logs from BeaconService
        const beaconLogs = await BeaconService.getBeaconLogsByEmail(emailId);

        const sender = usersData.find(u => u.id === emailData.senderId);
        const company = companiesData.find(c => c.id === emailData.companyId);
        const relatedAccessLogs = accessLogsData.filter(log => log.emailId === emailId);

        setEmail({
          ...emailData,
          senderName: sender?.name || 'Unknown',
          companyName: company?.name || (emailData.companyId === 'ADMIN' ? 'Admin' : 'Unknown'),
          beaconLogs: beaconLogs,
          accessLogs: relatedAccessLogs
        });
      } catch (error) {
        console.error('Failed to fetch email details:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load email details."
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchEmailDetails();
  }, [user, emailId, toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return redirect('/login');
  }

  const getEmailStatus = (email: EmailDetails) => {
    if (email.revoked) return 'revoked';
    
    const now = new Date();
    const expiresAt = email.expiresAt 
      ? (typeof email.expiresAt === 'string' ? new Date(email.expiresAt) : email.expiresAt.toDate())
      : null;
    
    if (expiresAt && now > expiresAt) return 'expired';
    if (email.accessLogs.some(log => log.status === 'Success')) return 'accessed';
    if (email.beaconLogs.length > 0) return 'opened';
    return 'sent';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'opened':
        return <Badge variant="default"><Eye className="h-3 w-3 mr-1" />Opened</Badge>;
      case 'accessed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Accessed</Badge>;
      case 'expired':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      case 'revoked':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Revoked</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const copySecureLink = (token: string) => {
    const link = `${window.location.origin}/secure/${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Secure link has been copied to clipboard."
    });
  };

  const revokeEmail = async () => {
    if (!email) return;
    
    try {
      await data.emails.revoke(email.id);
      setEmail({ ...email, revoked: true });
      toast({
        title: "Email Revoked",
        description: "The secure link has been revoked successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to revoke email."
      });
    }
  };

  const formatDate = (date: string | any) => {
    const d = typeof date === 'string' ? new Date(date) : date.toDate();
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  const formatDateShort = (date: string | any) => {
    const d = typeof date === 'string' ? new Date(date) : date.toDate();
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">Email Not Found</h2>
                <p className="text-muted-foreground mb-4">The requested email could not be found.</p>
                <Button asChild>
                  <Link href="/admin/emails">Back to Emails</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/emails" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to All Emails</span>
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Email Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Email Details
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(getEmailStatus(email))}
                        {email.isGuest && (
                          <Badge variant="outline">Guest</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copySecureLink(email.secureLinkToken)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Link
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/secure/${email.secureLinkToken}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {!email.revoked && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={revokeEmail}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">To</div>
                      <div className="font-medium">{email.recipient}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">From</div>
                      <div className="font-medium">{email.senderName}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Subject</div>
                    <div className="font-medium">{email.subject}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Body</div>
                    <div 
                      className="mt-2 p-4 border rounded-lg bg-muted/50 max-h-64 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: email.body }}
                    />
                  </div>

                  {email.attachmentFilename && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Attachment</div>
                      <div className="flex items-center gap-2 mt-2 p-2 border rounded-lg bg-muted/50">
                        <Paperclip className="h-4 w-4" />
                        <span>{email.attachmentFilename}</span>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Sent At</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(email.createdAt)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Expires At</div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {email.expiresAt 
                          ? formatDate(email.expiresAt)
                          : email.isGuest 
                            ? "24 hours (Guest)"
                            : "Never"
                        }
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Company</div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {email.companyName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Secure Token</div>
                      <div className="font-mono text-xs bg-muted p-2 rounded">
                        {email.secureLinkToken}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Beacon Logs */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Beacon Triggers ({email.beaconLogs.length})
                    {(() => {
                      const suspiciousCount = email.beaconLogs.filter((log, index) => {
                        if (index === 0) return false; // First log is never suspicious
                        const firstLog = email.beaconLogs[email.beaconLogs.length - 1]; // Oldest first
                        return log.ip !== firstLog?.ip || log.device !== firstLog?.device || log.userAgent !== firstLog?.userAgent;
                      }).length;
                      return suspiciousCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {suspiciousCount} Suspicious
                        </Badge>
                      );
                    })()}
                  </CardTitle>
                  <CardDescription>
                    Email open tracking and suspicious activity detection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const suspiciousLogs = email.beaconLogs.filter((log, index) => {
                      if (index === 0) return false;
                      const firstLog = email.beaconLogs[email.beaconLogs.length - 1];
                      return log.ip !== firstLog?.ip || log.device !== firstLog?.device || log.userAgent !== firstLog?.userAgent;
                    });
                    
                    return suspiciousLogs.length > 0 && (
                      <Card className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Suspicious Activity Detected
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                            <p>This email has been opened from multiple devices/locations, which may indicate unauthorized access:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {(() => {
                                const firstLog = email.beaconLogs[email.beaconLogs.length - 1];
                                const issues = [];
                                
                                const uniqueIPs = new Set(email.beaconLogs.map(log => log.ip));
                                if (uniqueIPs.size > 1) {
                                  issues.push(`${uniqueIPs.size} different IP addresses`);
                                }
                                
                                const uniqueDevices = new Set(email.beaconLogs.map(log => log.device));
                                if (uniqueDevices.size > 1) {
                                  issues.push(`${uniqueDevices.size} different device types`);
                                }
                                
                                const uniqueLocations = new Set(email.beaconLogs.map(log => {
                                  try {
                                    const location = typeof log.location === 'string' ? JSON.parse(log.location) : log.location;
                                    return `${location?.city || 'Unknown'}, ${location?.country || 'Unknown'}`;
                                  } catch {
                                    return 'Unknown';
                                  }
                                }));
                                if (uniqueLocations.size > 1) {
                                  issues.push(`${uniqueLocations.size} different locations`);
                                }
                                
                                return issues.map((issue, idx) => (
                                  <li key={idx}>{issue}</li>
                                ));
                              })()}
                            </ul>
                            {email.revoked && (
                              <p className="font-medium">⚠️ This email link has been automatically revoked for security.</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                  
                  {email.beaconLogs.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Device</TableHead>
                          <TableHead>Browser</TableHead>
                          <TableHead>OS</TableHead>
                          <TableHead>Timezone</TableHead>
                          <TableHead>Screen</TableHead>
                          <TableHead>Lat/Lng</TableHead>
                          <TableHead>Accuracy</TableHead>
                          <TableHead>IP</TableHead>
                          <TableHead>Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {email.beaconLogs.map((log, index) => {
                          const firstLog = email.beaconLogs[email.beaconLogs.length - 1]; // Oldest first
                          let suspiciousReasons: string[] = [];
                          const isSuspicious = index > 0 && (
                            (log.ip !== firstLog?.ip && suspiciousReasons.push(`IP changed: ${firstLog?.ip} → ${log.ip}`)) |
                            (log.device !== firstLog?.device && suspiciousReasons.push(`Device changed: ${firstLog?.device} → ${log.device}`)) |
                            (log.userAgent !== firstLog?.userAgent && suspiciousReasons.push('User agent changed'))
                          );
                          let location = {};
                          try {
                            location = typeof log.location === 'string' ? JSON.parse(log.location) : log.location || {};
                          } catch {
                            location = {};
                          }
                          return (
                            <TableRow key={log.$id} className={isSuspicious ? "bg-red-50 dark:bg-red-950/20" : ""}>
                              <TableCell>
                                {isSuspicious ? (
                                  <Badge variant="destructive" className="flex items-center gap-1 w-fit" title={suspiciousReasons.join('; ') || 'Suspicious activity detected'}>
                                    <AlertTriangle className="h-3 w-3" />
                                    Suspicious
                                  </Badge>
                                ) : (
                                  <Badge variant="default" className="flex items-center gap-1 w-fit" title="All parameters match the first open (IP, device, user agent)">
                                    <CheckCircle className="h-3 w-3" />
                                    Normal
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{log.device || 'N/A'}</TableCell>
                              <TableCell>
                                <span title={log.userAgent || ''} className="cursor-help underline decoration-dotted">
                                  {log.browser || 'N/A'}
                                </span>
                              </TableCell>
                              <TableCell>{log.os || 'N/A'}</TableCell>
                              <TableCell>{log.timezone || location.timezone || 'N/A'}</TableCell>
                              <TableCell>{log.screenResolution || 'N/A'}</TableCell>
                              <TableCell>
                                {typeof location.latitude === 'number' && typeof location.longitude === 'number'
                                  ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                                  : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {typeof location.accuracy === 'number' ? `${location.accuracy}m` : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <div className="font-mono text-sm">{log.ip}</div>
                              </TableCell>
                              <TableCell>{formatDateShort(log.timestamp)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No opens detected</h3>
                      <p className="text-muted-foreground">
                        This email has not been opened yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Access Logs Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Access Attempts ({email.accessLogs.length})
                  </CardTitle>
                  <CardDescription>
                    Secure link access history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {email.accessLogs.length > 0 ? (
                    <div className="space-y-4">
                      {email.accessLogs.map((log) => {
                        // Find the closest beacon log by timestamp and emailId
                        let matchedBeacon = null;
                        if (email.beaconLogs && email.beaconLogs.length > 0) {
                          const logTime = new Date(typeof log.timestamp === 'string' ? log.timestamp : log.timestamp.toDate());
                          matchedBeacon = email.beaconLogs
                            .filter(b => b.emailId === log.emailId)
                            .map(b => ({
                              ...b,
                              beaconTime: new Date(typeof b.timestamp === 'string' ? b.timestamp : b.timestamp.toDate())
                            }))
                            .sort((a, b) => Math.abs(a.beaconTime - logTime) - Math.abs(b.beaconTime - logTime))[0];
                        }
                        let location = {};
                        try {
                          location = matchedBeacon && matchedBeacon.location ?
                            (typeof matchedBeacon.location === 'string' ? JSON.parse(matchedBeacon.location) : matchedBeacon.location) : {};
                        } catch {
                          location = {};
                        }
                        return (
                          <div key={log.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-start justify-between mb-2">
                              <Badge 
                                variant={log.status === 'Success' ? 'default' : 'destructive'}
                                className="flex items-center gap-1"
                              >
                                {log.status === 'Success' ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                {log.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDateShort(log.timestamp)}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <UserIcon className="h-3 w-3 text-muted-foreground" />
                                {log.user}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {log.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                {log.ip}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Monitor className="h-3 w-3 text-muted-foreground" />
                                {matchedBeacon?.os || log.os || 'N/A'}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold">Browser:</span>
                                <span title={matchedBeacon?.userAgent || ''} className="cursor-help underline decoration-dotted">{matchedBeacon?.browser || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold">OS:</span>
                                <span>{matchedBeacon?.os || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold">Timezone:</span>
                                <span>{matchedBeacon?.timezone || location.timezone || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold">Screen:</span>
                                <span>{matchedBeacon?.screenResolution || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold">Lat/Lng:</span>
                                <span>{typeof location.latitude === 'number' && typeof location.longitude === 'number' ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold">Accuracy:</span>
                                <span>{typeof location.accuracy === 'number' ? `${location.accuracy}m` : 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No access attempts</h3>
                      <p className="text-muted-foreground text-sm">
                        No one has attempted to access this secure link yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Opens</span>
                    <span className="font-medium">{email.beaconLogs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Successful Access</span>
                    <span className="font-medium">
                      {email.accessLogs.filter(log => log.status === 'Success').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Failed Access</span>
                    <span className="font-medium">
                      {email.accessLogs.filter(log => log.status === 'Failed').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Unique Devices</span>
                    <span className="font-medium">
                      {new Set(email.beaconLogs.map(log => `${log.device}-${log.ip}`)).size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Unique Locations</span>
                    <span className="font-medium">
                      {new Set(email.beaconLogs.map(log => {
                        try {
                          const location = typeof log.location === 'string' 
                            ? JSON.parse(log.location) 
                            : log.location;
                          return `${location?.city || 'Unknown'}, ${location?.country || 'Unknown'}`;
                        } catch {
                          return 'Unknown';
                        }
                      })).size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Suspicious Opens</span>
                    <span className="font-medium">
                      {email.beaconLogs.filter(log => {
                        // Check if this open has different IP/device from first open
                        const firstLog = email.beaconLogs[email.beaconLogs.length - 1]; // Oldest first
                        return log.ip !== firstLog?.ip || log.device !== firstLog?.device;
                      }).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
