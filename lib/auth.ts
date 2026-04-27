import { betterAuth } from "better-auth"
import { Pool } from "@neondatabase/serverless"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
})

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || (process.env.NODE_ENV === "production" ? "https://chainsnip.com" : "http://localhost:3000"),
  appName: "ChainSnip",
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins:
    process.env.NODE_ENV === "production"
      ? ["https://chainsnip.com", "https://chainsnip.vercel.app"]
      : ["http://localhost:3000"],
})

export type Session = typeof auth.$Inferred.Session
export type User = typeof auth.$Inferred.User
