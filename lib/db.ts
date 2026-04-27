import { Pool } from "@neondatabase/serverless"

// Create a connection pool for parameterized queries
const pool = new Pool({ connectionString: process.env.DATABASE_URL! })

// Helper to get a single row
export async function queryOne<T>(query: string, params?: unknown[]): Promise<T | null> {
  const result = await pool.query(query, params)
  return (result.rows[0] as T) || null
}

// Helper to get multiple rows
export async function queryMany<T>(query: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(query, params)
  return result.rows as T[]
}

// Helper to execute a mutation (INSERT, UPDATE, DELETE)
export async function execute(query: string, params?: unknown[]): Promise<void> {
  await pool.query(query, params)
}

// Get user plan from usage_stats
export async function getUserPlan(userId: string): Promise<"free" | "pro" | "enterprise" | "lifetime"> {
  try {
    const result = await queryOne<{ plan: string }>(
      `SELECT plan FROM usage_stats WHERE user_id = $1`,
      [userId],
    )
    return (result?.plan || "free") as "free" | "pro" | "enterprise" | "lifetime"
  } catch {
    return "free"
  }
}

// Export the pool for direct usage if needed
export { pool }
