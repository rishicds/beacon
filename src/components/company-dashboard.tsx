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
  Mail,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import GuardianMailLogo from "./icons/logo";
import BeaconTracking from "./dashboard/beacon-tracking";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "./ui/card";
import { useAuth } from "@/context/auth-context";
import { data, type User, type Company, type Email, type AccessLog, type BeaconLog, type PinResetRequest } from "@/lib/data";
import AppHeader from "./app-header";
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
import RealTimeAlerts from "@/components/dashboard/real-time-alerts";
import { Building2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart3 } from "lucide-react";


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
    if (!user || !user.companyId) return;
    // Fetch company by companyId
    data.companies.findById(user.companyId).then(companyData => {
      setCompany(companyData ?? null);
    });
    fetchData();
  }, [user]);
  
  if (!user || !user.companyId) return null;
  if (user.role === 'employee') {
    if (typeof window !== 'undefined') {
      window.location.replace('/compose');
    }
    return null;
  }
  
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
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-20 flex-col border-r bg-background sm:flex shadow-lg">
        <nav className="flex flex-col items-center gap-6 px-2 sm:py-8">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="group flex h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-10 md:w-10 md:text-base shadow-md"
                >
                  <GuardianMailLogo className="h-6 w-6 transition-all group-hover:scale-110" />
                  <span className="sr-only">GuardianMail</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Home</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/company-dashboard" className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-10 md:w-10 shadow">
                  <Home className="h-6 w-6" />
                  <span className="sr-only">Dashboard</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>
            {/* <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/company-dashboard/insights"
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-10 md:w-10 shadow"
                >
                  <BarChart3 className="h-6 w-6" />
                  <span className="sr-only">Insights</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Insights</TooltipContent>
            </Tooltip> */}
            {isCompanyAdmin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/company-dashboard/employees"
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-10 md:w-10 shadow"
                  >
                    <Users className="h-6 w-6" />
                    <span className="sr-only">Employees</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Employees</TooltipContent>
              </Tooltip>
            )}
            {isCompanyAdmin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/admin/pin-requests"
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-10 md:w-10 relative shadow"
                  >
                    <Key className="h-6 w-6" />
                    {pendingPinRequests > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-background">
                        {pendingPinRequests}
                      </span>
                    )}
                    <span className="sr-only">PIN Requests</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">PIN Requests</TooltipContent>
              </Tooltip>
            )}
            {isCompanyAdmin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/admin/emails"
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-10 md:w-10 shadow"
                  >
                    <Mail className="h-6 w-6" />
                    <span className="sr-only">Emails</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Emails</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </nav>
        <div className="flex-1" />
        <nav className="mb-6 flex flex-col items-center gap-6 px-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings"
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-10 md:w-10 shadow"
                >
                  <Settings className="h-6 w-6" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-20">
        <AppHeader companyName={"Company Admin Dashboard"} />
        <div className="max-w-7xl mx-auto">
          {/* Company Name Card */}
          {company && (
            <Card className="mb-6 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Building2 className="h-6 w-6 text-primary" />
                  {company.name}
                </CardTitle>
                <CardDescription className="mt-1 text-lg font-semibold text-primary">
                  Company Admin Dashboard
                </CardDescription>
              </CardHeader>
            </Card>
          )}
          <main className="grid flex-1 items-start gap-6 p-2 sm:px-4 sm:py-0 md:gap-10 lg:grid-cols-3 xl:grid-cols-3">
            <div className="grid auto-rows-max items-start gap-6 md:gap-10 lg:col-span-2">
              <section className="grid gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1">
                <h2 className="text-xl font-semibold mb-2 text-primary">Beacon Tracking</h2>
                <BeaconTracking companyId={user.companyId} isAdmin={false} />
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-2 text-primary">Real-Time Alerts</h2>
                <RealTimeAlerts />
              </section>
            </div>
            <div className="grid auto-rows-max items-start gap-6 md:gap-10 lg:col-span-1">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Company Stats</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 divide-y divide-muted-foreground/10">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Emails Sent</span>
                    <span className="font-bold">{companyEmails.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Suspicious Opens</span>
                    <span className="font-bold text-yellow-600">{suspiciousOpens}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Failed PIN Attempts</span>
                    <span className="font-bold text-destructive">{failedPinAttempts}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Team Members</span>
                    <span className="font-bold">{employees.length}</span>
                  </div>
                  {isCompanyAdmin && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">Pending PIN Requests</span>
                      <span className="font-bold text-blue-600">{pendingPinRequests}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
