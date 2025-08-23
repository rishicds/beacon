import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Shield, Eye, X } from "lucide-react"

const alerts = [
  {
    id: 1,
    type: "failed_pin",
    title: "Multiple Failed PIN Attempts",
    description: "3 failed attempts to access 'Confidential Report' from IP 192.168.1.100",
    severity: "high",
    time: "18 minutes ago",
    icon: AlertTriangle,
  },
  {
    id: 2,
    type: "suspicious_location",
    title: "Unusual Access Location",
    description: "Document accessed from new location: Moscow, Russia",
    severity: "medium",
    time: "2 hours ago",
    icon: Shield,
  },
  {
    id: 3,
    type: "forwarding_detected",
    title: "Potential Email Forwarding",
    description: "Email opened from different IP than expected for user@company.com",
    severity: "low",
    time: "4 hours ago",
    icon: Eye,
  },
]

interface SecurityAlertsProps {
  expanded?: boolean
}

export function SecurityAlerts({ expanded = false }: SecurityAlertsProps) {
  const displayAlerts = expanded ? alerts : alerts.slice(0, 3)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Security Alerts
        </CardTitle>
        <CardDescription>Recent security events requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayAlerts.map((alert) => {
            const Icon = alert.icon
            return (
              <div key={alert.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                <div
                  className={`p-2 rounded-full ${
                    alert.severity === "high"
                      ? "bg-destructive/10 text-destructive"
                      : alert.severity === "medium"
                        ? "bg-accent/10 text-accent"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{alert.title}</h4>
                    <Badge
                      variant={
                        alert.severity === "high"
                          ? "destructive"
                          : alert.severity === "medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                    <Button variant="ghost" size="sm">
                      <X className="h-3 w-3 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
