"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { redirect } from "next/navigation";
import {
  BarChart3,
  Building,
  Users,
  Settings,
  UserPlus,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { data, type User, type Company } from "@/lib/data";
import AppHeader from "@/components/app-header";
import GuardianMailLogo from "@/components/icons/logo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function AddUserDialog({ companies, onUserAdded }: { companies: Company[], onUserAdded: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [companyId, setCompanyId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!name || !email || !companyId) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Please fill out all fields." });
            return;
        }
        setIsLoading(true);
        try {
            await data.users.createUser({
                name,
                email,
                role: 'company_admin',
                companyId,
            });
            toast({ title: "Success", description: "Company admin created and onboarding email sent." });
            onUserAdded();
            setIsOpen(false);
            setName("");
            setEmail("");
            setCompanyId("");
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create user." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2" />
                    Add Company Admin
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Company Admin</DialogTitle>
                    <DialogDescription>
                        Create a new company admin and assign them to a company. They will receive an onboarding email to set up their password and PIN.
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
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="company" className="text-right">Company</Label>
                        <Select onValueChange={setCompanyId} value={companyId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a company" />
                            </SelectTrigger>
                            <SelectContent>
                                {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="button" onClick={handleSubmit} disabled={isLoading}>{isLoading ? "Creating..." : "Create User"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function AdminUsersPage() {
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);

    const fetchData = async () => {
        const [userData, companyData] = await Promise.all([
            data.users.list(),
            data.companies.list()
        ]);
        setUsers(userData);
        setCompanies(companyData);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleResetPin = async (userId: string) => {
        try {
            await data.users.resetPin(userId);
            toast({ title: "PIN Reset", description: "The user's PIN has been reset. They will be prompted to create a new one on their next login." });
            fetchData(); // Refresh data to show updated state
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to reset PIN." });
        }
    }

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!window.confirm(`Are you sure you want to delete user '${userName}'?`)) return;
        try {
            await data.users.delete(userId);
            toast({ title: "User Deleted", description: `User '${userName}' has been deleted.` });
            fetchData();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete user." });
        }
    }


    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user || user.role !== 'admin') {
        return redirect('/login');
    }
    
    const getCompanyName = (companyId?: string) => {
        if (!companyId) return 'N/A';
        return companies.find(c => c.id === companyId)?.name || 'Unknown';
    }

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
          <Link href="/admin" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
            <BarChart3 className="h-5 w-5" />
            <span className="sr-only">Dashboard</span>
          </Link>
          <Link
            href="/admin/companies"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Building className="h-5 w-5" />
            <span className="sr-only">Companies</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Users className="h-5 w-5" />
            <span className="sr-only">All Users</span>
          </Link>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="#"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Link>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <AppHeader />
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>View all users and add new company admins.</CardDescription>
                    </div>
                    <AddUserDialog companies={companies} onUserAdded={fetchData} />
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>PIN Set</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(u => (
                                <TableRow key={u.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={u.avatarUrl} alt={u.name} />
                                                <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{u.name}</p>
                                                <p className="text-sm text-muted-foreground">{u.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                                            {u.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{getCompanyName(u.companyId)}</TableCell>
                                    <TableCell>
                                        <Badge variant={u.pinSet ? 'default' : 'destructive'} className={u.pinSet ? 'bg-green-500' : ''}>
                                            {u.pinSet ? 'Yes' : 'No'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {u.role !== 'admin' && u.pinSet && (
                                            <Button variant="outline" size="sm" onClick={() => handleResetPin(u.id)}>
                                                <RefreshCcw className="mr-2 h-4 w-4" />
                                                Reset PIN
                                            </Button>
                                        )}
                                        {u.role !== 'admin' && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="ml-2 flex items-center gap-1"
                                                title="Delete user"
                                                onClick={() => handleDeleteUser(u.id, u.name || u.email)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </main>
      </div>
    </div>
    )
}
