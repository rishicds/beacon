import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield } from "lucide-react"
import { EmployeeSidebar } from "@/components/employee-sidebar"
import { EmployeeMetrics } from "@/components/employee-metrics"
import { SecureDocuments } from "@/components/secure-documents"
import { EmployeeNotifications } from "@/components/employee-notifications"
import { RecentEmails } from "@/components/recent-emails"

export default function EmployeeDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <EmployeeSidebar />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
              <p className="text-muted-foreground">Access your secure emails and documents</p>
            </div>
            <Button>
              <Shield className="h-4 w-4 mr-2" />
              Setup PIN
            </Button>
          </div>

          {/* Employee Metrics */}
          <EmployeeMetrics />

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="emails" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="emails">Recent Emails</TabsTrigger>
                  <TabsTrigger value="documents">Secure Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="emails">
                  <RecentEmails />
                </TabsContent>

                <TabsContent value="documents">
                  <SecureDocuments />
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <EmployeeNotifications />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
