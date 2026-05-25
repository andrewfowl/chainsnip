import { Pool } from "@neondatabase/serverless"

// Create a connection pool for parameterized queries
const pool = new Pool({ connectionString: process.env.DATABASE_URL! })

// Helper to get a single row
export async function queryOne<T>(query: string, params?: unknown[]): Promise<T | null> {
  const startTime = Date.now()
  console.log("[v0] DB queryOne - Query:", query.slice(0, 100) + (query.length > 100 ? "..." : ""))
  console.log("[v0] DB queryOne - Params:", JSON.stringify(params))
  
  try {
    const result = await pool.query(query, params)
    const elapsed = Date.now() - startTime
    console.log("[v0] DB queryOne - Success in", elapsed, "ms, rows returned:", result.rows.length)
    return (result.rows[0] as T) || null
  } catch (error) {
    const elapsed = Date.now() - startTime
    console.error("[v0] DB queryOne - FAILED after", elapsed, "ms")
    console.error("[v0] DB queryOne - Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[v0] DB queryOne - Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] DB queryOne - Error code:", (error as { code?: string })?.code || "N/A")
    throw error
  }
}

// Helper to get multiple rows
export async function queryMany<T>(query: string, params?: unknown[]): Promise<T[]> {
  const startTime = Date.now()
  console.log("[v0] DB queryMany - Query:", query.slice(0, 100) + (query.length > 100 ? "..." : ""))
  console.log("[v0] DB queryMany - Params:", JSON.stringify(params))
  
  try {
    const result = await pool.query(query, params)
    const elapsed = Date.now() - startTime
    console.log("[v0] DB queryMany - Success in", elapsed, "ms, rows returned:", result.rows.length)
    
    if (result.rows.length > 0) {
      console.log("[v0] DB queryMany - First row keys:", Object.keys(result.rows[0]))
    }
    
    return result.rows as T[]
  } catch (error) {
    const elapsed = Date.now() - startTime
    console.error("[v0] DB queryMany - FAILED after", elapsed, "ms")
    console.error("[v0] DB queryMany - Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[v0] DB queryMany - Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] DB queryMany - Error code:", (error as { code?: string })?.code || "N/A")
    throw error
  }
}

// Helper to execute a mutation (INSERT, UPDATE, DELETE)
export async function execute(query: string, params?: unknown[]): Promise<void> {
  const startTime = Date.now()
  console.log("[v0] DB execute - Query:", query.slice(0, 100) + (query.length > 100 ? "..." : ""))
  console.log("[v0] DB execute - Params count:", params?.length || 0)
  
  try {
    await pool.query(query, params)
    const elapsed = Date.now() - startTime
    console.log("[v0] DB execute - Success in", elapsed, "ms")
  } catch (error) {
    const elapsed = Date.now() - startTime
    console.error("[v0] DB execute - FAILED after", elapsed, "ms")
    console.error("[v0] DB execute - Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[v0] DB execute - Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] DB execute - Error code:", (error as { code?: string })?.code || "N/A")
    throw error
  }
}

// Get user plan from usage_stats
export async function getUserPlan(userId: string): Promise<"free" | "pro" | "enterprise" | "lifetime"> {
  console.log("[v0] DB getUserPlan - userId:", userId)
  try {
    const result = await queryOne<{ plan: string }>(
      `SELECT plan FROM usage_stats WHERE user_id = $1`,
      [userId],
    )
    const plan = (result?.plan || "free") as "free" | "pro" | "enterprise" | "lifetime"
    console.log("[v0] DB getUserPlan - Result:", plan)
    return plan
  } catch (error) {
    console.error("[v0] DB getUserPlan - FAILED, defaulting to 'free':", error)
    return "free"
  }
}

// Export the pool for direct usage if needed
export { pool }
