"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MailPlus, PanelLeft, Settings } from "lucide-react";
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
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-gradient-to-r from-primary/10 to-accent/10 px-4 shadow-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
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
                        <Link href="/compose" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                            <MailPlus className="h-5 w-5" />
                            Compose Email
                        </Link>
                        <Link href="/settings" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                            <Settings className="h-5 w-5" />
                            Settings
                        </Link>
                    </nav>
                </SheetContent>
            </Sheet>

            <div className="flex-1 flex flex-col items-center justify-center md:items-start md:justify-center">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary drop-shadow-sm text-center md:text-left">
                    {user?.role === 'admin' ? 'Admin Dashboard' : companyName || 'Dashboard'}
                </h1>
                <span className="hidden md:block text-sm text-muted-foreground font-medium mt-1">
                    Welcome{user?.name ? `, ${user.name}` : ''}!
                </span>
            </div>

            <div className="flex items-center gap-2 md:gap-4 ml-auto">
                <Button asChild className="hidden sm:flex font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
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
                            className="overflow-hidden rounded-full border-2 border-primary/40 shadow-sm hover:border-primary/80 transition-all"
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
                        <DropdownMenuLabel className="font-bold text-primary">{user?.name || 'My Account'}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Switch User</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    {allUsers.map((u: User) => (
                                        <DropdownMenuItem key={u.id} onClick={() => handleSwitchUser(u.email)} disabled={u.id === user?.id} className="font-medium">
                                            {u.name} <span className="ml-1 text-xs text-muted-foreground">({u.role})</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuItem asChild>
                            <Link href="/settings">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Support</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive font-semibold">Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
