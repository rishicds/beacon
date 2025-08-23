import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Globe, Smartphone, MoreHorizontal } from "lucide-react"

const emailData = [
  {
    id: 1,
    subject: "Q3 Financial Report",
    recipient: "board@company.com",
    sent: "2024-01-15 09:30",
    opened: "2024-01-15 10:15",
    device: "Desktop",
    location: "New York, US",
    status: "opened",
    secureAccess: true,
  },
  {
    id: 2,
    subject: "Project Proposal",
    recipient: "client@external.com",
    sent: "2024-01-15 08:45",
    opened: "2024-01-15 09:20",
    device: "Mobile",
    location: "London, UK",
    status: "opened",
    secureAccess: false,
  },
  {
    id: 3,
    subject: "Contract Details",
    recipient: "legal@company.com",
    sent: "2024-01-14 16:20",
    opened: null,
    device: null,
    location: null,
    status: "sent",
    secureAccess: false,
  },
  {
    id: 4,
    subject: "Confidential Report",
    recipient: "manager@company.com",
    sent: "2024-01-14 14:10",
    opened: "2024-01-14 14:45",
    device: "Desktop",
    location: "San Francisco, US",
    status: "accessed",
    secureAccess: true,
  },
]

export function EmailTrackingTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Tracking</CardTitle>
        <CardDescription>Monitor email opens and secure document access</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Device/Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emailData.map((email) => (
              <TableRow key={email.id}>
                <TableCell className="font-medium">{email.subject}</TableCell>
                <TableCell>{email.recipient}</TableCell>
                <TableCell>{email.sent}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      email.status === "opened" ? "default" : email.status === "accessed" ? "default" : "secondary"
                    }
                  >
                    {email.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {email.device && email.location ? (
                    <div className="flex items-center gap-2 text-sm">
                      {email.device === "Mobile" ? <Smartphone className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                      <span>
                        {email.device} • {email.location}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
