import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { MetricsCards } from "@/components/metrics-cards"
import { RecentActivity } from "@/components/recent-activity"
import { EmailTrackingTable } from "@/components/email-tracking-table"
import { SecurityAlerts } from "@/components/security-alerts"

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Monitor email tracking and secure document access</p>
            </div>
            <Button>
              <Mail className="h-4 w-4 mr-2" />
              Compose Secure Email
            </Button>
          </div>

          {/* Metrics Overview */}
          <MetricsCards />

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tracking">Email Tracking</TabsTrigger>
              <TabsTrigger value="security">Security Alerts</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <RecentActivity />
                <SecurityAlerts />
              </div>
            </TabsContent>

            <TabsContent value="tracking">
              <EmailTrackingTable />
            </TabsContent>

            <TabsContent value="security">
              <SecurityAlerts expanded />
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage employees and their access permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">User management interface coming soon...</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
