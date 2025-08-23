import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Clock, CheckCircle } from "lucide-react"

const emails = [
  {
    id: 1,
    subject: "Q3 Financial Report - Confidential",
    sender: "finance@company.com",
    received: "2024-01-15 09:30",
    status: "unread",
    hasSecureContent: true,
    priority: "high",
  },
  {
    id: 2,
    subject: "Project Update - Team Meeting Notes",
    sender: "manager@company.com",
    received: "2024-01-15 08:15",
    status: "read",
    hasSecureContent: true,
    priority: "medium",
  },
  {
    id: 3,
    subject: "Contract Review Required",
    sender: "legal@company.com",
    received: "2024-01-14 16:45",
    status: "read",
    hasSecureContent: true,
    priority: "high",
  },
  {
    id: 4,
    subject: "Weekly Security Briefing",
    sender: "security@company.com",
    received: "2024-01-14 10:20",
    status: "read",
    hasSecureContent: false,
    priority: "low",
  },
]

export function RecentEmails() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Emails</CardTitle>
        <CardDescription>Your latest secure email communications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {emails.map((email) => (
            <div
              key={email.id}
              className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50"
            >
              <div className="flex-shrink-0">
                {email.status === "unread" ? (
                  <Mail className="h-5 w-5 text-primary" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`font-medium ${email.status === "unread" ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {email.subject}
                  </h4>
                  <div className="flex items-center gap-2">
                    {email.hasSecureContent && (
                      <Badge variant="outline" className="text-xs">
                        Secure
                      </Badge>
                    )}
                    <Badge
                      variant={
                        email.priority === "high"
                          ? "destructive"
                          : email.priority === "medium"
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {email.priority}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">From: {email.sender}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {email.received}
                </div>
              </div>

              <Button variant="outline" size="sm">
                {email.hasSecureContent ? "Access Secure Content" : "View Email"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
