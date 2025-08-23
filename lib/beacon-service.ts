import { databaseService } from "./database"

export interface BeaconData {
  beaconId: string
  emailId: string
  recipientEmail: string
  ipAddress: string
  userAgent: string
  location?: string
  deviceType: string
}

export interface SuspiciousActivity {
  type: "unusual_location" | "multiple_devices" | "rapid_opens" | "forwarding_detected"
  severity: "low" | "medium" | "high"
  description: string
  beaconId: string
  emailId: string
  recipientEmail: string
}

export class BeaconService {
  // Detect device type from user agent
  private detectDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase()

    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      return "Mobile"
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      return "Tablet"
    } else {
      return "Desktop"
    }
  }

  // Get location from IP address (mock implementation)
  private async getLocationFromIP(ip: string): Promise<string> {
    // In a real implementation, you would use a service like:
    // - MaxMind GeoIP2
    // - IPGeolocation API
    // - ipapi.co
    // - Abstract API

    const mockLocations = [
      "New York, US",
      "London, UK",
      "Toronto, CA",
      "Berlin, DE",
      "Paris, FR",
      "Tokyo, JP",
      "Sydney, AU",
    ]

    return mockLocations[Math.floor(Math.random() * mockLocations.length)]
  }

  // Track beacon open
  async trackBeaconOpen(data: Omit<BeaconData, "deviceType" | "location">) {
    try {
      const deviceType = this.detectDeviceType(data.userAgent)
      const location = await this.getLocationFromIP(data.ipAddress)

      const beaconLog = await databaseService.logBeaconOpen({
        ...data,
        deviceType,
        location,
      })

      // Check for suspicious activity
      await this.analyzeSuspiciousActivity(data.beaconId, data.recipientEmail, {
        ipAddress: data.ipAddress,
        deviceType,
        location,
      })

      return beaconLog
    } catch (error) {
      console.error("Error tracking beacon open:", error)
      throw error
    }
  }

  // Analyze for suspicious activity
  private async analyzeSuspiciousActivity(
    beaconId: string,
    recipientEmail: string,
    currentData: { ipAddress: string; deviceType: string; location: string },
  ) {
    try {
      // Get recent beacon logs for this recipient
      const recentLogs = await databaseService.getBeaconLogs()
      const recipientLogs = recentLogs.documents.filter((log) => log.recipientEmail === recipientEmail)

      const suspiciousActivities: SuspiciousActivity[] = []

      // Check for unusual location
      const knownLocations = recipientLogs.map((log) => log.location).filter(Boolean)
      if (knownLocations.length > 0 && !knownLocations.includes(currentData.location)) {
        suspiciousActivities.push({
          type: "unusual_location",
          severity: "medium",
          description: `Email opened from new location: ${currentData.location}`,
          beaconId,
          emailId: "", // Would be populated from beacon data
          recipientEmail,
        })
      }

      // Check for multiple devices
      const knownDevices = recipientLogs.map((log) => log.deviceType)
      const uniqueDevices = new Set([...knownDevices, currentData.deviceType])
      if (uniqueDevices.size > 2) {
        suspiciousActivities.push({
          type: "multiple_devices",
          severity: "low",
          description: `Email accessed from multiple device types: ${Array.from(uniqueDevices).join(", ")}`,
          beaconId,
          emailId: "",
          recipientEmail,
        })
      }

      // Check for rapid opens (potential forwarding)
      const recentOpens = recipientLogs.filter((log) => {
        const logTime = new Date(log.openedAt).getTime()
        const now = new Date().getTime()
        return now - logTime < 60000 // Within last minute
      })

      if (recentOpens.length > 3) {
        suspiciousActivities.push({
          type: "rapid_opens",
          severity: "high",
          description: `Multiple rapid opens detected (${recentOpens.length} in 1 minute)`,
          beaconId,
          emailId: "",
          recipientEmail,
        })
      }

      // Log suspicious activities
      for (const activity of suspiciousActivities) {
        console.log("Suspicious activity detected:", activity)
        // In a real implementation, you would:
        // 1. Store in database
        // 2. Send alerts to administrators
        // 3. Trigger security workflows
      }

      return suspiciousActivities
    } catch (error) {
      console.error("Error analyzing suspicious activity:", error)
      return []
    }
  }

  // Get beacon analytics
  async getBeaconAnalytics(timeRange = "7d") {
    try {
      const logs = await databaseService.getBeaconLogs()

      const analytics = {
        totalOpens: logs.documents.length,
        uniqueOpens: new Set(logs.documents.map((log) => log.recipientEmail)).size,
        deviceBreakdown: this.getDeviceBreakdown(logs.documents),
        locationBreakdown: this.getLocationBreakdown(logs.documents),
        timeBreakdown: this.getTimeBreakdown(logs.documents),
        suspiciousCount: 0, // Would be calculated from stored suspicious activities
      }

      return analytics
    } catch (error) {
      console.error("Error getting beacon analytics:", error)
      throw error
    }
  }

  private getDeviceBreakdown(logs: any[]) {
    const devices = logs.reduce(
      (acc, log) => {
        acc[log.deviceType] = (acc[log.deviceType] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(devices).map(([device, count]) => ({
      device,
      count,
      percentage: Math.round((count / logs.length) * 100),
    }))
  }

  private getLocationBreakdown(logs: any[]) {
    const locations = logs.reduce(
      (acc, log) => {
        if (log.location) {
          acc[log.location] = (acc[log.location] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(locations)
      .map(([location, count]) => ({
        location,
        count,
        percentage: Math.round((count / logs.length) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 locations
  }

  private getTimeBreakdown(logs: any[]) {
    const hours = logs.reduce(
      (acc, log) => {
        const hour = new Date(log.openedAt).getHours()
        const period =
          hour < 6 ? "Night" : hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : hour < 24 ? "Evening" : "Night"

        acc[period] = (acc[period] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(hours).map(([period, count]) => ({
      period,
      count,
      percentage: Math.round((count / logs.length) * 100),
    }))
  }
}

export const beaconService = new BeaconService()
