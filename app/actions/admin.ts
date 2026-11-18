"use server"

import { revalidatePath } from "next/cache"
import { execute, queryOne } from "@/lib/db"
import { getAdminUser, isAdminEmail } from "@/lib/admin"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function banUser(userId: string, reason: string): Promise<{ success: boolean; error?: string }> {
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: "Not authorized" }
  if (!UUID_RE.test(userId)) return { success: false, error: "Invalid user" }
  if (userId === admin.id) return { success: false, error: "You can't ban yourself" }

  const target = await queryOne<{ email: string }>(`SELECT email FROM users WHERE id = $1`, [userId])
  if (!target) return { success: false, error: "User not found" }
  if (isAdminEmail(target.email)) return { success: false, error: "Admins can't be banned" }

  const cleanReason = String(reason ?? "").trim().slice(0, 500) || "Not a legitimate user"
  await execute(`UPDATE users SET banned_at = NOW(), ban_reason = $2, updated_at = NOW() WHERE id = $1`, [
    userId,
    cleanReason,
  ])
  await execute(`DELETE FROM sessions WHERE user_id = $1`, [userId])
  await execute(`DELETE FROM email_verification_tokens WHERE user_id = $1`, [userId])

  revalidatePath("/admin/users")
  return { success: true }
}

export async function unbanUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: "Not authorized" }
  if (!UUID_RE.test(userId)) return { success: false, error: "Invalid user" }

  await execute(`UPDATE users SET banned_at = NULL, ban_reason = NULL, updated_at = NOW() WHERE id = $1`, [userId])

  revalidatePath("/admin/users")
  return { success: true }
}
