"use server"

import { auth } from "@/lib/auth"
import { headers, cookies } from "next/headers"

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

// Sign in using Better Auth
export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
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
      asResponse: true, // Get full Response to extract cookies
    })

    // Extract and set cookies from Better Auth response
    const setCookieHeader = result.headers.get("set-cookie")
    if (setCookieHeader) {
      const cookieStore = await cookies()
      // Parse and set each cookie
      const cookieParts = setCookieHeader.split(";")[0].split("=")
      const cookieName = cookieParts[0]
      const cookieValue = cookieParts.slice(1).join("=")
      cookieStore.set(cookieName, cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      })
    }

    return { success: result.ok, error: result.ok ? undefined : "Invalid email or password" }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "An error occurred during sign in" }
  }
}

// Sign up using Better Auth with validation
export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[v0] signUp called for email:", email)

    // Validate inputs
    if (!isValidEmail(email)) {
      console.log("[v0] signUp: invalid email")
      return { success: false, error: "Invalid email format" }
    }

    if (!isValidPassword(password)) {
      console.log("[v0] signUp: invalid password length")
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
    console.log("[v0] signUp: calling auth.api.signUpEmail")
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
      headers: headersList,
      asResponse: true, // Get full Response to extract cookies
    })

    console.log("[v0] signUp result ok:", result.ok)

    // Extract and set cookies from Better Auth response
    if (result.ok) {
      const setCookieHeader = result.headers.get("set-cookie")
      if (setCookieHeader) {
        const cookieStore = await cookies()
        const cookieParts = setCookieHeader.split(";")[0].split("=")
        const cookieName = cookieParts[0]
        const cookieValue = cookieParts.slice(1).join("=")
        cookieStore.set(cookieName, cookieValue, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        })
      }
    }

    return { success: result.ok, error: result.ok ? undefined : "Failed to create account" }
  } catch (error: any) {
    console.error("[v0] Sign up error:", error?.message || error)
    return { success: false, error: error?.message || "An error occurred during sign up" }
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
