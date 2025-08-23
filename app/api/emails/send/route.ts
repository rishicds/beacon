import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"
import { authService } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Get current user (in real app, would validate session)
    const user = await authService.getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailData = await request.json()

    // Validate required fields
    if (!emailData.subject || !emailData.recipients || emailData.recipients.length === 0) {
      return NextResponse.json({ error: "Subject and recipients are required" }, { status: 400 })
    }

    // Send email
    const result = await emailService.sendSecureEmail(emailData, user.$id)

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      emailId: result.$id,
    })
  } catch (error) {
    console.error("Email sending error:", error)

    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
