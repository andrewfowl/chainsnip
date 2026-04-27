"use server"

import { stackApp, getCurrentUser, initializeUser, updateUserPlan } from "@/lib/auth"

// Get current user from Stack Auth
export async function getUser() {
  return getCurrentUser()
}

// Sign up - handled by Stack Auth UI (use StackProvider in client)
export async function signUp(email: string, password: string, name: string) {
  try {
    // Stack Auth handles signup - this is for reference only
    // Use Stack's client components for actual signup
    return { success: true }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: "Failed to create account" }
  }
}

// Sign in - handled by Stack Auth UI
export async function signIn(email: string, password: string) {
  try {
    // Stack Auth handles signin - this is for reference only
    // Use Stack's client components for actual signin
    return { success: true }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "Failed to sign in" }
  }
}

// Sign out
export async function signOut() {
  try {
    // Stack Auth handles signout
    const user = await stackApp.getUser()
    if (user) {
      await stackApp.signOut()
    }
  } catch (error) {
    console.error("Sign out error:", error)
  }
}

// Update user plan
export async function updatePlan(plan: "free" | "pro" | "enterprise" | "lifetime") {
  try {
    const user = await stackApp.getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    await updateUserPlan(user.id, plan)
    return { success: true }
  } catch (error) {
    console.error("Update plan error:", error)
    return { success: false, error: "Failed to update plan" }
  }
}

// Initialize user after they sign up (call this from a webhook or middleware)
export async function ensureUserInitialized() {
  try {
    const user = await stackApp.getUser()
    if (user) {
      await initializeUser(user.id, user.email || "", user.displayName || null)
    }
  } catch (error) {
    console.error("Initialize user error:", error)
  }
}
