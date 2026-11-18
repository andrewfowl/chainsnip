"use server"

import {
  createUser,
  getUserByEmail,
  verifyPassword,
  createSession,
  setSessionCookie,
  getSessionToken,
  getSessionByToken,
  getUserById,
  deleteSession,
  clearSessionCookie,
  type User,
} from "@/lib/auth"
import { checkBotId } from "botid/server"
import { checkEmailDeliverable, checkSignupRateLimit, clientIpHash, recordSignupAttempt } from "@/lib/signup-guard"

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
function isValidPassword(password: string): boolean {
  return password.length >= 8 && password.length <= 128
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = await getSessionToken()
    if (!token) return null

    const session = await getSessionByToken(token)
    if (!session) return null

    return getUserById(session.user_id)
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Sign in
export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isValidEmail(email)) {
      return { success: false, error: "Invalid email format" }
    }

    if (!isValidPassword(password)) {
      return { success: false, error: "Invalid password format" }
    }

    const user = await getUserByEmail(email)
    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    const validPassword = await verifyPassword(password, user.password_hash)
    if (!validPassword) {
      return { success: false, error: "Invalid email or password" }
    }

    const session = await createSession(user.id)
    await setSessionCookie(session.token)

    return { success: true }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "An error occurred during sign in" }
  }
}

// Sign up
export async function signUp(
  email: string,
  password: string,
  name: string,
  honeypot = ""
): Promise<{ success: boolean; error?: string }> {
  email = String(email ?? "").trim().toLowerCase()
  let ipHash = "unknown"
  const fail = async (reason: string, error: string) => {
    await recordSignupAttempt(ipHash, email, false, reason)
    return { success: false, error }
  }

  try {
    ipHash = await clientIpHash()

    const rateLimit = await checkSignupRateLimit(ipHash)
    if (!rateLimit.ok) {
      return fail("rate_limited", rateLimit.error)
    }

    if (honeypot) {
      return fail("honeypot", "An error occurred during sign up")
    }

    const verification = await checkBotId()
    if (verification.isBot) {
      return fail("bot", "We couldn't verify this sign-up. Please try again from a regular browser.")
    }

    if (!isValidEmail(email)) {
      return fail("invalid_email", "Invalid email format")
    }

    if (!isValidPassword(password)) {
      return fail("invalid_password", "Password must be between 8 and 128 characters")
    }

    if (!name || name.trim().length === 0) {
      return fail("missing_name", "Name is required")
    }

    if (name.length > 100) {
      return fail("name_too_long", "Name must be less than 100 characters")
    }

    const deliverable = await checkEmailDeliverable(email)
    if (!deliverable.ok) {
      return fail("undeliverable_email", deliverable.error)
    }

    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return fail("email_exists", "An account with this email already exists")
    }

    const user = await createUser(email, password, name)
    if (!user) {
      return fail("create_failed", "Failed to create account")
    }
    await recordSignupAttempt(ipHash, email, true)

    const session = await createSession(user.id)
    await setSessionCookie(session.token)

    return { success: true }
  } catch (error: any) {
    console.error("Sign up error:", error?.message || error)
    return fail(`error: ${error?.message || String(error)}`, "An error occurred during sign up")
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    const token = await getSessionToken()
    if (token) {
      await deleteSession(token)
      await clearSessionCookie()
    }
  } catch (error) {
    console.error("Sign out error:", error)
  }
}
