import { queryOne, queryMany, execute, isDatabaseConfigured, getDatabaseErrorMessage } from "./db"

// Archive management utilities for blockchain explorer snapshots
export interface Archive {
  id: string
  userId: string
  url: string
  walletAddress: string
  chain: string
  explorer: string
  title: string
  content: string
  clientName?: string
  thumbnail?: string
  screenshotUrl?: string
  htmlUrl?: string
  proofHash?: string
  captureStatus: "pending" | "capturing" | "completed" | "failed"
  captureError?: string
  archivedAt: string
  snapshotDate: string
  lastUpdated: string
  scheduleInterval?: "monthly" | null
  nextScheduledSave?: string
  status: "active" | "failed" | "pending"
}

export interface CustomExplorer {
  id: string
  userId: string
  name: string
  domain: string
}

export interface UsageStats {
  userId: string
  totalCapturesEver: number
  lastResetDate?: string
}

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

// Chain detection functions (unchanged - these don't need DB)
export function detectChainFromUrl(url: string): { chain: string; explorer: string } {
  const urlLower = url.toLowerCase()

  // EVM chains
  if (urlLower.includes("etherscan.io")) return { chain: "Ethereum", explorer: "Etherscan" }
  if (urlLower.includes("bscscan.com")) return { chain: "BNB Chain", explorer: "BscScan" }
  if (urlLower.includes("polygonscan.com")) return { chain: "Polygon", explorer: "PolygonScan" }
  if (urlLower.includes("arbiscan.io")) return { chain: "Arbitrum", explorer: "Arbiscan" }
  if (urlLower.includes("optimistic.etherscan.io")) return { chain: "Optimism", explorer: "Optimism Explorer" }
  if (urlLower.includes("snowtrace.io")) return { chain: "Avalanche", explorer: "Snowtrace" }
  if (urlLower.includes("ftmscan.com")) return { chain: "Fantom", explorer: "FTMScan" }
  if (urlLower.includes("basescan.org")) return { chain: "Base", explorer: "BaseScan" }
  if (urlLower.includes("lineascan.build")) return { chain: "Linea", explorer: "LineaScan" }
  if (urlLower.includes("zksync.blockscout.com") || urlLower.includes("era.zksync.network"))
    return { chain: "zkSync Era", explorer: "zkSync Explorer" }

  if (urlLower.includes("monadexplorer.com") || urlLower.includes("monadvision.com")) {
    return { chain: "Monad", explorer: "MonadVision" }
  }

  if (urlLower.includes("mintscan.io")) {
    const match = url.match(/mintscan\.io\/([^/]+)/i)
    if (match) {
      const chainSlug = match[1].toLowerCase()
      const cosmosChains: Record<string, string> = {
        cosmos: "Cosmos Hub",
        osmosis: "Osmosis",
        celestia: "Celestia",
        injective: "Injective",
        sei: "Sei",
        dydx: "dYdX",
        stargaze: "Stargaze",
        akash: "Akash",
        juno: "Juno",
        evmos: "Evmos",
        kava: "Kava",
        stride: "Stride",
        axelar: "Axelar",
        neutron: "Neutron",
        noble: "Noble",
        persistence: "Persistence",
        secret: "Secret Network",
        terra: "Terra",
        umee: "Umee",
        crescent: "Crescent",
        agoric: "Agoric",
        fetchai: "Fetch.ai",
        sommelier: "Sommelier",
        regen: "Regen",
        band: "Band Protocol",
        chihuahua: "Chihuahua",
        comdex: "Comdex",
        migaloo: "Migaloo",
        quicksilver: "Quicksilver",
        mars: "Mars Protocol",
      }
      const chainName = cosmosChains[chainSlug] || chainSlug.charAt(0).toUpperCase() + chainSlug.slice(1)
      return { chain: chainName, explorer: "Mintscan" }
    }
    return { chain: "Cosmos", explorer: "Mintscan" }
  }

  // Hedera
  if (urlLower.includes("hashscan.io") || urlLower.includes("hedera.com")) {
    return { chain: "Hedera", explorer: "HashScan" }
  }
  if (urlLower.includes("hederaexplorer.io")) {
    return { chain: "Hedera", explorer: "Hedera Explorer" }
  }

  if (urlLower.includes("xrpscan.com")) return { chain: "XRP Ledger", explorer: "XRPScan" }
  if (urlLower.includes("bithomp.com")) return { chain: "XRP Ledger", explorer: "Bithomp" }
  if (urlLower.includes("livenet.xrpl.org") || urlLower.includes("xrpl.org"))
    return { chain: "XRP Ledger", explorer: "XRPL Explorer" }
  if (urlLower.includes("xrplorer.com")) return { chain: "XRP Ledger", explorer: "XRPlorer" }
  if (urlLower.includes("xrp.cafe")) return { chain: "XRP Ledger", explorer: "XRP Cafe" }
  if (urlLower.includes("onthedex.live")) return { chain: "XRP Ledger", explorer: "OnTheDex" }

  // Filecoin
  if (urlLower.includes("filfox.info")) return { chain: "Filecoin", explorer: "Filfox" }
  if (urlLower.includes("filscan.io")) return { chain: "Filecoin", explorer: "Filscan" }
  if (urlLower.includes("beryx.io") || urlLower.includes("beryx.zondax.ch")) {
    return { chain: "Filecoin", explorer: "Beryx" }
  }

  // Sui
  if (urlLower.includes("suiscan.xyz")) return { chain: "Sui", explorer: "Suiscan" }
  if (urlLower.includes("suivision.xyz")) return { chain: "Sui", explorer: "SuiVision" }
  if (urlLower.includes("suiexplorer.com") || urlLower.includes("explorer.sui.io"))
    return { chain: "Sui", explorer: "Sui Explorer" }

  // Other chains
  if (urlLower.includes("solscan.io")) return { chain: "Solana", explorer: "Solscan" }
  if (urlLower.includes("solana.fm")) return { chain: "Solana", explorer: "Solana FM" }
  if (urlLower.includes("explorer.solana.com")) return { chain: "Solana", explorer: "Solana Explorer" }
  if (urlLower.includes("blockchain.com")) return { chain: "Bitcoin", explorer: "Blockchain.com" }
  if (urlLower.includes("blockchair.com")) return { chain: "Multi-chain", explorer: "Blockchair" }
  if (urlLower.includes("mempool.space")) return { chain: "Bitcoin", explorer: "Mempool.space" }
  if (urlLower.includes("tronscan.org")) return { chain: "Tron", explorer: "TronScan" }
  if (urlLower.includes("nearblocks.io")) return { chain: "NEAR", explorer: "NearBlocks" }
  if (urlLower.includes("cardanoscan.io")) return { chain: "Cardano", explorer: "CardanoScan" }
  if (urlLower.includes("avascan.info")) return { chain: "Avalanche", explorer: "Avascan" }
  if (urlLower.includes("subscan.io")) return { chain: "Polkadot/Substrate", explorer: "Subscan" }
  if (urlLower.includes("algoexplorer.io")) return { chain: "Algorand", explorer: "AlgoExplorer" }

  return { chain: "Unknown", explorer: "Unknown Explorer" }
}

export function extractWalletAddress(url: string): string {
  const patterns = [
    // EVM addresses
    /address\/(0x[a-fA-F0-9]{40})/i,
    /token\/(0x[a-fA-F0-9]{40})/i,
    // Solana addresses
    /account\/([1-9A-HJ-NP-Za-km-z]{32,44})/i,
    /address\/([1-9A-HJ-NP-Za-km-z]{32,44})/i,
    // Bitcoin addresses
    /address\/([13][a-km-zA-HJ-NP-Z1-9]{25,34})/i,
    /address\/(bc1[a-z0-9]{39,59})/i,
    // Cosmos ecosystem addresses
    /account\/(cosmos[a-z0-9]{39,59})/i,
    /account\/(osmo[a-z0-9]{39,59})/i,
    /account\/(inj[a-z0-9]{39,59})/i,
    /account\/(sei[a-z0-9]{39,59})/i,
    /account\/(celestia[a-z0-9]{39,59})/i,
    /account\/(dydx[a-z0-9]{39,59})/i,
    /account\/(stars[a-z0-9]{39,59})/i,
    /account\/(akash[a-z0-9]{39,59})/i,
    /account\/(juno[a-z0-9]{39,59})/i,
    /account\/(evmos[a-z0-9]{39,59})/i,
    /account\/(kava[a-z0-9]{39,59})/i,
    /account\/(stride[a-z0-9]{39,59})/i,
    /account\/(axelar[a-z0-9]{39,59})/i,
    /account\/(neutron[a-z0-9]{39,59})/i,
    /account\/([a-z]+1[a-z0-9]{38,58})/i,
    // Hedera
    /account\/(0\.0\.\d+)/i,
    /address\/(0\.0\.\d+)/i,
    // XRP/Ripple
    /account\/(r[1-9A-HJ-NP-Za-km-z]{24,34})/i,
    /address\/(r[1-9A-HJ-NP-Za-km-z]{24,34})/i,
    /explorer\/(r[1-9A-HJ-NP-Za-km-z]{24,34})/i,
    // Filecoin
    /address\/(f[0-4][a-z0-9]+)/i,
    /account\/(f[0-4][a-z0-9]+)/i,
    // Tron
    /address\/(T[a-zA-Z0-9]{33})/i,
    // NEAR
    /address\/([a-z0-9._-]+\.near)/i,
    /account\/([a-z0-9._-]+\.near)/i,
    // Cardano
    /address\/(addr1[a-z0-9]+)/i,
    // Algorand
    /address\/([A-Z2-7]{58})/i,
    /\/address\/([a-zA-Z0-9]{20,})/i,
    /\/account\/([a-zA-Z0-9]{20,})/i,
    /\/wallet\/([a-zA-Z0-9]{20,})/i,
    // Sui addresses
    /account\/(0x[a-fA-F0-9]{64})/i,
    /address\/(0x[a-fA-F0-9]{64})/i,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1] || match[0]
  }

  return "Unknown"
}

export function getMonthEndDate(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function getNextMonthEnd(): Date {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0)
  return nextMonth
}

export const PLAN_LIMITS = {
  free: { maxWallets: 3, maxSnapshots: 10, monthlyAutoSave: false },
  pro: { maxWallets: 25, maxSnapshots: 300, monthlyAutoSave: true },
  enterprise: { maxWallets: Number.POSITIVE_INFINITY, maxSnapshots: Number.POSITIVE_INFINITY, monthlyAutoSave: true },
  lifetime: { maxWallets: 25, maxSnapshots: 300, monthlyAutoSave: true },
}

export const SUPPORTED_EXPLORERS = [
  // EVM Chains
  { name: "Etherscan", chain: "Ethereum", url: "etherscan.io" },
  { name: "BscScan", chain: "BNB Chain", url: "bscscan.com" },
  { name: "PolygonScan", chain: "Polygon", url: "polygonscan.com" },
  { name: "Arbiscan", chain: "Arbitrum", url: "arbiscan.io" },
  { name: "BaseScan", chain: "Base", url: "basescan.org" },
  { name: "Snowtrace", chain: "Avalanche", url: "snowtrace.io" },
  { name: "LineaScan", chain: "Linea", url: "lineascan.build" },
  { name: "zkSync Explorer", chain: "zkSync Era", url: "era.zksync.network" },
  // Monad
  { name: "MonadVision", chain: "Monad", url: "monadvision.com" },
  { name: "Monad Explorer", chain: "Monad", url: "monadexplorer.com" },
  // Solana
  { name: "Solscan", chain: "Solana", url: "solscan.io" },
  { name: "Solana FM", chain: "Solana", url: "solana.fm" },
  { name: "Solana Explorer", chain: "Solana", url: "explorer.solana.com" },
  // Bitcoin
  { name: "Blockchain.com", chain: "Bitcoin", url: "blockchain.com" },
  { name: "Mempool.space", chain: "Bitcoin", url: "mempool.space" },
  // Cosmos Ecosystem (Mintscan)
  { name: "Mintscan", chain: "Cosmos Hub", url: "mintscan.io/cosmos" },
  { name: "Mintscan", chain: "Osmosis", url: "mintscan.io/osmosis" },
  { name: "Mintscan", chain: "Celestia", url: "mintscan.io/celestia" },
  { name: "Mintscan", chain: "Injective", url: "mintscan.io/injective" },
  { name: "Mintscan", chain: "Sei", url: "mintscan.io/sei" },
  { name: "Mintscan", chain: "dYdX", url: "mintscan.io/dydx" },
  { name: "Mintscan", chain: "Stargaze", url: "mintscan.io/stargaze" },
  { name: "Mintscan", chain: "Akash", url: "mintscan.io/akash" },
  { name: "Mintscan", chain: "Juno", url: "mintscan.io/juno" },
  { name: "Mintscan", chain: "Evmos", url: "mintscan.io/evmos" },
  { name: "Mintscan", chain: "Kava", url: "mintscan.io/kava" },
  { name: "Mintscan", chain: "Stride", url: "mintscan.io/stride" },
  { name: "Mintscan", chain: "Axelar", url: "mintscan.io/axelar" },
  { name: "Mintscan", chain: "Neutron", url: "mintscan.io/neutron" },
  { name: "Mintscan", chain: "Noble", url: "mintscan.io/noble" },
  { name: "Mintscan", chain: "Secret Network", url: "mintscan.io/secret" },
  { name: "Mintscan", chain: "Fetch.ai", url: "mintscan.io/fetchai" },
  // Hedera
  { name: "HashScan", chain: "Hedera", url: "hashscan.io" },
  { name: "Hedera Explorer", chain: "Hedera", url: "hederaexplorer.io" },
  // XRP/Ripple
  { name: "XRPScan", chain: "XRP Ledger", url: "xrpscan.com" },
  { name: "Bithomp", chain: "XRP Ledger", url: "bithomp.com" },
  { name: "XRPL Explorer", chain: "XRP Ledger", url: "xrpl.org" },
  { name: "XRPlorer", chain: "XRP Ledger", url: "xrplorer.com" },
  { name: "XRP Cafe", chain: "XRP Ledger", url: "xrp.cafe" },
  { name: "OnTheDex", chain: "XRP Ledger", url: "onthedex.live" },
  // Filecoin
  { name: "Filfox", chain: "Filecoin", url: "filfox.info" },
  { name: "Filscan", chain: "Filecoin", url: "filscan.io" },
  { name: "Beryx", chain: "Filecoin", url: "beryx.io" },
  // Sui
  { name: "Suiscan", chain: "Sui", url: "suiscan.xyz" },
  { name: "SuiVision", chain: "Sui", url: "suivision.xyz" },
  { name: "Sui Explorer", chain: "Sui", url: "suiexplorer.com" },
  { name: "Sui Explorer", chain: "Sui", url: "explorer.sui.io" },
  // Other chains
  { name: "TronScan", chain: "Tron", url: "tronscan.org" },
  { name: "NearBlocks", chain: "NEAR", url: "nearblocks.io" },
  { name: "CardanoScan", chain: "Cardano", url: "cardanoscan.io" },
  { name: "Avascan", chain: "Avalanche", url: "avascan.info" },
  { name: "Subscan", chain: "Polkadot/Substrate", url: "subscan.io" },
  { name: "AlgoExplorer", chain: "Algorand", url: "algoexplorer.io" },
  { name: "Blockchair", chain: "Multi-chain", url: "blockchair.com" },
]

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

// Portfolio grouping helper
export interface Portfolio {
  name: string
  wallets: {
    address: string
    chain: string
    explorer: string
    addedAt: string
    lastCapture: string | null
    captureCount: number
    hasSchedule: boolean
    status: "active" | "capturing" | "failed"
  }[]
  totalCaptures: number
  lastActivity: string
  scheduledCount: number
  activeCaptures: number
}

export function groupArchivesByPortfolio(archives: Archive[]): Portfolio[] {
  const portfolioMap = new Map<string, Portfolio>()
  
  for (const archive of archives) {
    const portfolioName = archive.clientName || "Uncategorized"
    
    if (!portfolioMap.has(portfolioName)) {
      portfolioMap.set(portfolioName, {
        name: portfolioName,
        wallets: [],
        totalCaptures: 0,
        lastActivity: archive.archivedAt,
        scheduledCount: 0,
        activeCaptures: 0,
      })
    }
    
    const portfolio = portfolioMap.get(portfolioName)!
    
    // Find or create wallet entry
    let wallet = portfolio.wallets.find(
      w => w.address === archive.walletAddress && w.chain === archive.chain
    )
    
    if (!wallet) {
      wallet = {
        address: archive.walletAddress,
        chain: archive.chain,
        explorer: archive.explorer,
        addedAt: archive.archivedAt, // First capture = when added
        lastCapture: null,
        captureCount: 0,
        hasSchedule: false,
        status: "active",
      }
      portfolio.wallets.push(wallet)
    }
    
    // Update wallet stats
    wallet.captureCount++
    if (!wallet.lastCapture || new Date(archive.archivedAt) > new Date(wallet.lastCapture)) {
      wallet.lastCapture = archive.archivedAt
    }
    if (archive.scheduleInterval) {
      wallet.hasSchedule = true
    }
    if (archive.captureStatus === "capturing") {
      wallet.status = "capturing"
    } else if (archive.captureStatus === "failed" && wallet.status !== "capturing") {
      wallet.status = "failed"
    }
    
    // Update portfolio stats
    portfolio.totalCaptures++
    if (new Date(archive.archivedAt) > new Date(portfolio.lastActivity)) {
      portfolio.lastActivity = archive.archivedAt
    }
    if (archive.scheduleInterval) {
      portfolio.scheduledCount++
    }
    if (archive.captureStatus === "capturing") {
      portfolio.activeCaptures++
    }
  }
  
  // Sort portfolios by last activity (most recent first), with Uncategorized last
  return Array.from(portfolioMap.values()).sort((a, b) => {
    if (a.name === "Uncategorized") return 1
    if (b.name === "Uncategorized") return -1
    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  })
}
