import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Globe, Smartphone, Monitor, AlertTriangle, MoreHorizontal } from "lucide-react"

const trackingData = [
  {
    id: 1,
    email: "john.doe@company.com",
    subject: "Q3 Financial Report",
    openedAt: "2024-01-15 10:15:23",
    location: "New York, US",
    device: "Desktop",
    ip: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
    suspicious: false,
  },
  {
    id: 2,
    email: "sarah.wilson@company.com",
    subject: "Project Update",
    openedAt: "2024-01-15 09:45:12",
    location: "London, UK",
    device: "Mobile",
    ip: "10.0.0.50",
    userAgent: "Safari Mobile 17.0",
    suspicious: false,
  },
  {
    id: 3,
    email: "unknown@external.com",
    subject: "Contract Details",
    openedAt: "2024-01-15 08:30:45",
    location: "Moscow, RU",
    device: "Desktop",
    ip: "203.0.113.1",
    userAgent: "Firefox 121.0",
    suspicious: true,
  },
  {
    id: 4,
    email: "mike.johnson@company.com",
    subject: "Meeting Notes",
    openedAt: "2024-01-14 16:20:33",
    location: "San Francisco, US",
    device: "Desktop",
    ip: "192.168.1.200",
    userAgent: "Chrome 120.0.0.0",
    suspicious: false,
  },
  {
    id: 5,
    email: "lisa.chen@company.com",
    subject: "Security Brief",
    openedAt: "2024-01-14 14:15:18",
    location: "Toronto, CA",
    device: "Mobile",
    ip: "172.16.0.10",
    userAgent: "Chrome Mobile 120.0",
    suspicious: false,
  },
]

export function TrackingTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Email Opens</CardTitle>
        <CardDescription>Real-time tracking of email opens and recipient behavior</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipient</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Opened At</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trackingData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{item.email}</p>
                    <p className="text-xs text-muted-foreground">IP: {item.ip}</p>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.subject}</TableCell>
                <TableCell>{item.openedAt}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{item.location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.device === "Mobile" ? (
                      <Smartphone className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Monitor className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="text-sm">{item.device}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {item.suspicious ? (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Suspicious
                    </Badge>
                  ) : (
                    <Badge variant="default" className="text-xs">
                      Normal
                    </Badge>
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
