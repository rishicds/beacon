"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, X, Download, Lock } from "lucide-react"

interface AttachmentManagerProps {
  attachments: any[]
  onAttachmentsChange: (attachments: any[]) => void
}

export function AttachmentManager({ attachments, onAttachmentsChange }: AttachmentManagerProps) {
  const [isDragging, setIsDragging] = useState(false)

  // Mock file upload
  const handleFileUpload = () => {
    const mockFile = {
      id: Date.now(),
      name: "Financial_Report_Q3.pdf",
      size: "2.4 MB",
      type: "PDF",
      secure: true,
      uploaded: new Date().toISOString(),
    }
    onAttachmentsChange([...attachments, mockFile])
  }

  const removeAttachment = (id: number) => {
    onAttachmentsChange(attachments.filter((a) => a.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Secure Attachments
        </CardTitle>
        <CardDescription>Add documents that require PIN authentication to access</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            handleFileUpload()
          }}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
          <Button variant="outline" onClick={handleFileUpload}>
            Choose Files
          </Button>
        </div>

        {/* Attachments List */}
        {attachments.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Attached Files ({attachments.length})</h4>
            {attachments.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <div className="p-2 bg-primary/10 rounded">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{file.name}</p>
                    {file.secure && (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Secure
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {file.type} • {file.size}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeAttachment(file.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {attachments.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No attachments added yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
