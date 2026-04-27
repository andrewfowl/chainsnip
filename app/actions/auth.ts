"use server"

import { auth } from "@/lib/auth"
import { rateLimitAuthRequest } from "@/lib/rate-limit"
import { headers } from "next/headers"

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
function isValidPassword(password: string): boolean {
  return password.length >= 8 && password.length <= 128
}

// Get current user from Better Auth session
export async function getCurrentUser() {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    return session?.user || null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Sign in using Better Auth with rate limiting
export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Rate limit by email
    const rateLimitResult = await rateLimitAuthRequest(`signin:${email}`)
    if (!rateLimitResult.success) {
      return {
        success: false,
        error: "Too many login attempts. Please try again later.",
      }
    }

    // Validate inputs
    if (!isValidEmail(email)) {
      return { success: false, error: "Invalid email format" }
    }

    if (!isValidPassword(password)) {
      return { success: false, error: "Invalid password format" }
    }

    const headersList = await headers()
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: headersList,
    })

    return { success: !!result, error: result ? undefined : "Invalid email or password" }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "An error occurred during sign in" }
  }
}

// Sign up using Better Auth with rate limiting and validation
export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Rate limit by email
    const rateLimitResult = await rateLimitAuthRequest(`signup:${email}`)
    if (!rateLimitResult.success) {
      return {
        success: false,
        error: "Too many signup attempts. Please try again later.",
      }
    }

    // Validate inputs
    if (!isValidEmail(email)) {
      return { success: false, error: "Invalid email format" }
    }

    if (!isValidPassword(password)) {
      return {
        success: false,
        error: "Password must be between 8 and 128 characters",
      }
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Name is required" }
    }

    if (name.length > 100) {
      return { success: false, error: "Name must be less than 100 characters" }
    }

    const headersList = await headers()
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
      headers: headersList,
    })

    return { success: !!result, error: result ? undefined : "Failed to create account" }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: "An error occurred during sign up" }
  }
}

// Sign out using Better Auth
export async function signOut(): Promise<void> {
  try {
    const headersList = await headers()
    await auth.api.signOut({ headers: headersList })
  } catch (error) {
    console.error("Sign out error:", error)
  }
}
