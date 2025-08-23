import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Eye, Shield, AlertTriangle } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "email_sent",
    user: "John Doe",
    action: "sent secure email",
    target: "Q3 Financial Report",
    time: "2 minutes ago",
    icon: Mail,
    status: "success",
  },
  {
    id: 2,
    type: "email_opened",
    user: "Sarah Wilson",
    action: "opened email",
    target: "Project Proposal",
    time: "5 minutes ago",
    icon: Eye,
    status: "info",
  },
  {
    id: 3,
    type: "secure_access",
    user: "Mike Johnson",
    action: "accessed document",
    target: "Contract Details",
    time: "12 minutes ago",
    icon: Shield,
    status: "success",
  },
  {
    id: 4,
    type: "security_alert",
    user: "Unknown",
    action: "failed PIN attempt",
    target: "Confidential Report",
    time: "18 minutes ago",
    icon: AlertTriangle,
    status: "warning",
  },
  {
    id: 5,
    type: "email_opened",
    user: "Lisa Chen",
    action: "opened email",
    target: "Meeting Notes",
    time: "25 minutes ago",
    icon: Eye,
    status: "info",
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest email tracking and security events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-center gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Icon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge
                  variant={
                    activity.status === "success"
                      ? "default"
                      : activity.status === "warning"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {activity.type.replace("_", " ")}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
