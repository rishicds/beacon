import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, AlertTriangle, Info, CheckCircle, X } from "lucide-react"

const notifications = [
  {
    id: 1,
    type: "security",
    title: "PIN Update Required",
    message: "Your PIN will expire in 7 days. Please update it in your settings.",
    time: "2 hours ago",
    priority: "high",
    icon: AlertTriangle,
  },
  {
    id: 2,
    type: "document",
    title: "New Secure Document",
    message: "You have received a new secure document: 'Q3 Financial Report'",
    time: "4 hours ago",
    priority: "medium",
    icon: Info,
  },
  {
    id: 3,
    type: "access",
    title: "Document Access Confirmed",
    message: "Successfully accessed 'Employee Handbook Update'",
    time: "1 day ago",
    priority: "low",
    icon: CheckCircle,
  },
]

export function EmployeeNotifications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>Recent updates and alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = notification.icon
            return (
              <div key={notification.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                <div
                  className={`p-1.5 rounded-full ${
                    notification.priority === "high"
                      ? "bg-destructive/10 text-destructive"
                      : notification.priority === "medium"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{notification.title}</h4>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                    <Badge
                      variant={
                        notification.priority === "high"
                          ? "destructive"
                          : notification.priority === "medium"
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {notification.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <Button variant="outline" className="w-full mt-4 bg-transparent" size="sm">
          View All Notifications
        </Button>
      </CardContent>
    </Card>
  )
}
