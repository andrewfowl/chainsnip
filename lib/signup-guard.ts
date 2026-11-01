import { resolveMx } from "node:dns/promises"
import { createHash } from "node:crypto"
import { headers } from "next/headers"
import disposableDomains from "disposable-email-domains/index.json"
import disposableWildcards from "disposable-email-domains/wildcard.json"
import { queryOne, execute } from "./db"

const DISPOSABLE = new Set<string>(disposableDomains as string[])
const DISPOSABLE_WILDCARDS = disposableWildcards as string[]

const MAX_ATTEMPTS_PER_HOUR = 10
const MAX_ACCOUNTS_PER_DAY = 3
const MX_TIMEOUT_MS = 3000

export type GuardResult = { ok: true } | { ok: false; error: string }

function emailDomain(email: string): string {
  return email.slice(email.lastIndexOf("@") + 1).toLowerCase()
}

function isDisposable(domain: string): boolean {
  if (DISPOSABLE.has(domain)) return true
  return DISPOSABLE_WILDCARDS.some((base) => domain === base || domain.endsWith(`.${base}`))
}

// Fails open on timeouts or resolver errors so a DNS hiccup never blocks a real user;
// only a definitive "no such domain / no mail records" answer rejects.
async function domainAcceptsMail(domain: string): Promise<boolean> {
  try {
    const records = await Promise.race([
      resolveMx(domain),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), MX_TIMEOUT_MS)),
    ])
    if (records === null) return true
    return records.some((r) => r.exchange && r.exchange !== ".")
  } catch (error: any) {
    return !["ENOTFOUND", "ENODATA"].includes(error?.code)
  }
}

export async function checkEmailDeliverable(email: string): Promise<GuardResult> {
  const domain = emailDomain(email)
  if (isDisposable(domain)) {
    return { ok: false, error: "Disposable email addresses aren't allowed. Please use a permanent email." }
  }
  if (!(await domainAcceptsMail(domain))) {
    return { ok: false, error: "That email domain can't receive mail. Please check the address." }
  }
  return { ok: true }
}

async function clientIpHash(): Promise<string> {
  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown"
  return createHash("sha256").update(`${process.env.CRON_SECRET ?? ""}:${ip}`).digest("hex")
}

export async function checkSignupRateLimit(): Promise<GuardResult & { ipHash: string }> {
  const ipHash = await clientIpHash()
  const row = await queryOne<{ attempts: string; accounts: string }>(
    `SELECT
       count(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') AS attempts,
       count(*) FILTER (WHERE succeeded AND created_at > NOW() - INTERVAL '1 day') AS accounts
     FROM signup_attempts WHERE ip_hash = $1`,
    [ipHash]
  )
  if (Number(row?.attempts ?? 0) >= MAX_ATTEMPTS_PER_HOUR || Number(row?.accounts ?? 0) >= MAX_ACCOUNTS_PER_DAY) {
    return { ok: false, error: "Too many sign-up attempts from your network. Please try again later.", ipHash }
  }
  return { ok: true, ipHash }
}

export async function recordSignupAttempt(ipHash: string, succeeded: boolean): Promise<void> {
  await execute(`INSERT INTO signup_attempts (ip_hash, succeeded) VALUES ($1, $2)`, [ipHash, succeeded])
}
