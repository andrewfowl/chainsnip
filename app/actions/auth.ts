"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

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
export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const headersList = await headers()
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: headersList,
    })
    return { success: !!result, error: result ? undefined : "Failed to sign in" }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "Failed to sign in" }
  }
}

// Sign up using Better Auth
export async function signUp(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
  try {
    const headersList = await headers()
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
      headers: headersList,
    })
    return { success: !!result, error: result ? undefined : "Failed to create account" }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: "Failed to create account" }
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
