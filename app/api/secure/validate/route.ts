import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { token, pin } = await request.json()

    if (!token || !pin) {
      return NextResponse.json({ error: "Token and PIN are required" }, { status: 400 })
    }

    // Get user info for logging
    const userAgent = request.headers.get("user-agent") || "unknown"
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const deviceType = userAgent.includes("Mobile") ? "Mobile" : "Desktop"

    const userInfo = {
      ip,
      userAgent,
      deviceType,
      location: "Unknown", // Would integrate with IP geolocation
    }

    const result = await emailService.validatePIN(token, pin, userInfo)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "PIN validated successfully",
        secureLink: result.secureLink,
      })
    } else {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 })
    }
  } catch (error) {
    console.error("PIN validation error:", error)

    return NextResponse.json({ error: "Validation failed" }, { status: 500 })
  }
}
