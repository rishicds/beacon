"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminSidebar } from "@/components/admin-sidebar"
import { EmailPreview } from "@/components/email-preview"
import { RecipientManager } from "@/components/recipient-manager"
import { SecuritySettings } from "@/components/security-settings"
import { AttachmentManager } from "@/components/attachment-manager"
import { Send, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ComposeEmailPage() {
  const [emailData, setEmailData] = useState({
    subject: "",
    body: "",
    recipients: [] as string[],
    securityEnabled: true,
    trackingEnabled: true,
    expirationDays: 7,
    requirePIN: true,
    attachments: [] as any[],
  })

  const [activeTab, setActiveTab] = useState("compose")
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    setIsSending(true)
    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSending(false)
    // In real app, would redirect to success page or dashboard
  }

  const handleSaveDraft = () => {
    // Save draft logic
    console.log("Saving draft...")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Compose Secure Email</h1>
                <p className="text-muted-foreground">Create and send tracked emails with secure document access</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveDraft}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handleSend} disabled={isSending}>
                <Send className="h-4 w-4 mr-2" />
                {isSending ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="compose">Compose</TabsTrigger>
                  <TabsTrigger value="recipients">Recipients</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="compose">
                  <Card>
                    <CardHeader>
                      <CardTitle>Email Content</CardTitle>
                      <CardDescription>Compose your secure email message</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="Enter email subject..."
                          value={emailData.subject}
                          onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="body">Message Body</Label>
                        <Textarea
                          id="body"
                          placeholder="Enter your email message..."
                          className="min-h-[300px]"
                          value={emailData.body}
                          onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Secure links and tracking beacons will be automatically added when you send the email.
                        </p>
                      </div>

                      <AttachmentManager
                        attachments={emailData.attachments}
                        onAttachmentsChange={(attachments) => setEmailData({ ...emailData, attachments })}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recipients">
                  <RecipientManager
                    recipients={emailData.recipients}
                    onRecipientsChange={(recipients) => setEmailData({ ...emailData, recipients })}
                  />
                </TabsContent>

                <TabsContent value="security">
                  <SecuritySettings
                    settings={{
                      securityEnabled: emailData.securityEnabled,
                      trackingEnabled: emailData.trackingEnabled,
                      expirationDays: emailData.expirationDays,
                      requirePIN: emailData.requirePIN,
                    }}
                    onSettingsChange={(settings) => setEmailData({ ...emailData, ...settings })}
                  />
                </TabsContent>

                <TabsContent value="preview">
                  <EmailPreview emailData={emailData} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tracking">Email Tracking</Label>
                    <Switch
                      id="tracking"
                      checked={emailData.trackingEnabled}
                      onCheckedChange={(checked) => setEmailData({ ...emailData, trackingEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="security">Secure Links</Label>
                    <Switch
                      id="security"
                      checked={emailData.securityEnabled}
                      onCheckedChange={(checked) => setEmailData({ ...emailData, securityEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pin">Require PIN</Label>
                    <Switch
                      id="pin"
                      checked={emailData.requirePIN}
                      onCheckedChange={(checked) => setEmailData({ ...emailData, requirePIN: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Email Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Email Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recipients:</span>
                    <span className="font-medium">{emailData.recipients.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Attachments:</span>
                    <span className="font-medium">{emailData.attachments.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expiration:</span>
                    <span className="font-medium">{emailData.expirationDays} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Security:</span>
                    <Badge variant={emailData.securityEnabled ? "default" : "secondary"} className="text-xs">
                      {emailData.securityEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Templates */}
              <Card>
                <CardHeader>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>Use pre-built templates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    Financial Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    Contract Review
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    Confidential Document
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
