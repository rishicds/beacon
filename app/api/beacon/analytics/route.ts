import { type NextRequest, NextResponse } from "next/server"
import { beaconService } from "@/lib/beacon-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "7d"

    const analytics = await beaconService.getBeaconAnalytics(timeRange)

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching beacon analytics:", error)

    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
