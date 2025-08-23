import { Shield } from "lucide-react"

interface EmailSecurityNoticeProps {
  enabled: boolean
}

export function EmailSecurityNotice({ enabled }: EmailSecurityNoticeProps) {
  if (!enabled) return null

  return (
    <div className="border-t border-border pt-4">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary">Secure Email</p>
            <p className="text-muted-foreground">
              This email contains secure content that requires authentication to access. Click the secure links above to
              view protected documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
