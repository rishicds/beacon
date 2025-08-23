import { type NextRequest, NextResponse } from "next/server"
import { databaseService } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { beaconId: string } }) {
  try {
    const { beaconId } = params
    const userAgent = request.headers.get("user-agent") || "unknown"
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Extract device type from user agent
    const deviceType = userAgent.includes("Mobile") ? "Mobile" : "Desktop"

    // Get recipient email from query params (would be embedded in email)
    const recipientEmail = request.nextUrl.searchParams.get("recipient") || "unknown"

    // Log beacon open
    await databaseService.logBeaconOpen({
      beaconId,
      emailId: "", // Would be looked up from beacon ID in real implementation
      recipientEmail,
      ipAddress: ip,
      userAgent,
      deviceType,
      location: "Unknown", // Would integrate with IP geolocation service
    })

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64",
    )

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": pixel.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Beacon tracking error:", error)

    // Still return pixel even on error to avoid breaking email display
    const pixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64",
    )

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": pixel.length.toString(),
      },
    })
  }
}
