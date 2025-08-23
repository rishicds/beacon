"use client";

import { useAuth } from "@/context/auth-context";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Mail, ExternalLink, Eye, AlertTriangle, Clock, CheckCircle, XCircle, Copy, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { data, type Email, type User, type Company, type BeaconLog, type AccessLog } from "@/lib/data";
import AppHeader from "@/components/app-header";

type EmailWithRelatedData = Email & {
  senderName?: string;
  companyName?: string;
  beaconLogs: BeaconLog[];
  accessLogs: AccessLog[];
};

export default function EmailsPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [emails, setEmails] = useState<EmailWithRelatedData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchData() {
      if (!user || user.role !== 'admin') return;
      
      setIsLoading(true);
      try {
        const [emailsData, usersData, companiesData, beaconLogsData, accessLogsData] = await Promise.all([
          data.emails.list(),
          data.users.list(),
          data.companies.list(),
          data.beaconLogs.list(),
          data.accessLogs.list()
        ]);

        // Combine emails with related data
        const emailsWithData: EmailWithRelatedData[] = emailsData.map(email => {
          const sender = usersData.find(u => u.id === email.senderId);
          const company = companiesData.find(c => c.id === email.companyId);
          const relatedBeaconLogs = beaconLogsData.filter(log => log.emailId === email.id);
          const relatedAccessLogs = accessLogsData.filter(log => log.emailId === email.id);

          return {
            ...email,
            senderName: sender?.name || 'Unknown',
            companyName: company?.name || (email.companyId === 'ADMIN' ? 'Admin' : 'Unknown'),
            beaconLogs: relatedBeaconLogs,
            accessLogs: relatedAccessLogs
          };
        });

        // Sort by creation date (newest first)
        emailsWithData.sort((a, b) => {
          const aDate = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt.toDate();
          const bDate = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt.toDate();
          return bDate.getTime() - aDate.getTime();
        });

        setEmails(emailsWithData);
        setUsers(usersData);
        setCompanies(companiesData);
      } catch (error) {
        console.error('Failed to fetch emails data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load emails data."
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user, toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return redirect('/login');
  }

  const getEmailStatus = (email: EmailWithRelatedData) => {
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

  const revokeEmail = async (emailId: string) => {
    try {
      await data.emails.revoke(emailId);
      setEmails(emails.map(email => 
        email.id === emailId ? { ...email, revoked: true } : email
      ));
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

  const filteredEmails = emails.filter(email => {
    const matchesSearch = 
      email.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.senderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || getEmailStatus(email) === statusFilter;
    const matchesCompany = companyFilter === 'all' || email.companyId === companyFilter;
    
    return matchesSearch && matchesStatus && matchesCompany;
  });

  const formatDate = (date: string | any) => {
    const d = typeof date === 'string' ? new Date(date) : date.toDate();
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                All Emails
              </CardTitle>
              <CardDescription>
                View and manage all secure emails sent through the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="sm:max-w-sm"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="opened">Opened</SelectItem>
                    <SelectItem value="accessed">Accessed</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="sm:w-48">
                    <SelectValue placeholder="Filter by company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmails.map((email) => (
                      <TableRow key={email.id}>
                        <TableCell>
                          <div className="font-medium">{email.recipient}</div>
                          {email.isGuest && (
                            <Badge variant="outline" className="text-xs mt-1">Guest</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={email.subject}>
                            {email.subject}
                          </div>
                          {email.attachmentFilename && (
                            <div className="text-xs text-muted-foreground mt-1">
                              📎 {email.attachmentFilename}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{email.senderName}</TableCell>
                        <TableCell>{email.companyName}</TableCell>
                        <TableCell>{getStatusBadge(getEmailStatus(email))}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(email.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {email.beaconLogs.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                {email.beaconLogs.length}
                              </Badge>
                            )}
                            {email.accessLogs.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {email.accessLogs.length}
                              </Badge>
                            )}
                            {email.beaconLogs.some(log => log.status === 'Suspicious') && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3" />
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => copySecureLink(email.secureLinkToken)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/emails/${email.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => window.open(`/secure/${email.secureLinkToken}`, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Email
                              </DropdownMenuItem>
                              {!email.revoked && (
                                <DropdownMenuItem 
                                  onClick={() => revokeEmail(email.id)}
                                  className="text-destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Revoke Access
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {!isLoading && filteredEmails.length === 0 && (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No emails found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' || companyFilter !== 'all'
                      ? "Try adjusting your filters"
                      : "No emails have been sent yet"
                    }
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
