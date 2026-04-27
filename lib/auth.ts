import { StackServerApp } from "@stackframe/stack"

// Initialize Stack Auth
export const stackApp = new StackServerApp({
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY!,
})

export interface User {
  id: string
  email: string
  name: string | null
  plan: "free" | "pro" | "enterprise" | "lifetime"
}

// Get current user from Stack Auth
export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await stackApp.getUser()
    if (!user) return null

    // Get plan from our database
    const { getUserPlan } = await import("./db")
    const plan = await getUserPlan(user.id)

    return {
      id: user.id,
      email: user.email || "",
      name: user.displayName || null,
      plan,
    }
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

// Update user plan
export async function updateUserPlan(userId: string, plan: "free" | "pro" | "enterprise" | "lifetime"): Promise<void> {
  try {
    const { execute } = await import("./db")
    
    // Upsert into usage_stats
    await execute(
      `INSERT INTO usage_stats (user_id, plan, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET plan = $2, updated_at = NOW()`,
      [userId, plan],
    )
  } catch (error) {
    console.error("Update plan error:", error)
  }
}

// Initialize user in database when they sign up (called by Stack Auth webhook or on first login)
export async function initializeUser(userId: string, email: string, name: string | null): Promise<void> {
  try {
    const { execute } = await import("./db")
    
    // Upsert into usage_stats to track user and their plan
    await execute(
      `INSERT INTO usage_stats (user_id, plan, total_captures_ever, updated_at) 
       VALUES ($1, 'free', 0, NOW())
       ON CONFLICT (user_id) DO NOTHING`,
      [userId],
    )
  } catch (error) {
    console.error("Initialize user error:", error)
  }
}
