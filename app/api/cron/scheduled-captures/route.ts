import { after, type NextRequest, NextResponse } from "next/server"
import {
  claimDueSchedules,
  isAuthorizedCron,
  listDueSchedules,
  prepareSnapshot,
} from "@/lib/scheduled-captures"

export const runtime = "nodejs"
export const maxDuration = 300

const BATCH_SIZE = 20

function cronHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    authorization: `Bearer ${process.env.CRON_SECRET}`,
    "content-type": "application/json",
  }
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  if (bypass) headers["x-vercel-protection-bypass"] = bypass
  return headers
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request.headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (request.nextUrl.searchParams.get("dryRun") === "1") {
    return NextResponse.json({ due: await listDueSchedules() })
  }

  const claimed = await claimDueSchedules(BATCH_SIZE)
  const prepared = await Promise.all(
    claimed.map(async (schedule) => ({ scheduleId: schedule.id, ...(await prepareSnapshot(schedule)) })),
  )

  // Each capture runs in its own invocation so one slow explorer cannot use up
  // the whole batch's time budget.
  const origin = request.nextUrl.origin
  const results = await Promise.all(
    prepared.map(async (item) => {
      if (item.status !== "queued") return item
      try {
        const response = await fetch(`${origin}/api/cron/scheduled-captures/run`, {
          method: "POST",
          headers: cronHeaders(),
          body: JSON.stringify({ snapshotId: item.snapshotId }),
          signal: AbortSignal.timeout(280_000),
        })
        const body = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string }
        return { ...item, captured: response.ok && body.ok === true, error: body.error }
      } catch (error) {
        return { ...item, captured: false, error: error instanceof Error ? error.message : "Worker request failed" }
      }
    }),
  )

  // A full batch means more schedules may be waiting; continue in a fresh invocation.
  if (claimed.length === BATCH_SIZE) {
    after(() =>
      fetch(`${origin}/api/cron/scheduled-captures`, {
        headers: cronHeaders(),
        signal: AbortSignal.timeout(10_000),
      }).catch((error) => console.error("[cron] Failed to continue scheduled captures:", error)),
    )
  }

  console.log("[cron] Scheduled captures:", JSON.stringify(results))
  return NextResponse.json({ processed: results.length, results })
}
