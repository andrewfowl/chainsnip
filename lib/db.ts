import { neon } from "@neondatabase/serverless"

// Create a SQL client using the Neon serverless driver
// neon() returns a function that accepts tagged template literals
const sql = neon(process.env.DATABASE_URL!)

// Helper to get a single row - uses tagged template with parameter substitution
export async function queryOne<T>(query: string, params?: unknown[]): Promise<T | null> {
  // Build a tagged template call dynamically
  const result = await sql(query, params || [])
  return (result[0] as T) || null
}

// Helper to get multiple rows
export async function queryMany<T>(query: string, params?: unknown[]): Promise<T[]> {
  const result = await sql(query, params || [])
  return result as T[]
}

// Helper to execute a mutation (INSERT, UPDATE, DELETE)
export async function execute(query: string, params?: unknown[]): Promise<void> {
  await sql(query, params || [])
}

// Export the raw sql for tagged template usage if needed
export { sql }
