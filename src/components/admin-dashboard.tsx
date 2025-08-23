
"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Building,
  Users,
  Settings,
  PlusCircle,
  Mail,
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
import { data, type Company, type User, type Email } from "@/lib/data";
import AppHeader from "./app-header";

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);

  useEffect(() => {
    async function fetchData() {
        const [companyData, userData, emailData] = await Promise.all([
            data.companies.list(),
            data.users.list(),
            data.emails.list()
        ]);
        setCompanies(companyData);
        setUsers(userData);
        setEmails(emailData);
    }
    fetchData();
  }, [])

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
          <Link href="/admin" className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
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
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Users className="h-5 w-5" />
            <span className="sr-only">All Users</span>
          </Link>
          <Link
            href="/admin/emails"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Mail className="h-5 w-5" />
            <span className="sr-only">All Emails</span>
          </Link>
          <Link
            href="/admin/pin-requests"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Key className="h-5 w-5" />
            <span className="sr-only">PIN Requests</span>
          </Link>
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
        <AppHeader />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
             <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4">
                 <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Companies</CardDescription>
                        <CardTitle className="text-4xl">{companies.length}</CardTitle>
                    </CardHeader>
                 </Card>
                  <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Users</CardDescription>
                        <CardTitle className="text-4xl">{users.length}</CardTitle>
                    </CardHeader>
                 </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Emails Sent</CardDescription>
                        <CardTitle className="text-4xl">{emails.length}</CardTitle>
                    </CardHeader>
                 </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Recent Activity</CardDescription>
                        <CardTitle className="text-4xl">{emails.filter(e => {
                          const createdAt = typeof e.createdAt === 'string' ? new Date(e.createdAt) : e.createdAt.toDate();
                          const yesterday = new Date();
                          yesterday.setDate(yesterday.getDate() - 1);
                          return createdAt > yesterday;
                        }).length}</CardTitle>
                    </CardHeader>
                 </Card>
             </div>
            <NaturalLanguageQuery />
            <BeaconTracking isAdmin={true} />
            <SummarizedReport />
            <RealTimeAlerts />
            <ActivityLogs />
          </div>
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
             <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Companies</CardTitle>
                    <Button asChild size="sm">
                        <Link href="/admin/companies">
                            Manage
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {companies.slice(0, 5).map(company => (
                        <div key={company.id} className="flex items-center justify-between">
                            <span className="text-muted-foreground">{company.name}</span>
                        </div>
                    ))}
                    {companies.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center">...and {companies.length - 5} more</p>
                    )}
                </CardContent>
             </Card>
             <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Emails</CardTitle>
                    <Button asChild size="sm">
                        <Link href="/admin/emails">
                            View All
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {emails.slice(0, 5).map(email => {
                      const createdAt = typeof email.createdAt === 'string' ? new Date(email.createdAt) : email.createdAt.toDate();
                      return (
                        <div key={email.id} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium truncate max-w-32">{email.subject}</span>
                                <span className="text-xs text-muted-foreground">
                                  {createdAt.toLocaleDateString()}
                                </span>
                            </div>
                            <span className="text-xs text-muted-foreground">{email.recipient}</span>
                        </div>
                      );
                    })}
                    {emails.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center">...and {emails.length - 5} more</p>
                    )}
                    {emails.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center">No emails sent yet</p>
                    )}
                </CardContent>
             </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
