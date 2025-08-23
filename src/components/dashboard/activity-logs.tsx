
"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { format } from 'date-fns';
import { Timestamp } from "firebase/firestore";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { data, type AccessLog, type BeaconLog, type Email } from "@/lib/data";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/context/auth-context";


export default function ActivityLogs() {
  const { user } = useAuth();
  const [isAlertOpen, setAlertOpen] = React.useState(false);
  const [selectedLog, setSelectedLog] = React.useState<AccessLog | null>(null);
  const { toast } = useToast();
  const [accessLogs, setAccessLogs] = React.useState<AccessLog[]>([]);
  const [beaconLogs, setBeaconLogs] = React.useState<BeaconLog[]>([]);
  const [emails, setEmails] = React.useState<Map<string, Email>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);
  const [key, setKey] = React.useState(0);

  const fetchLogs = React.useCallback(async () => {
    setIsLoading(true);
    const companyId = user?.role === 'admin' ? undefined : user?.companyId;
    
    const [access, beacon, emailData] = await Promise.all([
        data.accessLogs.list({ companyId }),
        data.beaconLogs.list({ companyId }),
        data.emails.list({ companyId }),
    ]);
    
    setAccessLogs(access);
    setBeaconLogs(beacon);
    setEmails(new Map(emailData.map(e => [e.id, e])));
    setIsLoading(false);
  }, [user]);
  
  React.useEffect(() => {
    if (user) {
        fetchLogs();
    }
    
    const handleRefresh = () => {
      setKey(prevKey => prevKey + 1);
    };

    window.addEventListener('refresh-logs', handleRefresh);

    return () => {
      window.removeEventListener('refresh-logs', handleRefresh);
    };
  }, [key, user, fetchLogs]);

  const handleRevokeClick = (log: AccessLog) => {
    setSelectedLog(log);
    setAlertOpen(true);
  };
  
  const handleRevokeConfirm = async () => {
    if (!selectedLog) return;
    try {
      await data.emails.revoke(selectedLog.emailId);
      toast({
          title: "Access Revoked",
          description: `Access for the link sent to ${selectedLog.email} has been revoked.`,
      });
      fetchLogs(); // Refresh the data to get the new revoked status
    } catch (error) {
       toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to revoke access.",
      });
    } finally {
        setAlertOpen(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Success":
      case "Opened":
      case "System":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">Success</Badge>;
      case "Failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "Suspicious":
        return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">Suspicious</Badge>;
      case "Revoked":
        return <Badge variant="destructive" className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Revoked</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (timestamp: string | Timestamp) => {
      if (timestamp instanceof Timestamp) {
          return format(timestamp.toDate(), "yyyy-MM-dd HH:mm:ss");
      }
      return format(new Date(timestamp), "yyyy-MM-dd HH:mm:ss");
  }

  const LogTableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
          <TableHead><Skeleton className="h-4 w-32" /></TableHead>
          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
          <TableHead><span className="sr-only">Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
           <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
           </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <>
      <Card className="col-span-1 lg:col-span-3 shadow-lg">
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="access">
            <TabsList>
              <TabsTrigger value="access">Secure Link Access</TabsTrigger>
              <TabsTrigger value="beacon">Beacon Triggers</TabsTrigger>
            </TabsList>
            <TabsContent value="access">
              {isLoading ? <LogTableSkeleton /> : (
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessLogs.map((log) => {
                       const email = emails.get(log.emailId);
                       const isRevoked = email?.revoked;
                      return(
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="font-medium">{log.user}</div>
                          <div className="text-sm text-muted-foreground">{log.email}</div>
                        </TableCell>
                        <TableCell>{log.ip}</TableCell>
                        <TableCell>{log.device}</TableCell>
                        <TableCell>{formatDate(log.timestamp)}</TableCell>
                        <TableCell>{isRevoked ? getStatusBadge("Revoked") : getStatusBadge(log.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isRevoked}>
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRevokeClick(log)} disabled={isRevoked}>Revoke Access</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )})}
                  </TableBody>
                 </Table>
              )}
            </TabsContent>
            <TabsContent value="beacon">
              {isLoading ? <LogTableSkeleton /> : (
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {beaconLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="font-medium">{log.email}</div>
                        </TableCell>
                        <TableCell>{log.ip}</TableCell>
                        <TableCell>{log.device}</TableCell>
                        <TableCell>{formatDate(log.timestamp)}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                 </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to revoke access?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The secure link will be permanently disabled for {selectedLog?.email}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeConfirm}>Revoke</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
