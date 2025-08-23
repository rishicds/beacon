"use client";

import { useAuth } from "@/context/auth-context";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { data, type User } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";

function AddEmployeeDialog({ companyId, onEmployeeAdded }: { companyId: string, onEmployeeAdded: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    // Track if component is mounted
    const [mounted, setMounted] = useState(true);
    useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

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
            if (mounted) {
                setIsOpen(false);
                setName("");
                setEmail("");
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create employee." });
        } finally {
            if (mounted) setIsLoading(false);
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

export default function EmployeesPage() {
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const [employees, setEmployees] = useState<User[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const fetchEmployees = async () => {
        if (!user?.companyId) return;
        try {
            const users = await data.users.findByCompany(user.companyId);
            setEmployees(users);
            setFetchError(null);
        } catch (err: any) {
            setFetchError(err?.message || 'Failed to fetch employees.');
        }
    };

    useEffect(() => {
        if (user?.companyId) fetchEmployees();
    }, [user]);

    if (loading) return <div>Loading...</div>;
    if (!user || user.role !== 'company_admin') return redirect('/company-dashboard');

    return (
        <div className="flex flex-col gap-6 p-6">
            {fetchError && <div className="text-red-600 font-semibold">{fetchError}</div>}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Manage Employees</CardTitle>
                        <CardDescription>View and add employees for your company.</CardDescription>
                    </div>
                    <AddEmployeeDialog companyId={user.companyId!} onEmployeeAdded={fetchEmployees} />
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employees.map(emp => (
                                    <tr key={emp.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{emp.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{emp.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
