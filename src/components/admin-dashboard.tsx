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
  Trash2,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
        <main className="flex-1 p-2 sm:px-4 sm:py-0 md:gap-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4 flex flex-wrap gap-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="beacon">Beacon</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {/* Stat cards */}
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
              <div className="grid gap-4 mt-4 md:grid-cols-2 xl:grid-cols-2">
                {/* Companies summary */}
                <Card className="shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Companies</CardTitle>
                    <Button asChild size="sm">
                      <Link href="/admin/companies">Manage</Link>
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
                {/* Users summary */}
                <Card className="shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Users</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {users.slice(0, 5).map(user => (
                      <div key={user.id} className="flex items-center justify-between">
                        <span className="text-muted-foreground">{user.name || user.email}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          title="Delete user"
                          className="flex items-center gap-1"
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to delete user '${user.name || user.email}'?`)) {
                              await data.users.delete(user.id);
                              setUsers(users => users.filter(u => u.id !== user.id));
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    ))}
                    {users.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center">...and {users.length - 5} more</p>
                    )}
                    {users.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center">No users found</p>
                    )}
                  </CardContent>
                </Card>
                {/* Recent Emails summary */}
                <Card className="shadow-lg col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Emails</CardTitle>
                    <Button asChild size="sm">
                      <Link href="/admin/emails">View All</Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {emails.slice(0, 5).map(email => {
                      const createdAt = typeof email.createdAt === 'string' ? new Date(email.createdAt) : email.createdAt.toDate();
                      return (
                        <div key={email.id} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium truncate max-w-32">{email.subject}</span>
                            <span className="text-xs text-muted-foreground">{createdAt.toLocaleDateString()}</span>
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
            </TabsContent>
            <TabsContent value="insights">
              <div className="grid gap-4 md:grid-cols-2">
                <NaturalLanguageQuery />
                <SummarizedReport />
              </div>
            </TabsContent>
            <TabsContent value="beacon">
              <BeaconTracking isAdmin={true} />
            </TabsContent>
            <TabsContent value="alerts">
              <RealTimeAlerts />
            </TabsContent>
            <TabsContent value="activity">
              <ActivityLogs />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
