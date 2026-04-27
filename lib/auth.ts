import { betterAuth } from "better-auth"
import { Pool } from "@neondatabase/serverless"

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })

export const auth = betterAuth({
  database: {
    type: "postgres",
    pool,
  },
  appName: "ChainSnip",
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins:
    process.env.NODE_ENV === "production"
      ? ["https://chainsnip.vercel.app"]
      : ["http://localhost:3000"],
})

export type Session = typeof auth.$Inferred.Session
export type User = typeof auth.$Inferred.User
