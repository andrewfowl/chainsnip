"use server"

import { cookies } from "next/headers"
import { queryOne, execute } from "@/lib/db"
import {
  type User,
  type DbUser,
  type DbSession,
  hashPassword,
  verifyPassword,
  generateToken,
  getUserById,
} from "@/lib/auth"

// Server action: Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) return null

    const session = await queryOne<DbSession>(`SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()`, [
      sessionToken,
    ])

    if (!session) return null

    return getUserById(session.user_id)
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Server action: Sign up
export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user exists
    const existingUser = await queryOne<DbUser>(`SELECT id FROM users WHERE email = $1`, [email])

    if (existingUser) {
      return { success: false, error: "Email already registered" }
    }

    const passwordHash = await hashPassword(password)
    const userId = crypto.randomUUID()

    // Create user
    await execute(`INSERT INTO users (id, email, name, password_hash, plan) VALUES ($1, $2, $3, $4, 'free')`, [
      userId,
      email,
      name,
      passwordHash,
    ])

    // Create initial usage stats
    await execute(`INSERT INTO usage_stats (user_id, total_captures_ever) VALUES ($1, 0)`, [userId])

    // Create session
    const sessionToken = generateToken()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await execute(`INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)`, [
      userId,
      sessionToken,
      expiresAt.toISOString(),
    ])

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: "Failed to create account" }
  }
}

// Server action: Sign in
export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await queryOne<DbUser>(`SELECT * FROM users WHERE email = $1`, [email])

    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      return { success: false, error: "Invalid email or password" }
    }

    // Create session
    const sessionToken = generateToken()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await execute(`INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)`, [
      user.id,
      sessionToken,
      expiresAt.toISOString(),
    ])

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "Failed to sign in" }
  }
}

// Server action: Sign out
export async function signOut(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (sessionToken) {
      await execute(`DELETE FROM sessions WHERE token = $1`, [sessionToken])
    }

    cookieStore.delete("session_token")
  } catch (error) {
    console.error("Sign out error:", error)
  }
}

// Server action: Update user plan
export async function updateUserPlan(userId: string, plan: "free" | "pro" | "enterprise" | "lifetime"): Promise<void> {
  try {
    await execute(`UPDATE users SET plan = $1, updated_at = NOW() WHERE id = $2`, [plan, userId])
  } catch (error) {
    console.error("Update plan error:", error)
  }
}
