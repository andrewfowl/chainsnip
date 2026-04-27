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
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isValidEmail(email)) {
      return { success: false, error: "Invalid email format" }
    }

    if (!isValidPassword(password)) {
      return { success: false, error: "Password must be between 8 and 128 characters" }
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Name is required" }
    }

    if (name.length > 100) {
      return { success: false, error: "Name must be less than 100 characters" }
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return { success: false, error: "An account with this email already exists" }
    }

    const user = await createUser(email, password, name)
    if (!user) {
      return { success: false, error: "Failed to create account" }
    }

    const session = await createSession(user.id)
    await setSessionCookie(session.token)

    return { success: true }
  } catch (error: any) {
    console.error("Sign up error:", error?.message || error)
    return { success: false, error: "An error occurred during sign up" }
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
