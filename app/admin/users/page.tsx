import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import Header from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BanUserButton } from "@/components/admin/ban-user-button"
import { getCurrentUserFromSession } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin"
import { queryMany } from "@/lib/db"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Users | ChainSnip Admin",
  robots: { index: false, follow: false },
}

interface AdminUserRow {
  id: string
  email: string
  name: string
  plan: string
  created_at: Date
  email_verified_at: Date | null
  banned_at: Date | null
  ban_reason: string | null
  last_login: Date | null
  same_ip_signups: number
}

interface FailedAttemptRow {
  email: string
  reason: string
  created_at: Date
}

const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })

function formatDate(value: Date | null) {
  return value ? `${dateFmt.format(new Date(value))} UTC` : "Never"
}

export default async function AdminUsersPage() {
  const user = await getCurrentUserFromSession()
  if (!user) redirect("/auth/login")
  if (!isAdminEmail(user.email)) notFound()

  const [users, failedAttempts] = await Promise.all([
    queryMany<AdminUserRow>(
      `SELECT u.id, u.email, u.name, u.plan, u.created_at, u.email_verified_at, u.banned_at, u.ban_reason,
              (SELECT MAX(s.created_at) FROM sessions s WHERE s.user_id = u.id) AS last_login,
              (SELECT COUNT(*)::int FROM signup_attempts a
                 WHERE a.succeeded AND a.ip_hash IN (
                   SELECT b.ip_hash FROM signup_attempts b WHERE b.succeeded AND b.email = u.email
                 )) AS same_ip_signups
       FROM users u
       ORDER BY u.created_at DESC`
    ),
    queryMany<FailedAttemptRow>(
      `SELECT email, reason, created_at FROM signup_attempts
       WHERE NOT succeeded
       ORDER BY created_at DESC
       LIMIT 50`
    ),
  ])

  const bannedCount = users.filter((u) => u.banned_at).length
  const unverifiedCount = users.filter((u) => !u.email_verified_at && !u.banned_at).length

  return (
    <>
      <Header />
      <main className="container mx-auto flex flex-col gap-16 px-4 pb-16 pt-24">
        <section aria-labelledby="users-heading" className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 id="users-heading" className="text-2xl font-semibold tracking-tight">
              Users
            </h1>
            <p className="text-sm text-muted-foreground">
              {`${users.length} accounts · ${unverifiedCount} unconfirmed · ${bannedCount} banned. Banning signs the user out everywhere and blocks future logins.`}
            </p>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signed up</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead className="text-right">Same-IP signups</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{u.name || "(no name)"}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{u.plan}</TableCell>
                    <TableCell>
                      {u.banned_at ? (
                        <div className="flex flex-col gap-1">
                          <Badge variant="destructive" className="w-fit">
                            Banned
                          </Badge>
                          {u.ban_reason ? <span className="text-xs text-muted-foreground">{u.ban_reason}</span> : null}
                        </div>
                      ) : u.email_verified_at ? (
                        <Badge variant="secondary">Confirmed</Badge>
                      ) : (
                        <Badge variant="outline">Unconfirmed</Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{formatDate(u.created_at)}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{formatDate(u.last_login)}</TableCell>
                    <TableCell className="text-right tabular-nums">{u.same_ip_signups || "—"}</TableCell>
                    <TableCell className="text-right">
                      {u.id === user.id || isAdminEmail(u.email) ? (
                        <span className="text-xs text-muted-foreground">Admin</span>
                      ) : (
                        <BanUserButton userId={u.id} email={u.email} banned={Boolean(u.banned_at)} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section aria-labelledby="failed-heading" className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 id="failed-heading" className="text-xl font-semibold tracking-tight">
              Recent failed signups
            </h2>
            <p className="text-sm text-muted-foreground">The last 50 rejected attempts and why they were rejected.</p>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failedAttempts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-sm text-muted-foreground">
                      No failed attempts.
                    </TableCell>
                  </TableRow>
                ) : (
                  failedAttempts.map((a, i) => (
                    <TableRow key={`${a.email}-${i}`}>
                      <TableCell className="text-sm">{a.email}</TableCell>
                      <TableCell>
                        <code className="text-xs">{a.reason}</code>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{formatDate(a.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>
    </>
  )
}
