import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Lock, Calendar, Download } from "lucide-react"

const documents = [
  {
    id: 1,
    title: "Q3 Financial Report",
    description: "Quarterly financial analysis and projections",
    sender: "finance@company.com",
    expires: "2024-01-22",
    status: "pending",
    requiresPIN: true,
  },
  {
    id: 2,
    title: "Employee Handbook Update",
    description: "Updated policies and procedures",
    sender: "hr@company.com",
    expires: "2024-01-30",
    status: "accessed",
    requiresPIN: true,
  },
  {
    id: 3,
    title: "Project Specifications",
    description: "Technical requirements and timeline",
    sender: "manager@company.com",
    expires: "2024-01-25",
    status: "pending",
    requiresPIN: true,
  },
]

export function SecureDocuments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Secure Documents</CardTitle>
        <CardDescription>Documents requiring PIN authentication to access</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {documents.map((doc) => (
            <div key={doc.id} className="border border-border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">{doc.title}</h4>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">From: {doc.sender}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={doc.status === "accessed" ? "default" : "secondary"}>{doc.status}</Badge>
                  {doc.requiresPIN && <Lock className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Expires: {doc.expires}
              </div>

              {doc.status === "pending" && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="space-y-2">
                    <Label htmlFor={`pin-${doc.id}`} className="text-sm">
                      Enter your PIN to access this document
                    </Label>
                    <Input id={`pin-${doc.id}`} type="password" placeholder="Enter PIN" className="max-w-xs" />
                  </div>
                  <Button size="sm">
                    <Download className="h-3 w-3 mr-2" />
                    Access Document
                  </Button>
                </div>
              )}

              {doc.status === "accessed" && (
                <div className="pt-2 border-t border-border">
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3 mr-2" />
                    Download Again
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
