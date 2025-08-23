import { Button } from "@/components/ui/button"
import { FileText, Shield } from "lucide-react"

interface EmailAttachmentsProps {
  attachments: Array<{
    id: string
    name: string
    size: string
  }>
}

export function EmailAttachments({ attachments }: EmailAttachmentsProps) {
  if (attachments.length === 0) return null

  return (
    <div className="border-t border-border pt-4">
      <h4 className="font-medium mb-3">Secure Attachments</h4>
      <div className="space-y-2">
        {attachments.map((file) => (
          <div key={file.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <FileText className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{file.size}</p>
            </div>
            <Button size="sm" variant="outline">
              <Shield className="h-3 w-3 mr-2" />
              Access Secure Document
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
