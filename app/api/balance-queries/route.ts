import { NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromSession } from "@/lib/auth"
import {
  MAX_IMPORT,
  deleteBalanceQuery,
  insertBalanceQuery,
  listBalanceQueries,
  parseImportedQuery,
} from "@/lib/balance-queries"

export const dynamic = "force-dynamic"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET() {
  const user = await getCurrentUserFromSession()
  if (!user) return NextResponse.json({ signedIn: false, queries: [] })

  const queries = await listBalanceQueries(user.id)
  return NextResponse.json({ signedIn: true, queries })
}

// Moves results a guest saved in the browser into their account after signing in.
export async function POST(request: NextRequest) {
  const user = await getCurrentUserFromSession()
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const items: unknown[] = Array.isArray(body?.queries) ? body.queries.slice(0, MAX_IMPORT) : []
  const parsed = items.map(parseImportedQuery).filter((q) => q !== null)

  // Insert oldest first so the earliest spelling of each client name becomes the canonical one.
  parsed.sort((a, b) => a.queriedAt.localeCompare(b.queriedAt))
  for (const query of parsed) {
    await insertBalanceQuery(user.id, query)
  }

  return NextResponse.json({ imported: parsed.length, skipped: items.length - parsed.length })
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUserFromSession()
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 })

  const id = request.nextUrl.searchParams.get("id")
  if (!id || !UUID.test(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  const deleted = await deleteBalanceQuery(user.id, id)
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ deleted: true })
}
