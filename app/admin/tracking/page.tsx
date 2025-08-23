"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminSidebar } from "@/components/admin-sidebar"
import { BeaconAnalytics } from "@/components/beacon-analytics"
import { TrackingMap } from "@/components/tracking-map"
import { SecurityAlerts } from "@/components/security-alerts"
import { TrackingTable } from "@/components/tracking-table"
import { RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TrackingPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [trackingData, setTrackingData] = useState({
    totalOpens: 0,
    uniqueOpens: 0,
    recentActivity: [],
    locationData: [],
    deviceData: [],
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  useEffect(() => {
    // Load initial tracking data
    // In real app, this would fetch from API
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
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
                <h1 className="text-3xl font-bold text-foreground">Email Tracking</h1>
                <p className="text-muted-foreground">Monitor email opens and recipient behavior</p>
              </div>
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
          </div>

          {/* Analytics Overview */}
          <BeaconAnalytics />

          {/* Main Content */}
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="map">Location Map</TabsTrigger>
              <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
              <TabsTrigger value="analytics">Detailed Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <TrackingTable />
            </TabsContent>

            <TabsContent value="map">
              <TrackingMap />
            </TabsContent>

            <TabsContent value="alerts">
              <SecurityAlerts expanded />
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Analytics</CardTitle>
                    <CardDescription>Email opens by device type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Desktop</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full">
                            <div className="w-20 h-2 bg-primary rounded-full"></div>
                          </div>
                          <span className="text-sm text-muted-foreground">62%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Mobile</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full">
                            <div className="w-12 h-2 bg-accent rounded-full"></div>
                          </div>
                          <span className="text-sm text-muted-foreground">38%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Time Analytics</CardTitle>
                    <CardDescription>Email opens by time of day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Morning (6-12)</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full">
                            <div className="w-24 h-2 bg-primary rounded-full"></div>
                          </div>
                          <span className="text-sm text-muted-foreground">45%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Afternoon (12-18)</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full">
                            <div className="w-20 h-2 bg-accent rounded-full"></div>
                          </div>
                          <span className="text-sm text-muted-foreground">35%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Evening (18-24)</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full">
                            <div className="w-8 h-2 bg-chart-3 rounded-full"></div>
                          </div>
                          <span className="text-sm text-muted-foreground">20%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
