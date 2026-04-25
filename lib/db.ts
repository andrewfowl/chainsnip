import { neon } from "@neondatabase/serverless"

// Create a SQL client using the Neon serverless driver
const sql = neon(process.env.DATABASE_URL!)

// Helper to get a single row - uses sql.query() for parameterized queries
export async function queryOne<T>(query: string, params?: unknown[]): Promise<T | null> {
  const rows = await sql.query(query, params)
  return (rows.rows[0] as T) || null
}

// Helper to get multiple rows
export async function queryMany<T>(query: string, params?: unknown[]): Promise<T[]> {
  const rows = await sql.query(query, params)
  return rows.rows as T[]
}

// Helper to execute a mutation (INSERT, UPDATE, DELETE)
export async function execute(query: string, params?: unknown[]): Promise<void> {
  await sql.query(query, params)
}

// Export the raw sql for tagged template usage if needed
export { sql }
