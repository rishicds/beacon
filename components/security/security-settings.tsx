"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Clock, Eye, Lock } from "lucide-react"

interface SecuritySettingsProps {
  settings: {
    securityEnabled: boolean
    trackingEnabled: boolean
    expirationDays: number
    requirePIN: boolean
  }
  onSettingsChange: (settings: any) => void
}

export function SecuritySettings({ settings, onSettingsChange }: SecuritySettingsProps) {
  const updateSetting = (key: string, value: any) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Configuration
          </CardTitle>
          <CardDescription>Configure security and tracking settings for this email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Tracking */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Email Tracking
                </Label>
                <p className="text-sm text-muted-foreground">Track when recipients open the email</p>
              </div>
              <Switch
                checked={settings.trackingEnabled}
                onCheckedChange={(checked) => updateSetting("trackingEnabled", checked)}
              />
            </div>
            {settings.trackingEnabled && (
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  A tracking beacon will be embedded in the email to monitor opens, device info, and location.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Secure Links */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Secure Document Links
                </Label>
                <p className="text-sm text-muted-foreground">Require authentication to access attachments</p>
              </div>
              <Switch
                checked={settings.securityEnabled}
                onCheckedChange={(checked) => updateSetting("securityEnabled", checked)}
              />
            </div>
            {settings.securityEnabled && (
              <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>PIN Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require PIN to access secure content</p>
                  </div>
                  <Switch
                    checked={settings.requirePIN}
                    onCheckedChange={(checked) => updateSetting("requirePIN", checked)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Link Expiration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Link Expiration
              </Label>
              <p className="text-sm text-muted-foreground">
                Secure links will expire after {settings.expirationDays} day{settings.expirationDays !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="space-y-2">
              <Slider
                value={[settings.expirationDays]}
                onValueChange={(value) => updateSetting("expirationDays", value[0])}
                max={30}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 day</span>
                <span>30 days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Security Summary</CardTitle>
          <CardDescription>Overview of enabled security features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Email tracking:</span>
              <span className={settings.trackingEnabled ? "text-primary" : "text-muted-foreground"}>
                {settings.trackingEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Secure links:</span>
              <span className={settings.securityEnabled ? "text-primary" : "text-muted-foreground"}>
                {settings.securityEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>PIN required:</span>
              <span className={settings.requirePIN ? "text-primary" : "text-muted-foreground"}>
                {settings.requirePIN ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Link expiration:</span>
              <span className="text-foreground">{settings.expirationDays} days</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
