import "server-only"
import { createHash } from "node:crypto"
import { headers } from "next/headers"
import { execute, queryOne } from "./db"
import { sendEmail } from "./email"

const TOKEN_TTL_HOURS = 24
const RESEND_COOLDOWN_SECONDS = 60
const PRODUCTION_ORIGIN = "https://chainsnip.com"

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

// Production links use a fixed origin so a spoofed Host header can't redirect tokens elsewhere.
async function appOrigin(): Promise<string> {
  if (process.env.VERCEL_ENV === "production") return PRODUCTION_ORIGIN
  const h = await headers()
  const host = h.get("x-forwarded-host") || h.get("host")
  if (!host) return PRODUCTION_ORIGIN
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https")
  return `${proto}://${host}`
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

export async function canResendVerification(userId: string): Promise<boolean> {
  const recent = await queryOne<{ user_id: string }>(
    `SELECT user_id FROM email_verification_tokens
     WHERE user_id = $1 AND created_at > NOW() - make_interval(secs => $2)`,
    [userId, RESEND_COOLDOWN_SECONDS]
  )
  return !recent
}

export async function sendVerificationEmail(user: { id: string; email: string; name: string }): Promise<void> {
  const token = generateToken()
  await execute(`DELETE FROM email_verification_tokens WHERE user_id = $1`, [user.id])
  await execute(
    `INSERT INTO email_verification_tokens (token_hash, user_id, expires_at)
     VALUES ($1, $2, NOW() + make_interval(hours => $3))`,
    [hashToken(token), user.id, TOKEN_TTL_HOURS]
  )

  const url = `${await appOrigin()}/auth/verify?token=${token}`
  const name = user.name?.trim() || "there"

  await sendEmail({
    to: user.email,
    subject: "Confirm your ChainSnip email",
    text: `Hi ${name},\n\nConfirm your email to finish creating your ChainSnip account:\n${url}\n\nThis link expires in ${TOKEN_TTL_HOURS} hours. If you didn't sign up, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#111">
<p>Hi ${escapeHtml(name)},</p>
<p>Confirm your email to finish creating your ChainSnip account.</p>
<p><a href="${url}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px">Confirm email</a></p>
<p style="color:#555;font-size:13px">Or paste this link into your browser:<br>${url}</p>
<p style="color:#555;font-size:13px">This link expires in ${TOKEN_TTL_HOURS} hours. If you didn't sign up, you can ignore this email.</p>
</div>`,
  })
}

export async function consumeVerificationToken(token: string): Promise<string | null> {
  if (!/^[a-f0-9]{64}$/.test(token)) return null
  const row = await queryOne<{ user_id: string }>(
    `DELETE FROM email_verification_tokens
     WHERE token_hash = $1 AND expires_at > NOW()
     RETURNING user_id`,
    [hashToken(token)]
  )
  if (!row) return null

  const user = await queryOne<{ id: string }>(
    `UPDATE users SET email_verified_at = COALESCE(email_verified_at, NOW()), updated_at = NOW()
     WHERE id = $1 AND banned_at IS NULL
     RETURNING id`,
    [row.user_id]
  )
  await execute(`DELETE FROM email_verification_tokens WHERE user_id = $1`, [row.user_id])
  return user?.id ?? null
}
