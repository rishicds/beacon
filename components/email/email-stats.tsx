import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface EmailStatsProps {
  recipients: number
  attachments: number
  trackingEnabled: boolean
  securityEnabled: boolean
}

export function EmailStats({ recipients, attachments, trackingEnabled, securityEnabled }: EmailStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Statistics</CardTitle>
        <CardDescription>Summary of this email configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Recipients</p>
            <p className="font-medium">{recipients}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Attachments</p>
            <p className="font-medium">{attachments}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tracking</p>
            <p className="font-medium">{trackingEnabled ? "Enabled" : "Disabled"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Security</p>
            <p className="font-medium">{securityEnabled ? "Enabled" : "Disabled"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
