import { Badge } from "@/components/ui/badge"
import { Mail, Shield } from "lucide-react"

interface EmailHeaderProps {
  subject: string
  recipients: string[]
  trackingEnabled: boolean
  securityEnabled: boolean
}

export function EmailHeader({ subject, recipients, trackingEnabled, securityEnabled }: EmailHeaderProps) {
  return (
    <div className="border-b border-border pb-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">From: admin@company.com</span>
        </div>
        <div className="flex gap-1">
          {trackingEnabled && (
            <Badge variant="outline" className="text-xs">
              Tracked
            </Badge>
          )}
          {securityEnabled && (
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Secure
            </Badge>
          )}
        </div>
      </div>
      <h3 className="font-semibold">{subject || "Email Subject"}</h3>
      <p className="text-sm text-muted-foreground">
        To: {recipients.length > 0 ? recipients.join(", ") : "No recipients"}
      </p>
    </div>
  )
}
