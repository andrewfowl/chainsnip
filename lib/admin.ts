import "server-only"
import { getCurrentUserFromSession, type User } from "./auth"

export function isAdminEmail(email: string): boolean {
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return admins.includes(email.toLowerCase())
}

export async function getAdminUser(): Promise<User | null> {
  const user = await getCurrentUserFromSession()
  if (!user || !isAdminEmail(user.email)) return null
  return user
}
