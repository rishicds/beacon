import { Client, Account, Databases, Storage, Functions } from "appwrite"

const client = new Client()

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export const functions = new Functions(client)

export { client }

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "secure-email-db"
export const COLLECTIONS = {
  USERS: "users",
  EMAILS: "emails",
  BEACONS: "beacons",
  ACCESS_LOGS: "access_logs",
  SECURE_LINKS: "secure_links",
  ATTACHMENTS: "attachments",
}

// Storage Bucket IDs
export const BUCKETS = {
  ATTACHMENTS: "secure-attachments",
}
