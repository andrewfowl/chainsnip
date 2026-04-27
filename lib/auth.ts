import { betterAuth } from "better-auth"

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    connectionString: process.env.DATABASE_URL!,
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
