import { account } from "./appwrite"
import { ID } from "appwrite"

export interface User {
  $id: string
  email: string
  name: string
  role: "admin" | "employee"
  pinHash?: string
  createdAt: string
}

export class AuthService {
  // Register new user
  async register(email: string, password: string, name: string, role: "admin" | "employee" = "employee") {
    try {
      const user = await account.create(ID.unique(), email, password, name)

      // Create user profile in database
      await this.createUserProfile(user.$id, {
        email,
        name,
        role,
        createdAt: new Date().toISOString(),
      })

      return user
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  // Login user
  async login(email: string, password: string) {
    try {
      return await account.createEmailPasswordSession(email, password)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  // Logout user
  async logout() {
    try {
      return await account.deleteSession("current")
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      return await account.get()
    } catch (error) {
      return null
    }
  }

  // Create user profile in database
  private async createUserProfile(userId: string, userData: Partial<User>) {
    const { databases, DATABASE_ID, COLLECTIONS } = await import("./appwrite")

    try {
      return await databases.createDocument(DATABASE_ID, COLLECTIONS.USERS, userId, userData)
    } catch (error) {
      console.error("Error creating user profile:", error)
      throw error
    }
  }

  // Update user PIN
  async updatePIN(userId: string, pinHash: string) {
    const { databases, DATABASE_ID, COLLECTIONS } = await import("./appwrite")

    try {
      return await databases.updateDocument(DATABASE_ID, COLLECTIONS.USERS, userId, { pinHash })
    } catch (error) {
      console.error("Error updating PIN:", error)
      throw error
    }
  }
}

export const authService = new AuthService()
