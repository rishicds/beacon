import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Clock, Shield } from "lucide-react"
import Link from "next/link"

export default function ExpiredLinkPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-destructive/10 rounded-full">
              <Clock className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Link Expired</h1>
          <p className="text-muted-foreground">This secure document link is no longer valid</p>
        </div>

        {/* Expired Notice */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This secure link has expired or has been revoked by the administrator. You can no longer access this
            document.
          </AlertDescription>
        </Alert>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>What happened?</CardTitle>
            <CardDescription>Secure links have limited validity for security reasons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Time-limited access</p>
                  <p className="text-muted-foreground">Secure links expire after a set period for security</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Administrator control</p>
                  <p className="text-muted-foreground">Links can be revoked at any time by the sender</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Need access?</CardTitle>
            <CardDescription>Contact the document sender for a new secure link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If you need to access this document, please contact the person who sent you the original email to request
              a new secure link.
            </p>
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/">Return to Homepage</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Security Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Secured by SecureBeacon • All access attempts are monitored</p>
        </div>
      </div>
    </div>
  )
}
