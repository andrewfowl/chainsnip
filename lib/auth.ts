import { queryOne, queryMany, execute } from "./db"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

// User type matching public.users table
export interface User {
  id: string
  email: string
  name: string
  plan: "free" | "pro" | "enterprise" | "lifetime"
  created_at: Date
  updated_at: Date
}

// Session type matching public.sessions table
export interface Session {
  id: string
  user_id: string
  token: string
  expires_at: Date
  created_at: Date
}

const SESSION_COOKIE_NAME = "session_token"
const SESSION_DURATION_DAYS = 7

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")
}

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Create a new user
export async function createUser(
  email: string,
  password: string,
  name: string
): Promise<User | null> {
  const passwordHash = await hashPassword(password)
  const id = crypto.randomUUID()

  try {
    await execute(
      `INSERT INTO users (id, email, password_hash, name, plan, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'free', NOW(), NOW())`,
      [id, email.toLowerCase(), passwordHash, name]
    )

    return await getUserById(id)
  } catch (error: any) {
    if (error?.code === "23505") {
      // Unique constraint violation - email exists
      return null
    }
    throw error
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  return queryOne<User>(
    `SELECT id, email, name, plan, created_at, updated_at FROM users WHERE id = $1`,
    [id]
  )
}

// Get user by email
export async function getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  return queryOne<User & { password_hash: string }>(
    `SELECT id, email, name, plan, password_hash, created_at, updated_at FROM users WHERE email = $1`,
    [email.toLowerCase()]
  )
}

// Create a session for a user
export async function createSession(userId: string): Promise<Session> {
  const id = crypto.randomUUID()
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000)

  await execute(
    `INSERT INTO sessions (id, user_id, token, expires_at, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [id, userId, token, expiresAt]
  )

  return { id, user_id: userId, token, expires_at: expiresAt, created_at: new Date() }
}

// Get session by token
export async function getSessionByToken(token: string): Promise<Session | null> {
  return queryOne<Session>(
    `SELECT id, user_id, token, expires_at, created_at FROM sessions 
     WHERE token = $1 AND expires_at > NOW()`,
    [token]
  )
}

// Delete a session
export async function deleteSession(token: string): Promise<void> {
  await execute(`DELETE FROM sessions WHERE token = $1`, [token])
}

// Delete all sessions for a user
export async function deleteUserSessions(userId: string): Promise<void> {
  await execute(`DELETE FROM sessions WHERE user_id = $1`, [userId])
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  await execute(`DELETE FROM sessions WHERE expires_at < NOW()`)
}

// Set session cookie
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  })
}

// Get session token from cookie
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null
}

// Clear session cookie
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Get current user from session
export async function getCurrentUserFromSession(): Promise<User | null> {
  const token = await getSessionToken()
  if (!token) return null

  const session = await getSessionByToken(token)
  if (!session) return null

  return getUserById(session.user_id)
}
