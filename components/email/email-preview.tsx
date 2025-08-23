import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye } from "lucide-react"
import { EmailHeader } from "./email-header"
import { EmailAttachments } from "./email-attachments"
import { EmailSecurityNotice } from "./email-security-notice"
import { EmailStats } from "./email-stats"

interface EmailPreviewProps {
  emailData: {
    subject: string
    body: string
    recipients: string[]
    securityEnabled: boolean
    trackingEnabled: boolean
    attachments: any[]
  }
}

export function EmailPreview({ emailData }: EmailPreviewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Email Preview
          </CardTitle>
          <CardDescription>How your email will appear to recipients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg p-4 bg-card">
            <EmailHeader
              subject={emailData.subject}
              recipients={emailData.recipients}
              trackingEnabled={emailData.trackingEnabled}
              securityEnabled={emailData.securityEnabled}
            />

            {/* Email Body */}
            <div className="space-y-4">
              <div className="whitespace-pre-wrap">{emailData.body || "Email body content will appear here..."}</div>

              <EmailAttachments attachments={emailData.attachments} />
              <EmailSecurityNotice enabled={emailData.securityEnabled} />
            </div>
          </div>
        </CardContent>
      </Card>

      <EmailStats
        recipients={emailData.recipients.length}
        attachments={emailData.attachments.length}
        trackingEnabled={emailData.trackingEnabled}
        securityEnabled={emailData.securityEnabled}
      />
    </div>
  )
}
