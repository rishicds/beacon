import { databases, DATABASE_ID, COLLECTIONS } from "./appwrite"
import { ID, Query } from "appwrite"

export interface EmailRecord {
  $id?: string
  subject: string
  body: string
  sender: string
  recipients: string[]
  beaconId: string
  secureLinks: string[]
  trackingEnabled: boolean
  securityEnabled: boolean
  expirationDate: string
  createdAt: string
  status: "draft" | "sent" | "delivered"
}

export interface BeaconLog {
  $id?: string
  beaconId: string
  emailId: string
  recipientEmail: string
  ipAddress: string
  userAgent: string
  location?: string
  deviceType: string
  openedAt: string
}

export interface AccessLog {
  $id?: string
  secureLinkId: string
  emailId: string
  recipientEmail: string
  ipAddress: string
  userAgent: string
  location?: string
  deviceType: string
  pinAttempt: boolean
  pinSuccess: boolean
  accessedAt: string
  content?: string
}

export interface SecureLink {
  $id?: string
  token: string
  emailId: string
  attachmentId?: string
  recipientEmail: string
  requiresPIN: boolean
  expirationDate: string
  isRevoked: boolean
  accessCount: number
  maxAccess?: number
  createdAt: string
}

export class DatabaseService {
  // Email operations
  async createEmail(emailData: Omit<EmailRecord, "$id" | "createdAt">) {
    try {
      return await databases.createDocument(DATABASE_ID, COLLECTIONS.EMAILS, ID.unique(), {
        ...emailData,
        createdAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error creating email:", error)
      throw error
    }
  }

  async getEmails(limit = 50, offset = 0) {
    try {
      return await databases.listDocuments(DATABASE_ID, COLLECTIONS.EMAILS, [
        Query.orderDesc("createdAt"),
        Query.limit(limit),
        Query.offset(offset),
      ])
    } catch (error) {
      console.error("Error fetching emails:", error)
      throw error
    }
  }

  async getEmailById(emailId: string) {
    try {
      return await databases.getDocument(DATABASE_ID, COLLECTIONS.EMAILS, emailId)
    } catch (error) {
      console.error("Error fetching email:", error)
      throw error
    }
  }

  // Beacon tracking operations
  async logBeaconOpen(beaconData: Omit<BeaconLog, "$id" | "openedAt">) {
    try {
      return await databases.createDocument(DATABASE_ID, COLLECTIONS.BEACONS, ID.unique(), {
        ...beaconData,
        openedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error logging beacon open:", error)
      throw error
    }
  }

  async getBeaconLogs(emailId?: string, limit = 100) {
    try {
      const queries = [Query.orderDesc("openedAt"), Query.limit(limit)]

      if (emailId) {
        queries.push(Query.equal("emailId", emailId))
      }

      return await databases.listDocuments(DATABASE_ID, COLLECTIONS.BEACONS, queries)
    } catch (error) {
      console.error("Error fetching beacon logs:", error)
      throw error
    }
  }

  // Secure link operations
  async createSecureLink(linkData: Omit<SecureLink, "$id" | "createdAt" | "accessCount">) {
    try {
      return await databases.createDocument(DATABASE_ID, COLLECTIONS.SECURE_LINKS, ID.unique(), {
        ...linkData,
        accessCount: 0,
        createdAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error creating secure link:", error)
      throw error
    }
  }

  async getSecureLinkByToken(token: string) {
    try {
      const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SECURE_LINKS, [Query.equal("token", token)])

      return result.documents[0] || null
    } catch (error) {
      console.error("Error fetching secure link:", error)
      throw error
    }
  }

  async updateSecureLinkAccess(linkId: string, accessCount: number) {
    try {
      return await databases.updateDocument(DATABASE_ID, COLLECTIONS.SECURE_LINKS, linkId, { accessCount })
    } catch (error) {
      console.error("Error updating secure link access:", error)
      throw error
    }
  }

  async revokeSecureLink(linkId: string) {
    try {
      return await databases.updateDocument(DATABASE_ID, COLLECTIONS.SECURE_LINKS, linkId, { isRevoked: true })
    } catch (error) {
      console.error("Error revoking secure link:", error)
      throw error
    }
  }

  // Access log operations
  async logAccess(accessData: Omit<AccessLog, "$id" | "accessedAt">) {
    try {
      return await databases.createDocument(DATABASE_ID, COLLECTIONS.ACCESS_LOGS, ID.unique(), {
        ...accessData,
        accessedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error logging access:", error)
      throw error
    }
  }

  async getAccessLogs(emailId?: string, limit = 100) {
    try {
      const queries = [Query.orderDesc("accessedAt"), Query.limit(limit)]

      if (emailId) {
        queries.push(Query.equal("emailId", emailId))
      }

      return await databases.listDocuments(DATABASE_ID, COLLECTIONS.ACCESS_LOGS, queries)
    } catch (error) {
      console.error("Error fetching access logs:", error)
      throw error
    }
  }

  // User operations
  async getUserByEmail(email: string) {
    try {
      const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, [Query.equal("email", email)])

      return result.documents[0] || null
    } catch (error) {
      console.error("Error fetching user:", error)
      throw error
    }
  }

  async getUsers(role?: "admin" | "employee", limit = 50) {
    try {
      const queries = [Query.orderDesc("createdAt"), Query.limit(limit)]

      if (role) {
        queries.push(Query.equal("role", role))
      }

      return await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, queries)
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  }
}

export const databaseService = new DatabaseService()
