import { databaseService } from "./database"
import crypto from "crypto"

export interface EmailComposition {
  subject: string
  body: string
  recipients: string[]
  attachments: any[]
  securityEnabled: boolean
  trackingEnabled: boolean
  requirePIN: boolean
  expirationDays: number
}

export class EmailService {
  // Generate unique beacon ID
  private generateBeaconId(): string {
    return crypto.randomBytes(16).toString("hex")
  }

  // Generate secure token
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex")
  }

  // Send secure email
  async sendSecureEmail(emailData: EmailComposition, senderId: string) {
    try {
      const beaconId = this.generateBeaconId()
      const secureLinks: string[] = []

      // Create secure links for attachments if security is enabled
      if (emailData.securityEnabled && emailData.attachments.length > 0) {
        for (const attachment of emailData.attachments) {
          const token = this.generateSecureToken()
          const expirationDate = new Date()
          expirationDate.setDate(expirationDate.getDate() + emailData.expirationDays)

          // Create secure link for each recipient
          for (const recipient of emailData.recipients) {
            await databaseService.createSecureLink({
              token,
              emailId: "", // Will be updated after email creation
              attachmentId: attachment.id,
              recipientEmail: recipient,
              requiresPIN: emailData.requirePIN,
              expirationDate: expirationDate.toISOString(),
              isRevoked: false,
            })
          }

          secureLinks.push(token)
        }
      }

      // Create email record
      const email = await databaseService.createEmail({
        subject: emailData.subject,
        body: emailData.body,
        sender: senderId,
        recipients: emailData.recipients,
        beaconId,
        secureLinks,
        trackingEnabled: emailData.trackingEnabled,
        securityEnabled: emailData.securityEnabled,
        expirationDate: new Date(Date.now() + emailData.expirationDays * 24 * 60 * 60 * 1000).toISOString(),
        status: "sent",
      })

      // Update secure links with email ID
      if (secureLinks.length > 0) {
        // In a real implementation, you would update the secure links here
        // This is a simplified version
      }

      // In a real implementation, you would integrate with an email service like:
      // - SendGrid
      // - Postmark
      // - AWS SES
      // - Custom SMTP server

      console.log("Email sent successfully:", email.$id)
      return email
    } catch (error) {
      console.error("Error sending email:", error)
      throw error
    }
  }

  // Get email statistics
  async getEmailStats(emailId: string) {
    try {
      const [email, beaconLogs, accessLogs] = await Promise.all([
        databaseService.getEmailById(emailId),
        databaseService.getBeaconLogs(emailId),
        databaseService.getAccessLogs(emailId),
      ])

      const opens = beaconLogs.documents.length
      const uniqueOpens = new Set(beaconLogs.documents.map((log) => log.recipientEmail)).size
      const secureAccesses = accessLogs.documents.filter((log) => log.pinSuccess).length
      const failedAttempts = accessLogs.documents.filter((log) => log.pinAttempt && !log.pinSuccess).length

      return {
        email,
        stats: {
          sent: email.recipients.length,
          opens,
          uniqueOpens,
          openRate: email.recipients.length > 0 ? (uniqueOpens / email.recipients.length) * 100 : 0,
          secureAccesses,
          failedAttempts,
        },
        beaconLogs: beaconLogs.documents,
        accessLogs: accessLogs.documents,
      }
    } catch (error) {
      console.error("Error getting email stats:", error)
      throw error
    }
  }

  // Validate PIN for secure access
  async validatePIN(token: string, pin: string, userInfo: any) {
    try {
      const secureLink = await databaseService.getSecureLinkByToken(token)

      if (!secureLink) {
        throw new Error("Invalid or expired link")
      }

      if (secureLink.isRevoked) {
        throw new Error("Link has been revoked")
      }

      if (new Date(secureLink.expirationDate) < new Date()) {
        throw new Error("Link has expired")
      }

      // In a real implementation, you would:
      // 1. Hash the PIN and compare with stored hash
      // 2. Implement rate limiting for PIN attempts
      // 3. Lock accounts after too many failed attempts

      const pinValid = pin === "123456" // Mock validation

      // Log the access attempt
      await databaseService.logAccess({
        secureLinkId: secureLink.$id!,
        emailId: secureLink.emailId,
        recipientEmail: secureLink.recipientEmail,
        ipAddress: userInfo.ip || "unknown",
        userAgent: userInfo.userAgent || "unknown",
        deviceType: userInfo.deviceType || "unknown",
        location: userInfo.location,
        pinAttempt: true,
        pinSuccess: pinValid,
      })

      if (pinValid) {
        // Update access count
        await databaseService.updateSecureLinkAccess(secureLink.$id!, secureLink.accessCount + 1)
      }

      return {
        success: pinValid,
        secureLink: pinValid ? secureLink : null,
      }
    } catch (error) {
      console.error("Error validating PIN:", error)
      throw error
    }
  }
}

export const emailService = new EmailService()
