import "server-only"

export interface NonEvmBalanceResult {
  balance: string
  decimals: number
  symbol: string
  blockNumber: number
  blockTimestamp: number
}

export interface NonEvmNetwork {
  family: "cosmos" | "solana"
  name: string
  chainId: string
  isArchive: boolean
  provider: "alchemy" | "public"
}

interface CosmosDefinition {
  name: string
  chainId: string
  directoryName: string
  prefix: string
  denom: string
  symbol: string
  decimals: number
}

const COSMOS_CHAINS: Record<string, CosmosDefinition> = {
  cosmoshub: { name: "Cosmos Hub", chainId: "cosmoshub-4", directoryName: "cosmoshub", prefix: "cosmos", denom: "uatom", symbol: "ATOM", decimals: 6 },
  osmosis: { name: "Osmosis", chainId: "osmosis-1", directoryName: "osmosis", prefix: "osmo", denom: "uosmo", symbol: "OSMO", decimals: 6 },
  celestia: { name: "Celestia", chainId: "celestia", directoryName: "celestia", prefix: "celestia", denom: "utia", symbol: "TIA", decimals: 6 },
  injective: { name: "Injective", chainId: "injective-1", directoryName: "injective", prefix: "inj", denom: "inj", symbol: "INJ", decimals: 18 },
  dydx: { name: "dYdX Chain", chainId: "dydx-mainnet-1", directoryName: "dydx", prefix: "dydx", denom: "adydx", symbol: "DYDX", decimals: 18 },
  noble: { name: "Noble", chainId: "noble-1", directoryName: "noble", prefix: "noble", denom: "uusdc", symbol: "USDC", decimals: 6 },
  neutron: { name: "Neutron", chainId: "neutron-1", directoryName: "neutron", prefix: "neutron", denom: "untrn", symbol: "NTRN", decimals: 6 },
  akash: { name: "Akash", chainId: "akashnet-2", directoryName: "akash", prefix: "akash", denom: "uakt", symbol: "AKT", decimals: 6 },
  axelar: { name: "Axelar", chainId: "axelar-dojo-1", directoryName: "axelar", prefix: "axelar", denom: "uaxl", symbol: "AXL", decimals: 6 },
  stargaze: { name: "Stargaze", chainId: "stargaze-1", directoryName: "stargaze", prefix: "stars", denom: "ustars", symbol: "STARS", decimals: 6 },
}

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY
const SOLANA_RPC_URL = ALCHEMY_API_KEY
  ? `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  : "https://api.mainnet-beta.solana.com"

export const NON_EVM_NETWORKS: Record<string, NonEvmNetwork> = {
  solana: {
    family: "solana",
    name: "Solana",
    chainId: "mainnet-beta",
    isArchive: true,
    provider: ALCHEMY_API_KEY ? "alchemy" : "public",
  },
  ...Object.fromEntries(
    Object.entries(COSMOS_CHAINS).map(([id, c]) => [
      id,
      // Public Cosmos REST nodes prune old state, so only recent dates are reliably available.
      { family: "cosmos", name: c.name, chainId: c.chainId, isArchive: false, provider: "public" } satisfies NonEvmNetwork,
    ]),
  ),
}

const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
const COSMOS_DENOM = /^[a-zA-Z][a-zA-Z0-9/:._-]{1,127}$/

const BECH32_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"

function hasValidBech32Checksum(address: string): boolean {
  const separator = address.lastIndexOf("1")
  const hrp = address.slice(0, separator)
  const data = [...address.slice(separator + 1)].map((c) => BECH32_CHARSET.indexOf(c))
  if (data.some((v) => v < 0)) return false
  const generators = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
  let checksum = 1
  const values = [...[...hrp].map((c) => c.charCodeAt(0) >> 5), 0, ...[...hrp].map((c) => c.charCodeAt(0) & 31), ...data]
  for (const value of values) {
    const top = checksum >>> 25
    checksum = ((checksum & 0x1ffffff) << 5) ^ value
    for (let i = 0; i < 5; i++) if ((top >>> i) & 1) checksum ^= generators[i]
  }
  return checksum === 1
}

export function validateNonEvmInput(network: string, wallet: string, token: string | null): string | null {
  const def = NON_EVM_NETWORKS[network]
  if (!def) return `Unsupported network: ${network}`
  if (def.family === "solana") {
    if (!SOLANA_ADDRESS.test(wallet)) return "Invalid Solana wallet address"
    if (token && !SOLANA_ADDRESS.test(token)) return "Invalid Solana token mint address"
    return null
  }
  const { prefix } = COSMOS_CHAINS[network]
  if (!new RegExp(`^${prefix}1[02-9ac-hj-np-z]{38,58}$`).test(wallet)) {
  return `Invalid ${def.name} address. It should start with "${prefix}1".`
  }
  if (!hasValidBech32Checksum(wallet)) return `That isn't a valid ${def.name} address. Check it for typos.`
  if (token && !COSMOS_DENOM.test(token)) return "Invalid token denom"
  return null
}

// ---------- Cosmos ----------

async function cosmosGet<T>(network: string, path: string, height?: number): Promise<T> {
  const { directoryName } = COSMOS_CHAINS[network]
  const res = await fetch(`https://rest.cosmos.directory/${directoryName}${path}`, {
    headers: height ? { "x-cosmos-block-height": String(height) } : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || (data && typeof data.code === "number" && data.code !== 0)) {
    throw new CosmosError(String(data?.message || `Request failed (${res.status})`))
  }
  return data as T
}

class CosmosError extends Error {}

/** An error whose message already explains the problem to the user. */
export class UserFacingError extends Error {}

interface CosmosBlock {
  block: { header: { height: string; time: string } }
}

async function cosmosBlock(network: string, height: number | "latest") {
  const data = await cosmosGet<CosmosBlock>(network, `/cosmos/base/tendermint/v1beta1/blocks/${height}`)
  return { height: Number(data.block.header.height), time: Math.floor(new Date(data.block.header.time).getTime() / 1000) }
}

function lowestHeightFromError(error: unknown): number | null {
  const match = error instanceof Error ? error.message.match(/lowest height is (\d+)/) : null
  return match ? Number(match[1]) : null
}

async function cosmosLowestHeight(network: string, latestHeight: number): Promise<number> {
  try {
    await cosmosBlock(network, 1)
    return 1
  } catch (error) {
    const floor = lowestHeightFromError(error)
    if (floor !== null) return floor
  }
  // Some nodes answer "nil Block" instead of reporting their floor, so search for it.
  let lo = 1
  let hi = latestHeight
  for (let i = 0; i < 40 && lo < hi; i++) {
    const mid = Math.floor((lo + hi) / 2)
    try {
      await cosmosBlock(network, mid)
      hi = mid
    } catch (error) {
      lo = Math.max(mid + 1, lowestHeightFromError(error) ?? 0)
    }
  }
  return hi
}

// Last block at or before the timestamp. cosmos.directory load-balances across nodes
// that prune to different depths, so a "lowest height" error mid-search moves the floor up.
async function cosmosBlockAtTime(network: string, timestamp: number) {
  const chainName = COSMOS_CHAINS[network].name
  const latest = await cosmosBlock(network, "latest")
  if (timestamp >= latest.time) return latest

  let low = await cosmosLowestHeight(network, latest.height)
  let lowest: { height: number; time: number } | null = null
  for (let attempt = 0; attempt < 4 && !lowest; attempt++) {
    try {
      lowest = await cosmosBlock(network, low)
    } catch (error) {
      const floor = lowestHeightFromError(error)
      if (floor === null || floor <= low) throw error
      low = floor
    }
  }
  if (!lowest) throw new UserFacingError(`The public ${chainName} nodes are not returning historical blocks right now. Try again shortly.`)
  if (timestamp < lowest.time) {
    throw new UserFacingError(
      `The public ${chainName} nodes only keep history from ${new Date(lowest.time * 1000).toISOString().slice(0, 10)}. Pick a more recent date.`,
    )
  }

  let high = latest.height
  let best = lowest
  for (let i = 0; i < 60 && low <= high; i++) {
    const mid = Math.floor((low + high) / 2)
    let block: { height: number; time: number }
    try {
      block = await cosmosBlock(network, mid)
    } catch (error) {
      const floor = lowestHeightFromError(error)
      if (floor === null) throw error
      low = Math.max(mid + 1, floor)
      continue
    }
    if (block.time <= timestamp) {
      best = block
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return best
}

async function cosmosDenomInfo(network: string, denom: string): Promise<{ symbol: string; decimals: number }> {
  const chain = COSMOS_CHAINS[network]
  if (denom === chain.denom) return { symbol: chain.symbol, decimals: chain.decimals }
  try {
    const { metadata } = await cosmosGet<{
      metadata: { display: string; symbol?: string; denom_units: { denom: string; exponent: number }[] }
    }>(network, `/cosmos/bank/v1beta1/denoms_metadata/${encodeURIComponent(denom)}`)
    const display = metadata.denom_units.find((u) => u.denom === metadata.display)
    if (display) return { symbol: (metadata.symbol || metadata.display).toUpperCase(), decimals: display.exponent }
  } catch {}
  if (denom.startsWith("ibc/")) {
    try {
      const { denom_trace } = await cosmosGet<{ denom_trace: { base_denom: string } }>(
        network,
        `/ibc/apps/transfer/v1/denom_traces/${denom.slice(4)}`,
      )
      const base = denom_trace.base_denom
      return guessDenom(base.split("/").pop() || base)
    } catch {}
  }
  return guessDenom(denom.split("/").pop() || denom)
}

function guessDenom(base: string): { symbol: string; decimals: number } {
  if (/^u[a-z]+$/.test(base)) return { symbol: base.slice(1).toUpperCase(), decimals: 6 }
  if (/^a[a-z]+$/.test(base)) return { symbol: base.slice(1).toUpperCase(), decimals: 18 }
  return { symbol: base.toUpperCase().slice(0, 20), decimals: 6 }
}

async function queryCosmosBalance(
  network: string,
  wallet: string,
  denom: string | null,
  timestamp: number | null,
  height: number | null,
): Promise<NonEvmBalanceResult> {
  const chain = COSMOS_CHAINS[network]
  let block: { height: number; time: number }
  try {
    block = height ? await cosmosBlock(network, height) : await cosmosBlockAtTime(network, timestamp!)
  } catch (error) {
    const floor = lowestHeightFromError(error)
    if (floor !== null) {
      throw new UserFacingError(
        `The public ${chain.name} nodes only keep blocks from height ${floor.toLocaleString()}. Pick a more recent date or height.`,
      )
    }
    if (error instanceof CosmosError && /nil block/i.test(error.message)) {
      throw new UserFacingError(`The public ${chain.name} nodes don't have that block. Pick a more recent date or height.`)
    }
    throw error
  }
  const targetDenom = denom || chain.denom

  let amount: string
  try {
    const data = await cosmosGet<{ balance?: { amount: string } }>(
      network,
      `/cosmos/bank/v1beta1/balances/${wallet}/by_denom?denom=${encodeURIComponent(targetDenom)}`,
      block.height,
    )
    amount = data.balance?.amount ?? "0"
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (/invalid address|decoding bech32/i.test(message)) {
      throw new UserFacingError(`That isn't a valid ${chain.name} address. Check it for typos.`)
    }
    if (/pruned|version does not exist|failed to load state|not available/i.test(message)) {
      throw new UserFacingError(
        `The public ${chain.name} nodes no longer keep balances for block ${block.height.toLocaleString()}. Pick a more recent date.`,
      )
    }
    throw error
  }

  const { symbol, decimals } = await cosmosDenomInfo(network, targetDenom)
  return { balance: amount, decimals, symbol, blockNumber: block.height, blockTimestamp: block.time }
}

// ---------- Solana ----------

const RATE_LIMITED = /compute units|rate limit|too many requests|throughput/i

async function solanaRpc<T>(method: string, params: unknown[]): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(SOLANA_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    })
    const data = await res.json().catch(() => ({ error: { message: `Solana RPC ${method} failed (${res.status})` } }))
    const message: string = data.error?.message ?? ""
    const limited = res.status === 429 || RATE_LIMITED.test(message)
    if (limited && attempt < 5) {
      await new Promise((r) => setTimeout(r, 400 * 2 ** attempt + Math.random() * 200))
      continue
    }
    if (limited) throw new UserFacingError("The Solana node is busy right now. Please try again in a moment.")
    if (data.error) throw new Error(message || `Solana RPC ${method} failed`)
    return data.result as T
  }
}

interface SignatureInfo {
  signature: string
  slot: number
  blockTime: number | null
}

const MAX_SIGNATURE_PAGES = 25

// Solana RPC can't read state at a past slot, so the balance at a time is the post-balance
// of the last transaction that touched the account at or before that time.
async function lastSignatureBefore(account: string, timestamp: number): Promise<SignatureInfo | null> {
  let before: string | undefined
  for (let page = 0; page < MAX_SIGNATURE_PAGES; page++) {
    const sigs = await solanaRpc<SignatureInfo[]>("getSignaturesForAddress", [
      account,
      { limit: 1000, commitment: "finalized", ...(before ? { before } : {}) },
    ])
    if (sigs.length === 0) return null
    const hit = sigs.find((s) => s.blockTime != null && s.blockTime <= timestamp)
    if (hit) return hit
    before = sigs[sigs.length - 1].signature
  }
  throw new Error("This account has too many transactions after the chosen date to look back that far. Try a more recent date.")
}

interface ParsedTransaction {
  meta: {
    postBalances: number[]
    postTokenBalances?: { accountIndex: number; mint: string; uiTokenAmount: { amount: string; decimals: number } }[]
    loadedAddresses?: { writable: string[]; readonly: string[] }
  } | null
  transaction: { message: { accountKeys: (string | { pubkey: string })[] } }
}

async function getTransactionAccounts(signature: string) {
  const tx = await solanaRpc<ParsedTransaction | null>("getTransaction", [
    signature,
    { encoding: "json", maxSupportedTransactionVersion: 0, commitment: "finalized" },
  ])
  if (!tx?.meta) throw new Error("Could not load the Solana transaction for this date")
  const keys = tx.transaction.message.accountKeys.map((k) => (typeof k === "string" ? k : k.pubkey))
  const loaded = tx.meta.loadedAddresses
  return { meta: tx.meta, keys: loaded ? [...keys, ...loaded.writable, ...loaded.readonly] : keys }
}

async function solanaSlotTime(slot: number): Promise<number> {
  const time = await solanaRpc<number | null>("getBlockTime", [slot])
  if (time == null) throw new Error(`Solana slot ${slot} has no block time`)
  return time
}

async function querySolanaBalance(
  wallet: string,
  mint: string | null,
  timestamp: number | null,
  slot: number | null,
): Promise<NonEvmBalanceResult> {
  const asOf = slot ? await solanaSlotTime(slot) : timestamp!

  if (!mint) {
    const sig = await lastSignatureBefore(wallet, asOf)
    if (!sig) return { balance: "0", decimals: 9, symbol: "SOL", blockNumber: slot ?? 0, blockTimestamp: asOf }
    const { meta, keys } = await getTransactionAccounts(sig.signature)
    const index = keys.indexOf(wallet)
    const lamports = index >= 0 ? meta.postBalances[index] : 0
    return { balance: String(lamports), decimals: 9, symbol: "SOL", blockNumber: slot ?? sig.slot, blockTimestamp: asOf }
  }

  const [supply, accounts] = await Promise.all([
    solanaRpc<{ value: { decimals: number } }>("getTokenSupply", [mint]),
    solanaRpc<{ value: { pubkey: string }[] }>("getTokenAccountsByOwner", [wallet, { mint }, { encoding: "jsonParsed" }]),
  ])
  const decimals = supply.value.decimals

  let total = BigInt(0)
  let latestSlot = 0
  for (const { pubkey } of accounts.value) {
    const sig = await lastSignatureBefore(pubkey, asOf)
    if (!sig) continue
    const { meta, keys } = await getTransactionAccounts(sig.signature)
    const index = keys.indexOf(pubkey)
    const entry = meta.postTokenBalances?.find((b) => b.accountIndex === index && b.mint === mint)
    if (entry) total += BigInt(entry.uiTokenAmount.amount)
    latestSlot = Math.max(latestSlot, sig.slot)
  }

  return {
    balance: total.toString(),
    decimals,
    symbol: SOLANA_TOKEN_SYMBOLS[mint] ?? "SPL",
    blockNumber: slot ?? latestSlot,
    blockTimestamp: asOf,
  }
}

const SOLANA_TOKEN_SYMBOLS: Record<string, string> = {
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT",
  J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn: "JitoSOL",
  mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: "mSOL",
  JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: "JUP",
}

export async function queryNonEvmBalance(
  network: string,
  wallet: string,
  token: string | null,
  timestamp: number | null,
  blockNumber: number | null,
): Promise<NonEvmBalanceResult> {
  const def = NON_EVM_NETWORKS[network]
  if (def.family === "solana") return querySolanaBalance(wallet, token, timestamp, blockNumber)
  return queryCosmosBalance(network, wallet, token, timestamp, blockNumber)
}
