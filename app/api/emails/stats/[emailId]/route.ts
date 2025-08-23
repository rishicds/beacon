import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

export async function GET(request: NextRequest, { params }: { params: { emailId: string } }) {
  try {
    const { emailId } = params

    const stats = await emailService.getEmailStats(emailId)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching email stats:", error)

    return NextResponse.json({ error: "Failed to fetch email statistics" }, { status: 500 })
  }
}
