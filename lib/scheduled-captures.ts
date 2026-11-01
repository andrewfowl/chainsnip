import "server-only"
import { getArchiveById, getArchiveCount, saveArchive, updateArchive } from "@/lib/archives"
import { runCapture } from "@/lib/capture"
import { getMonthEndDate, PLAN_LIMITS, SCHEDULED_CAPTURE_HOUR_UTC } from "@/lib/chains"
import { queryMany } from "@/lib/db"

/** Schedules within this window of their target time are run now, so a cron firing shortly before 23:00 UTC still catches them. */
const LEAD_WINDOW = "2 hours"

type Plan = keyof typeof PLAN_LIMITS

interface ClaimedSchedule {
  id: string
  user_id: string
  url: string
  title: string
  client_name: string | null
  due_at: string
  plan: Plan
}

export function isAuthorizedCron(headers: Headers): boolean {
  const secret = process.env.CRON_SECRET
  return Boolean(secret) && headers.get("authorization") === `Bearer ${secret}`
}

/**
 * Atomically takes due monthly schedules and advances each one to its next
 * month-end, so overlapping cron runs can never capture the same month twice.
 */
export async function claimDueSchedules(limit: number): Promise<ClaimedSchedule[]> {
  return queryMany<ClaimedSchedule>(
    `WITH due AS (
       SELECT a.id, a.next_scheduled_save AS due_at, u.plan
       FROM archives a
       JOIN users u ON u.id = a.user_id
       WHERE a.schedule_interval = 'monthly'
         AND a.next_scheduled_save IS NOT NULL
         AND a.next_scheduled_save <= NOW() + INTERVAL '${LEAD_WINDOW}'
       ORDER BY a.next_scheduled_save
       LIMIT $1
       FOR UPDATE OF a SKIP LOCKED
     ),
     bounds AS (
       SELECT date_trunc('month', NOW() AT TIME ZONE 'UTC') AS month_start
     )
     UPDATE archives a
     SET next_scheduled_save = CASE
           WHEN ((b.month_start + INTERVAL '1 month' - INTERVAL '1 day' + INTERVAL '${SCHEDULED_CAPTURE_HOUR_UTC} hours') AT TIME ZONE 'UTC')
                > NOW() + INTERVAL '${LEAD_WINDOW}'
             THEN (b.month_start + INTERVAL '1 month' - INTERVAL '1 day' + INTERVAL '${SCHEDULED_CAPTURE_HOUR_UTC} hours') AT TIME ZONE 'UTC'
           ELSE (b.month_start + INTERVAL '2 months' - INTERVAL '1 day' + INTERVAL '${SCHEDULED_CAPTURE_HOUR_UTC} hours') AT TIME ZONE 'UTC'
         END,
         last_updated = NOW()
     FROM due, bounds b
     WHERE a.id = due.id
     RETURNING a.id, a.user_id, a.url, a.title, a.client_name, due.due_at, due.plan`,
    [limit],
  )
}

export async function listDueSchedules(): Promise<Pick<ClaimedSchedule, "id" | "url" | "due_at" | "plan">[]> {
  return queryMany(
    `SELECT a.id, a.url, a.next_scheduled_save AS due_at, u.plan
     FROM archives a JOIN users u ON u.id = a.user_id
     WHERE a.schedule_interval = 'monthly'
       AND a.next_scheduled_save IS NOT NULL
       AND a.next_scheduled_save <= NOW() + INTERVAL '${LEAD_WINDOW}'
     ORDER BY a.next_scheduled_save`,
  )
}

export type PrepareResult =
  | { status: "queued"; snapshotId: string }
  | { status: "skipped"; reason: string }

/** Creates the month's snapshot row for a claimed schedule, enforcing the owner's current plan. */
export async function prepareSnapshot(schedule: ClaimedSchedule): Promise<PrepareResult> {
  const limits = PLAN_LIMITS[schedule.plan] ?? PLAN_LIMITS.free
  if (!limits.monthlyAutoSave) {
    return { status: "skipped", reason: `plan "${schedule.plan}" does not include monthly captures` }
  }
  if ((await getArchiveCount(schedule.user_id)) >= limits.maxSnapshots) {
    return { status: "skipped", reason: "snapshot limit reached" }
  }

  const dueAt = new Date(schedule.due_at)
  const monthEnd = getMonthEndDate(dueAt)
  const monthLabel = monthEnd.toISOString().slice(0, 10)
  const lateNote =
    Date.now() - dueAt.getTime() > 6 * 60 * 60 * 1000
      ? ` Executed late on ${new Date().toISOString()}; the explorer shows the balance at capture time.`
      : ""

  const snapshot = await saveArchive({
    userId: schedule.user_id,
    url: schedule.url,
    title: `${schedule.title} (${monthLabel})`,
    content: `Scheduled month-end capture for ${monthLabel} from ${schedule.url}.${lateNote}`,
    snapshotDate: monthEnd.toISOString(),
    scheduleInterval: null,
    clientName: schedule.client_name ?? undefined,
  })

  return { status: "queued", snapshotId: snapshot.id }
}

/** Captures one snapshot row and records the outcome on it. */
export async function captureSnapshot(snapshotId: string): Promise<{ ok: boolean; error?: string }> {
  const snapshot = await getArchiveById(snapshotId)
  if (!snapshot) return { ok: false, error: "Snapshot not found" }
  if (snapshot.captureStatus === "completed") return { ok: true }

  await updateArchive(snapshotId, { captureStatus: "capturing", captureError: null })

  const result = await runCapture({
    url: snapshot.url,
    archiveId: snapshot.id,
    userFolder: snapshot.userId,
    timezone: "UTC",
  })

  if (!result.ok) {
    await updateArchive(snapshotId, { captureStatus: "failed", captureError: result.error })
    return { ok: false, error: result.error }
  }

  await updateArchive(snapshotId, {
    screenshotUrl: result.screenshotUrl ?? undefined,
    htmlUrl: result.htmlUrl ?? undefined,
    proofHash: result.proofHash,
    captureStatus: "completed",
    captureError: null,
  })
  return { ok: true }
}
