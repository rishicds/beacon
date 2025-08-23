"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, AlertTriangle, CheckCircle, Eye, Download, Globe, Smartphone } from "lucide-react"

interface SecureLinkPageProps {
  params: {
    token: string
  }
}

export default function SecureLinkPage({ params }: SecureLinkPageProps) {
  const [pin, setPin] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Mock document data - in real app this would come from API
  const documentData = {
    title: "Q3 Financial Report - Confidential",
    sender: "finance@company.com",
    expires: "2024-01-22",
    size: "2.4 MB",
    type: "PDF Document",
    content: "This is the secure document content that would be displayed after successful PIN authentication...",
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock PIN validation - in real app this would be server-side
    if (pin === "123456") {
      setIsAuthenticated(true)
    } else {
      setAttempts(attempts + 1)
      setError("Invalid PIN. Please try again.")
      if (attempts >= 2) {
        setError("Too many failed attempts. This incident has been reported to the administrator.")
      }
    }

    setIsLoading(false)
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-6">
          {/* Success Header */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-primary">Access Granted</CardTitle>
                  <CardDescription>
                    You have successfully authenticated and can now view the secure document
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Document Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{documentData.title}</CardTitle>
                  <CardDescription>From: {documentData.sender}</CardDescription>
                </div>
                <Badge variant="outline">
                  <Lock className="h-3 w-3 mr-1" />
                  Secure
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Document Type</p>
                  <p className="font-medium">{documentData.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">File Size</p>
                  <p className="font-medium">{documentData.size}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expires</p>
                  <p className="font-medium">{documentData.expires}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Access Token</p>
                  <p className="font-medium text-xs">{params.token.slice(0, 8)}...</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download Document
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Online
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Document Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
              <CardDescription>Secure document content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-muted/30 rounded-lg border-2 border-dashed border-border">
                <p className="text-muted-foreground">{documentData.content}</p>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              This document access has been logged for security purposes. Do not share this link or your PIN with
              others.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Secure Document Access</h1>
          <p className="text-muted-foreground">Enter your PIN to access the secure document</p>
        </div>

        {/* Security Info */}
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-accent mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-medium text-accent">Security Protected</h3>
                <p className="text-sm text-muted-foreground">
                  This document is protected with PIN authentication. Your access attempt will be logged for security
                  purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PIN Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please enter your 6-digit PIN to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">PIN Code</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter your PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  disabled={attempts >= 3}
                />
              </div>

              {error && (
                <Alert variant={attempts >= 3 ? "destructive" : "default"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || attempts >= 3 || pin.length !== 6}>
                {isLoading ? "Verifying..." : "Access Document"}
              </Button>

              {attempts > 0 && attempts < 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  {3 - attempts} attempt{3 - attempts !== 1 ? "s" : ""} remaining
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Document Info Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Document Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Title:</span>
              <span className="text-sm font-medium">{documentData.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">From:</span>
              <span className="text-sm font-medium">{documentData.sender}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Expires:</span>
              <span className="text-sm font-medium">{documentData.expires}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Access ID:</span>
              <span className="text-sm font-mono">{params.token.slice(0, 8)}...</span>
            </div>
          </CardContent>
        </Card>

        {/* Security Footer */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span>IP: 192.168.1.100</span>
            </div>
            <div className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              <span>Desktop</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Secured by SecureBeacon • All access attempts are monitored</p>
        </div>
      </div>
    </div>
  )
}
