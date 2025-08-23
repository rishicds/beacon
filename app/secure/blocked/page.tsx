import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Shield, Ban } from "lucide-react"
import Link from "next/link"

export default function BlockedAccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-destructive/10 rounded-full">
              <Ban className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Access Blocked</h1>
          <p className="text-muted-foreground">Your access to this document has been restricted</p>
        </div>

        {/* Blocked Notice */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access to this secure document has been blocked due to security concerns. The administrator has been
            notified.
          </AlertDescription>
        </Alert>

        {/* Reasons Card */}
        <Card>
          <CardHeader>
            <CardTitle>Why was access blocked?</CardTitle>
            <CardDescription>Common reasons for access restrictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium">Multiple failed PIN attempts</p>
                  <p className="text-muted-foreground">Too many incorrect PIN entries detected</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium">Suspicious activity</p>
                  <p className="text-muted-foreground">Unusual access patterns or location detected</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Ban className="h-4 w-4 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium">Administrator action</p>
                  <p className="text-muted-foreground">Access manually restricted by document owner</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Need help?</CardTitle>
            <CardDescription>Contact support if you believe this is an error</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If you believe your access was blocked in error, please contact the document sender or your system
              administrator.
            </p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="mailto:support@company.com">Contact Support</Link>
              </Button>
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/">Return to Homepage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Secured by SecureBeacon • Incident ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  )
}
