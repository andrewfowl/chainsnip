import { queryOne, queryMany, execute, isDatabaseConfigured, getDatabaseErrorMessage } from "./db"
import {
  detectChainFromUrl,
  extractWalletAddress,
  getNextMonthEnd,
  SUPPORTED_EXPLORERS,
  type Archive,
  type CustomExplorer,
  type UsageStats,
} from "./chains"

// Re-export client-safe types and pure helpers for backwards compatibility.
export * from "./chains"

// Database row types (snake_case from DB)
interface DbArchive {
  id: string
  user_id: string
  url: string
  wallet_address: string | null
  chain: string | null
  explorer: string | null
  title: string | null
  content: string | null
  client_name: string | null
  thumbnail: string | null
  screenshot_url: string | null
  html_url: string | null
  proof_hash: string | null
  capture_status: string
  capture_error: string | null
  archived_at: string
  snapshot_date: string | null
  last_updated: string
  schedule_interval: string | null
  next_scheduled_save: string | null
  status: string
}

function mapDbArchiveToArchive(db: DbArchive): Archive {
  // Extract wallet address from URL if not stored
  const extractedWallet = db.wallet_address || extractWalletAddressFromUrl(db.url)
  
  // Detect chain/explorer from URL if not stored
  const detected = detectChainFromUrl(db.url)
  
  return {
    id: db.id,
    userId: db.user_id,
    url: db.url,
    walletAddress: extractedWallet || "Unknown wallet",
    chain: db.chain || detected.chain || "Unknown chain",
    explorer: db.explorer || detected.explorer || "Custom explorer",
    title: db.title || `Snapshot from ${new URL(db.url).hostname}`,
    content: db.content || "",
    clientName: db.client_name || undefined, // Keep undefined for "no client" vs empty string
    thumbnail: db.thumbnail || undefined,
    screenshotUrl: db.screenshot_url || undefined,
    htmlUrl: db.html_url || undefined,
    proofHash: db.proof_hash || undefined,
    captureStatus: (db.capture_status || "pending") as Archive["captureStatus"],
    captureError: db.capture_error || undefined,
    archivedAt: db.archived_at || new Date().toISOString(),
    snapshotDate: db.snapshot_date || db.archived_at || new Date().toISOString(),
    lastUpdated: db.last_updated || new Date().toISOString(),
    scheduleInterval: db.schedule_interval as Archive["scheduleInterval"],
    nextScheduledSave: db.next_scheduled_save || undefined,
    status: (db.status || "active") as Archive["status"],
  }
}

// Helper to extract wallet address from explorer URL
function extractWalletAddressFromUrl(url: string): string | null {
  if (!url) return null
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    // Common patterns: /address/0x..., /account/0x..., /token/0x..., etc.
    const patterns = [
      /\/address\/(0x[a-fA-F0-9]{40})/i,
      /\/account\/(0x[a-fA-F0-9]{40})/i,
      /\/token\/(0x[a-fA-F0-9]{40})/i,
      /\/(0x[a-fA-F0-9]{40})/i,
      // Solana addresses (base58, 32-44 chars)
      /\/address\/([1-9A-HJ-NP-Za-km-z]{32,44})/,
      /\/account\/([1-9A-HJ-NP-Za-km-z]{32,44})/,
    ]
    
    for (const pattern of patterns) {
      const match = pathname.match(pattern)
      if (match) return match[1]
    }
    
    return null
  } catch {
    return null
  }
}

export async function getArchives(userId: string): Promise<Archive[]> {
  console.log("[v0] getArchives - Starting for userId:", userId)
  try {
    const rows = await queryMany<DbArchive>(`SELECT * FROM archives WHERE user_id = $1 ORDER BY archived_at DESC`, [
      userId,
    ])
    console.log("[v0] getArchives - Retrieved", rows.length, "archives from database")
    
    if (rows.length === 0) {
      console.log("[v0] getArchives - No archives found for user (this is normal for new users)")
    } else {
      console.log("[v0] getArchives - First archive ID:", rows[0].id, "URL:", rows[0].url?.slice(0, 50))
    }
    
    const mapped = rows.map(mapDbArchiveToArchive)
    console.log("[v0] getArchives - Successfully mapped", mapped.length, "archives")
    return mapped
  } catch (error) {
    console.error("[v0] getArchives - DATABASE ERROR:")
    console.error("[v0] getArchives - Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[v0] getArchives - Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] getArchives - Error code:", (error as { code?: string })?.code || "N/A")
    console.error("[v0] getArchives - This may indicate: missing 'archives' table, connection issue, or malformed data")
    // Return empty array but log the error clearly
    return []
  }
}

export async function getArchiveById(id: string): Promise<Archive | null> {
  try {
    const row = await queryOne<DbArchive>(`SELECT * FROM archives WHERE id = $1`, [id])
    return row ? mapDbArchiveToArchive(row) : null
  } catch (error) {
    console.error("Error fetching archive:", error)
    return null
  }
}

export async function saveArchive(
  archive: Omit<
    Archive,
    "id" | "archivedAt" | "lastUpdated" | "status" | "chain" | "explorer" | "walletAddress" | "captureStatus"
  >,
): Promise<Archive> {
  // Check database configuration first
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured. Please ensure DATABASE_URL or PGHOST/PGUSER/PGPASSWORD/PGDATABASE environment variables are set in production.")
  }

  const { chain, explorer } = detectChainFromUrl(archive.url)
  const walletAddress = extractWalletAddress(archive.url)
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  let nextScheduledSave: string | null = null
  if (archive.scheduleInterval === "monthly") {
    nextScheduledSave = getNextMonthEnd().toISOString()
  }

  try {
    await execute(
      `INSERT INTO archives (
        id, user_id, url, wallet_address, chain, explorer, title, content, 
        client_name, snapshot_date, schedule_interval, next_scheduled_save,
        capture_status, status, archived_at, last_updated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending', 'active', $13, $13)`,
      [
        id,
        archive.userId,
        archive.url,
        walletAddress,
        chain,
        explorer,
        archive.title,
        archive.content,
        archive.clientName || null,
        archive.snapshotDate,
        archive.scheduleInterval || null,
        nextScheduledSave,
        now,
      ],
    )

    // Increment capture count
    await incrementCaptureCount(archive.userId)

    return {
      id,
      userId: archive.userId,
      url: archive.url,
      walletAddress,
      chain,
      explorer,
      title: archive.title,
      content: archive.content,
      clientName: archive.clientName,
      snapshotDate: archive.snapshotDate,
      scheduleInterval: archive.scheduleInterval,
      nextScheduledSave: nextScheduledSave || undefined,
      captureStatus: "pending",
      status: "active",
      archivedAt: now,
      lastUpdated: now,
    }
  } catch (error) {
    console.error("Error saving archive:", error)
    throw new Error(getDatabaseErrorMessage(error))
  }
}

export async function updateArchive(id: string, updates: Partial<Archive>): Promise<void> {
  try {
    const setClauses: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    // Map camelCase to snake_case for DB
    const fieldMap: Record<string, string> = {
      screenshotUrl: "screenshot_url",
      htmlUrl: "html_url",
      proofHash: "proof_hash",
      captureStatus: "capture_status",
      captureError: "capture_error",
      status: "status",
      clientName: "client_name",
      title: "title",
      content: "content",
    }

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (key in updates) {
        setClauses.push(`${dbField} = $${paramIndex}`)
        values.push((updates as Record<string, unknown>)[key])
        paramIndex++
      }
    }

    if (setClauses.length === 0) return

    setClauses.push(`last_updated = NOW()`)
    values.push(id)

    await execute(`UPDATE archives SET ${setClauses.join(", ")} WHERE id = $${paramIndex}`, values)
  } catch (error) {
    console.error("Error updating archive:", error)
    throw error
  }
}

export async function deleteArchive(id: string): Promise<void> {
  try {
    await execute(`DELETE FROM archives WHERE id = $1`, [id])
  } catch (error) {
    console.error("Error deleting archive:", error)
    throw error
  }
}

export async function getArchiveCount(userId: string): Promise<number> {
  try {
    const result = await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM archives WHERE user_id = $1`, [
      userId,
    ])
    return Number.parseInt(result?.count || "0", 10)
  } catch (error) {
    console.error("Error counting archives:", error)
    return 0
  }
}

// Custom Explorers
interface DbCustomExplorer {
  id: string
  user_id: string
  name: string
  domain: string
}

export async function getCustomExplorers(userId: string): Promise<CustomExplorer[]> {
  console.log("[v0] getCustomExplorers - Starting for userId:", userId)
  try {
    const rows = await queryMany<DbCustomExplorer>(
      `SELECT * FROM custom_explorers WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    )
    console.log("[v0] getCustomExplorers - Retrieved", rows.length, "custom explorers")
    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      domain: row.domain,
    }))
  } catch (error) {
    console.error("[v0] getCustomExplorers - DATABASE ERROR:")
    console.error("[v0] getCustomExplorers - Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[v0] getCustomExplorers - Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] getCustomExplorers - This may indicate: missing 'custom_explorers' table or connection issue")
    return []
  }
}

export async function saveCustomExplorer(explorer: Omit<CustomExplorer, "id">): Promise<CustomExplorer> {
  const id = crypto.randomUUID()

  try {
    await execute(`INSERT INTO custom_explorers (id, user_id, name, domain) VALUES ($1, $2, $3, $4)`, [
      id,
      explorer.userId,
      explorer.name,
      explorer.domain,
    ])

    return { id, ...explorer }
  } catch (error) {
    console.error("Error saving custom explorer:", error)
    throw error
  }
}

export async function deleteCustomExplorer(id: string): Promise<void> {
  try {
    await execute(`DELETE FROM custom_explorers WHERE id = $1`, [id])
  } catch (error) {
    console.error("Error deleting custom explorer:", error)
    throw error
  }
}

// Usage Stats
export async function getUserUsageStats(userId: string): Promise<UsageStats> {
  console.log("[v0] getUserUsageStats - Starting for userId:", userId)
  try {
    const stats = await queryOne<{ user_id: string; total_captures_ever: number; last_reset_date: string | null }>(
      `SELECT * FROM usage_stats WHERE user_id = $1`,
      [userId],
    )

    if (!stats) {
      console.log("[v0] getUserUsageStats - No stats found for user (returning defaults)")
      return { userId, totalCapturesEver: 0 }
    }

    console.log("[v0] getUserUsageStats - Found stats: totalCapturesEver =", stats.total_captures_ever)
    return {
      userId: stats.user_id,
      totalCapturesEver: stats.total_captures_ever,
      lastResetDate: stats.last_reset_date || undefined,
    }
  } catch (error) {
    console.error("[v0] getUserUsageStats - DATABASE ERROR:")
    console.error("[v0] getUserUsageStats - Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[v0] getUserUsageStats - Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] getUserUsageStats - This may indicate: missing 'usage_stats' table or connection issue")
    return { userId, totalCapturesEver: 0 }
  }
}

async function incrementCaptureCount(userId: string): Promise<void> {
  try {
    await execute(
      `INSERT INTO usage_stats (user_id, total_captures_ever, updated_at) 
       VALUES ($1, 1, NOW()) 
       ON CONFLICT (user_id) 
       DO UPDATE SET total_captures_ever = usage_stats.total_captures_ever + 1, updated_at = NOW()`,
      [userId],
    )
  } catch (error) {
    console.error("Error incrementing capture count:", error)
  }
}


export async function getAllExplorers(userId?: string) {
  const customExplorers = userId ? await getCustomExplorers(userId) : []
  const custom = customExplorers.map((c) => ({
    name: c.name,
    chain: c.domain,
    url: c.domain,
    isCustom: true,
  }))
  return [...SUPPORTED_EXPLORERS.map((e) => ({ ...e, isCustom: false })), ...custom]
}
