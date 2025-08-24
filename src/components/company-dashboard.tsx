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
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  UserCheck,
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
                 <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0">
                    <UserPlus className="mr-2 h-4 w-4"/>
                    Add Employee
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white border-gray-200">
                <DialogHeader>
                    <DialogTitle className="text-gray-900">Add Employee</DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Create a new employee for your company. They will receive an onboarding email to set up their password and PIN.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right text-gray-900">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3 bg-white border-gray-300 text-gray-900" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right text-gray-900">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3 bg-white border-gray-300 text-gray-900" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary" className="bg-gray-100 text-gray-900 hover:bg-gray-200">Cancel</Button></DialogClose>
                    <Button type="button" onClick={handleSubmit} disabled={isLoading} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">{isLoading ? "Creating..." : "Create Employee"}</Button>
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
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-20 flex-col border-r border-gray-200 bg-white sm:flex shadow-lg">
        <nav className="flex flex-col items-center gap-6 px-2 sm:py-8">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="group flex h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-lg font-semibold text-white md:h-10 md:w-10 md:text-base shadow-lg hover:shadow-blue-500/25"
                >
                  <GuardianMailLogo className="h-6 w-6 transition-all group-hover:scale-110" />
                  <span className="sr-only">GuardianMail</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">Home</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/company-dashboard" className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 md:h-10 md:w-10 shadow-lg">
                  <Home className="h-6 w-6" />
                  <span className="sr-only">Dashboard</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">Dashboard</TooltipContent>
            </Tooltip>
            {isCompanyAdmin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/company-dashboard/employees"
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-gray-800 hover:bg-gray-100 md:h-10 md:w-10 shadow-lg"
                  >
                    <Users className="h-6 w-6" />
                    <span className="sr-only">Employees</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">Employees</TooltipContent>
              </Tooltip>
            )}
            {isCompanyAdmin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/admin/pin-requests"
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-gray-800 hover:bg-gray-100 md:h-10 md:w-10 relative shadow-lg"
                  >
                    <Key className="h-6 w-6" />
                    {pendingPinRequests > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                        {pendingPinRequests}
                      </span>
                    )}
                    <span className="sr-only">PIN Requests</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">PIN Requests</TooltipContent>
              </Tooltip>
            )}
            {isCompanyAdmin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/admin/emails"
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-gray-800 hover:bg-gray-100 md:h-10 md:w-10 shadow-lg"
                  >
                    <Mail className="h-6 w-6" />
                    <span className="sr-only">Emails</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">Emails</TooltipContent>
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
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-gray-800 hover:bg-gray-100 md:h-10 md:w-10 shadow-lg"
                >
                  <Settings className="h-6 w-6" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-20">
        <AppHeader companyName={"Company Admin Dashboard"} />
        <div className="w-full px-6">
          {/* Company Name Card */}
          {company && (
            <Card className="mb-8 shadow-lg bg-white border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-3xl text-gray-900">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
                    <Building2 className="h-7 w-7 text-white" />
                  </div>
                  {company.name}
                </CardTitle>
                <CardDescription className="mt-2 text-lg font-medium text-blue-600">
                  Company Admin Dashboard
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Stats Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-lg bg-white border-gray-200 hover:shadow-xl transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Emails</CardTitle>
                <Mail className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{companyEmails.length}</div>
                <p className="text-xs text-gray-500 mt-1">Sent this month</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-white border-gray-200 hover:shadow-xl transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Suspicious Opens</CardTitle>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{suspiciousOpens}</div>
                <p className="text-xs text-gray-500 mt-1">Requires attention</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-white border-gray-200 hover:shadow-xl transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Failed PIN Attempts</CardTitle>
                <ShieldAlert className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{failedPinAttempts}</div>
                <p className="text-xs text-gray-500 mt-1">Security incidents</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-white border-gray-200 hover:shadow-xl transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Team Members</CardTitle>
                <UserCheck className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{employees.length}</div>
                <p className="text-xs text-gray-500 mt-1">Active employees</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Beacon Tracking Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Beacon Tracking</h2>
              </div>
              <BeaconTracking companyId={user.companyId} isAdmin={false} />
            </div>

            {/* Real-Time Alerts Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Real-Time Alerts</h2>
              </div>
              <RealTimeAlerts />
            </div>
          </div>

          {/* Additional Info Cards */}
          {isCompanyAdmin && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Key className="h-5 w-5 text-blue-500" />
                    PIN Management
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage employee PIN reset requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pending Requests</span>
                    <span className="text-2xl font-bold text-blue-600">{pendingPinRequests}</span>
                  </div>
                  {pendingPinRequests > 0 && (
                    <Button asChild className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                      <Link href="/admin/pin-requests">Review Requests</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Users className="h-5 w-5 text-green-500" />
                    Team Management
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Add and manage team members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Total Members</span>
                    <span className="text-2xl font-bold text-green-600">{teamMembers.length}</span>
                  </div>
                  <AddEmployeeDialog companyId={user.companyId} onEmployeeAdded={fetchData} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
