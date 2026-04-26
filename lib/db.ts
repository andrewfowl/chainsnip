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

// Export the pool for direct usage if needed
export { pool }
