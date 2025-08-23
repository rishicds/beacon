
"use client";

import { useEffect, useState } from "react";
import {
  Home,
  Shield,
  Users,
  UserPlus,
  Trash2,
  Settings,
  Key,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import GuardianMailLogo from "./icons/logo";
import NaturalLanguageQuery from "./dashboard/natural-language-query";
import SummarizedReport from "./dashboard/summarized-report";
import ActivityLogs from "./dashboard/activity-logs";
import RealTimeAlerts from "./dashboard/real-time-alerts";
import BeaconTracking from "./dashboard/beacon-tracking";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "./ui/card";
import { useAuth } from "@/context/auth-context";
import { data, type User, type Company, type Email, type AccessLog, type BeaconLog, type PinResetRequest } from "@/lib/data";
import AppHeader from "./app-header";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


function AddEmployeeDialog({ companyId, onEmployeeAdded }: { companyId: string, onEmployeeAdded: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!name || !email) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Please fill out all fields." });
            return;
        }
        setIsLoading(true);
        try {
            await data.users.createUser({
                name,
                email,
                role: 'employee',
                companyId,
            });
            toast({ title: "Success", description: "Employee created and onboarding email sent." });
            onEmployeeAdded();
            setIsOpen(false);
            setName("");
            setEmail("");
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create employee." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button className="w-full">
                    <UserPlus className="mr-2 h-4 w-4"/>
                    Add Employee
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Employee</DialogTitle>
                    <DialogDescription>
                        Create a new employee for your company. They will receive an onboarding email to set up their password and PIN.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="button" onClick={handleSubmit} disabled={isLoading}>{isLoading ? "Creating..." : "Create Employee"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function CompanyDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<User[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyEmails, setCompanyEmails] = useState<Email[]>([]);
  const [companyAccessLogs, setCompanyAccessLogs] = useState<AccessLog[]>([]);
  const [companyBeaconLogs, setCompanyBeaconLogs] = useState<BeaconLog[]>([]);
  const [pinRequests, setPinRequests] = useState<PinResetRequest[]>([]);

  const fetchData = async () => {
    if (!user || !user.companyId) return;
    const companyId = user.companyId;

     const [
            employeeData,
            companyData,
            emailData,
            accessLogData,
            beaconLogData,
            pinRequestData
        ] = await Promise.all([
            data.users.findByCompany(companyId),
            data.companies.findById(companyId),
            data.emails.list({ companyId }),
            data.accessLogs.list({ companyId }),
            data.beaconLogs.list({ companyId }),
            user.role === 'company_admin' ? data.pinResetRequests.list({ companyId }) : Promise.resolve([])
        ]);

        setEmployees(employeeData);
        setCompany(companyData ?? null);
        setCompanyEmails(emailData);
        setCompanyAccessLogs(accessLogData);
        setCompanyBeaconLogs(beaconLogData);
        setPinRequests(pinRequestData);
  };


  useEffect(() => {
    fetchData();
  }, [user]);
  
  if (!user || !user.companyId) return null;
  
  const suspiciousOpens = companyBeaconLogs.filter(l => l.status === 'Suspicious').length;
  const failedPinAttempts = companyAccessLogs.filter(l => l.status === 'Failed').length;
  const pendingPinRequests = pinRequests.filter(r => r.status === 'pending').length;

  const handleRemoveEmployee = async (employeeId: string) => {
    // In a real app, this would have a confirmation dialog
    await data.users.delete(employeeId);
    setEmployees(employees.filter(e => e.id !== employeeId));
    toast({ title: "Employee Removed", description: "The employee has been removed from the company."});
    fetchData(); // Refresh data
  }

  const isCompanyAdmin = user.role === 'company_admin';
  const teamMembers = employees.filter(e => e.id !== user.id);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <GuardianMailLogo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">GuardianMail</span>
          </Link>
          <Link href="/company-dashboard" className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
            <Home className="h-5 w-5" />
            <span className="sr-only">Dashboard</span>
          </Link>
          <Link
            href="#"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Shield className="h-5 w-5" />
            <span className="sr-only">Security</span>
          </Link>
           {isCompanyAdmin && (
                <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Users className="h-5 w-5" />
                <span className="sr-only">Employees</span>
              </Link>
           )}
           {isCompanyAdmin && (
                <Link
                href="/admin/pin-requests"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 relative"
              >
                <Key className="h-5 w-5" />
                {pendingPinRequests > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingPinRequests}
                  </span>
                )}
                <span className="sr-only">PIN Requests</span>
              </Link>
           )}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Link>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <AppHeader companyName={company?.name} />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                <NaturalLanguageQuery />
                <BeaconTracking companyId={user.companyId} isAdmin={false} />
                <SummarizedReport />
            </div>
            <RealTimeAlerts />
            <ActivityLogs />
          </div>
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Company Stats</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Emails Sent</span>
                        <span className="font-bold">{companyEmails.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Suspicious Opens</span>
                        <span className="font-bold text-yellow-600">{suspiciousOpens}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Failed PIN Attempts</span>
                        <span className="font-bold text-destructive">{failedPinAttempts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Team Members</span>
                        <span className="font-bold">{employees.length}</span>
                    </div>
                    {isCompanyAdmin && (
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Pending PIN Requests</span>
                            <span className="font-bold text-blue-600">{pendingPinRequests}</span>
                        </div>
                    )}
                </CardContent>
             </Card>
             {isCompanyAdmin && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Employee Management</CardTitle>
                        <CardDescription>Add or remove employees from your company.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                             {teamMembers.length > 0 ? teamMembers.map(employee => (
                                <div key={employee.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{employee.name}</p>
                                            <p className="text-sm text-muted-foreground">{employee.email}</p>
                                        </div>
                                    </div>
                                     {employee.role === 'employee' && (
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveEmployee(employee.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                     )}
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No other employees in this company.</p>
                            )}
                        </div>
                        <AddEmployeeDialog companyId={user.companyId} onEmployeeAdded={fetchData} />
                    </CardContent>
                 </Card>
             )}
          </div>
        </main>
      </div>
    </div>
  );
}
