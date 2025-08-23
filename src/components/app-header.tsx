
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MailPlus, PanelLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
  } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { data, type User } from "@/lib/data";
import GuardianMailLogo from "./icons/logo";
import { useRouter } from "next/navigation";

interface AppHeaderProps {
    companyName?: string;
}

export default function AppHeader({ companyName }: AppHeaderProps) {
    const { user, logout, switchUser } = useAuth();
    const router = useRouter();
    const [allUsers, setAllUsers] = useState<User[]>([]);

    useEffect(() => {
        data.users.list().then(setAllUsers);
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    }
    
    const handleSwitchUser = async (email: string) => {
        await switchUser(email);
    }

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
             <Sheet>
                <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs">
                <nav className="grid gap-6 text-lg font-medium">
                    <Link
                    href="#"
                    className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                    >
                    <GuardianMailLogo className="h-5 w-5 transition-all group-hover:scale-110" />
                    <span className="sr-only">GuardianMail</span>
                    </Link>
                    {/* Add Mobile nav links here */}
                </nav>
                </SheetContent>
            </Sheet>

            <div className="relative ml-auto flex-1 md:grow-0">
                <h1 className="text-2xl font-semibold">
                    {user?.role === 'admin' ? 'Admin Dashboard' : companyName || 'Dashboard'}
                </h1>
            </div>
            
            <div className="relative ml-auto flex items-center gap-4 md:grow-0">
                <Button asChild>
                    <Link href="/compose">
                        <MailPlus className="mr-2 h-4 w-4" />
                        Compose Email
                    </Link>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="overflow-hidden rounded-full"
                    >
                        <img
                        src={user?.avatarUrl || "https://placehold.co/36x36.png"}
                        width={36}
                        height={36}
                        alt="Avatar"
                        className="overflow-hidden"
                        />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user?.name || 'My Account'}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Switch User</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                {allUsers.map((u: User) => (
                                    <DropdownMenuItem key={u.id} onClick={() => handleSwitchUser(u.email)} disabled={u.id === user?.id}>
                                        {u.name} ({u.role})
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>

                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
