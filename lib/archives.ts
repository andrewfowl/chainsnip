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
  clientName?: string // New field for client organization
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
  name: string
  domain: string // Just the domain to match
}

export interface UsageStats {
  userId: string
  totalCapturesEver: number // Never decreases, only increases
  lastResetDate?: string // For potential future billing cycles
}

const ARCHIVES_KEY = "chainship_archives"
const CUSTOM_EXPLORERS_KEY = "chainship_custom_explorers"
const USAGE_STATS_KEY = "chainship_usage_stats"

export function getArchives(userId: string): Archive[] {
  if (typeof window === "undefined") return []
  const archives = localStorage.getItem(ARCHIVES_KEY)
  const all: Archive[] = archives ? JSON.parse(archives) : []
  return all
    .filter((a) => a.userId === userId)
    .sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime())
}

export function getAllArchives(): Archive[] {
  if (typeof window === "undefined") return []
  const archives = localStorage.getItem(ARCHIVES_KEY)
  return archives ? JSON.parse(archives) : []
}

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

  const customExplorers = getCustomExplorers()
  for (const custom of customExplorers) {
    if (urlLower.includes(custom.domain.toLowerCase())) {
      // Extract chain name from domain if possible
      const domainParts = custom.domain.replace(/\.(com|io|org|net|info|xyz)$/i, "").split(".")
      const chainGuess = domainParts[domainParts.length - 1]
      return { chain: chainGuess.charAt(0).toUpperCase() + chainGuess.slice(1), explorer: custom.name }
    }
  }

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
    /address\/(bc1[a-z0-9]{39,59})/i, // Bech32
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
    /account\/([a-z]+1[a-z0-9]{38,58})/i, // Generic Cosmos SDK
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
    // Sui addresses (start with 0x, 64 hex chars)
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

export function saveArchive(
  archive: Omit<
    Archive,
    "id" | "archivedAt" | "lastUpdated" | "status" | "chain" | "explorer" | "walletAddress" | "captureStatus"
  >,
): Archive {
  const all = getAllArchives()
  const { chain, explorer } = detectChainFromUrl(archive.url)
  const walletAddress = extractWalletAddress(archive.url)

  const newArchive: Archive = {
    ...archive,
    id: crypto.randomUUID(),
    chain,
    explorer,
    walletAddress,
    archivedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    status: "active",
    captureStatus: "pending",
  }

  if (archive.scheduleInterval === "monthly") {
    newArchive.nextScheduledSave = getNextMonthEnd().toISOString()
  }

  incrementCaptureCount(archive.userId)

  localStorage.setItem(ARCHIVES_KEY, JSON.stringify([...all, newArchive]))
  return newArchive
}

export function updateArchive(id: string, updates: Partial<Archive>) {
  const all = getAllArchives()
  const index = all.findIndex((a) => a.id === id)
  if (index !== -1) {
    all[index] = { ...all[index], ...updates, lastUpdated: new Date().toISOString() }
    localStorage.setItem(ARCHIVES_KEY, JSON.stringify(all))
  }
}

export function deleteArchive(id: string) {
  const all = getAllArchives()
  localStorage.setItem(ARCHIVES_KEY, JSON.stringify(all.filter((a) => a.id !== id)))
}

export function getArchiveCount(userId: string): number {
  return getArchives(userId).length
}

export function getCustomExplorers(): CustomExplorer[] {
  if (typeof window === "undefined") return []
  const explorers = localStorage.getItem(CUSTOM_EXPLORERS_KEY)
  return explorers ? JSON.parse(explorers) : []
}

export function saveCustomExplorer(explorer: Omit<CustomExplorer, "id">): CustomExplorer {
  const all = getCustomExplorers()
  const newExplorer: CustomExplorer = {
    ...explorer,
    id: crypto.randomUUID(),
  }
  localStorage.setItem(CUSTOM_EXPLORERS_KEY, JSON.stringify([...all, newExplorer]))
  return newExplorer
}

export function deleteCustomExplorer(id: string) {
  const all = getCustomExplorers()
  localStorage.setItem(CUSTOM_EXPLORERS_KEY, JSON.stringify(all.filter((e) => e.id !== id)))
}

export function getAllExplorers() {
  const custom = getCustomExplorers().map((c) => ({
    name: c.name,
    chain: c.domain,
    url: c.domain,
    isCustom: true,
  }))
  return [...SUPPORTED_EXPLORERS.map((e) => ({ ...e, isCustom: false })), ...custom]
}

export const PLAN_LIMITS = {
  free: { maxWallets: 3, maxSnapshots: 10, monthlyAutoSave: false },
  pro: { maxWallets: 25, maxSnapshots: 300, monthlyAutoSave: true },
  enterprise: { maxWallets: Number.POSITIVE_INFINITY, maxSnapshots: Number.POSITIVE_INFINITY, monthlyAutoSave: true },
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
  // XRP/Ripple - expanded
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

export function getUserUsageStats(userId: string): UsageStats {
  if (typeof window === "undefined") return { userId, totalCapturesEver: 0 }
  const stats = localStorage.getItem(USAGE_STATS_KEY)
  const allStats: UsageStats[] = stats ? JSON.parse(stats) : []
  return allStats.find((s) => s.userId === userId) || { userId, totalCapturesEver: 0 }
}

function incrementCaptureCount(userId: string) {
  if (typeof window === "undefined") return
  const stats = localStorage.getItem(USAGE_STATS_KEY)
  const allStats: UsageStats[] = stats ? JSON.parse(stats) : []
  const userStatIndex = allStats.findIndex((s) => s.userId === userId)

  if (userStatIndex !== -1) {
    allStats[userStatIndex].totalCapturesEver += 1
  } else {
    allStats.push({ userId, totalCapturesEver: 1 })
  }

  localStorage.setItem(USAGE_STATS_KEY, JSON.stringify(allStats))
}
