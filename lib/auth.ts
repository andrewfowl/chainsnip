import { queryOne } from "./db"

export interface User {
  id: string
  email: string
  name: string
  plan: "free" | "pro" | "enterprise" | "lifetime"
  created_at: string
}

export interface DbUser {
  id: string
  email: string
  name: string
  password_hash: string
  plan: string
  created_at: string
  updated_at: string
}

export interface DbSession {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}

// Simple hash function for demo (in production use bcrypt)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "chainsnip_salt_2024")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

export function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// Get user by ID (can be used server-side)
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const user = await queryOne<DbUser>(`SELECT * FROM users WHERE id = $1`, [userId])

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan as User["plan"],
      created_at: user.created_at,
    }
  } catch (error) {
    console.error("Get user error:", error)
    return null
  }
}

// Get user by session token (for server components)
export async function getUserBySessionToken(sessionToken: string): Promise<User | null> {
  try {
    const session = await queryOne<DbSession>(`SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()`, [
      sessionToken,
    ])

    if (!session) return null

    return getUserById(session.user_id)
  } catch (error) {
    console.error("Get user by session error:", error)
    return null
  }
}
