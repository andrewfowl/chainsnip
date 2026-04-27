import { betterAuth } from "better-auth"
import { Pool } from "@neondatabase/serverless"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
})

// Determine base URL - use env var if set, otherwise use VERCEL_URL for previews
const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (process.env.NODE_ENV === "production") return "https://chainsnip.com"
  return "http://localhost:3000"
}

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: getBaseURL(),
  appName: "ChainSnip",
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    "https://chainsnip.com",
    "https://chainsnip.vercel.app",
    "http://localhost:3000",
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],
})

export type Session = typeof auth.$Inferred.Session
export type User = typeof auth.$Inferred.User
