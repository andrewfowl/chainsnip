import "server-only"
import { execute, queryMany, queryOne } from "./db"
import type { BalanceQuery } from "./balance-tokens"

const MAX_CLIENT_NAME = 100
export const MAX_IMPORT = 200

interface BalanceQueryRow {
  id: string
  network: string
  network_name: string
  wallet_address: string
  contract_address: string | null
  symbol: string
  balance: string
  balance_raw: string
  decimals: number
  block_number: string
  block_date: Date
  queried_at: Date
  client_name: string | null
}

const COLUMNS = `id, network, network_name, wallet_address, contract_address, symbol, balance, balance_raw,
  decimals, block_number, block_date, queried_at, client_name`

function toBalanceQuery(row: BalanceQueryRow): BalanceQuery {
  return {
    id: row.id,
    network: row.network,
    networkName: row.network_name,
    walletAddress: row.wallet_address,
    contractAddress: row.contract_address,
    symbol: row.symbol,
    balance: row.balance,
    balanceRaw: row.balance_raw,
    decimals: row.decimals,
    blockNumber: Number(row.block_number),
    blockDate: new Date(row.block_date).toISOString(),
    queriedAt: new Date(row.queried_at).toISOString(),
    clientName: row.client_name ?? undefined,
  }
}

export function normalizeClientName(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim().replace(/\s+/g, " ").slice(0, MAX_CLIENT_NAME)
  return trimmed || null
}

// Reuse the user's existing spelling of a client so "acme" and "Acme" stay one client.
async function canonicalClientName(userId: string, clientName: string | null): Promise<string | null> {
  if (!clientName) return null
  const existing = await queryOne<{ client_name: string }>(
    `SELECT client_name FROM balance_queries
     WHERE user_id = $1 AND lower(client_name) = lower($2)
     ORDER BY queried_at ASC LIMIT 1`,
    [userId, clientName],
  )
  return existing?.client_name ?? clientName
}

export async function listBalanceQueries(userId: string): Promise<BalanceQuery[]> {
  const rows = await queryMany<BalanceQueryRow>(
    `SELECT ${COLUMNS} FROM balance_queries WHERE user_id = $1 ORDER BY queried_at DESC LIMIT 1000`,
    [userId],
  )
  return rows.map(toBalanceQuery)
}

export async function insertBalanceQuery(
  userId: string,
  query: Omit<BalanceQuery, "id" | "clientName"> & { clientName?: string | null },
): Promise<BalanceQuery> {
  const clientName = await canonicalClientName(userId, normalizeClientName(query.clientName))
  const row = await queryOne<BalanceQueryRow>(
    `INSERT INTO balance_queries
       (user_id, network, network_name, wallet_address, contract_address, symbol, balance, balance_raw,
        decimals, block_number, block_date, queried_at, client_name)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING ${COLUMNS}`,
    [
      userId,
      query.network,
      query.networkName,
      query.walletAddress,
      query.contractAddress,
      query.symbol,
      query.balance,
      query.balanceRaw,
      query.decimals,
      query.blockNumber,
      query.blockDate,
      query.queriedAt,
      clientName,
    ],
  )
  if (!row) throw new Error("Failed to save balance query")
  return toBalanceQuery(row)
}

export async function deleteBalanceQuery(userId: string, id: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `DELETE FROM balance_queries WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId],
  )
  return !!row
}

const ADDRESS = /^0x[a-fA-F0-9]{40}$/

// Validates results saved in the browser before a guest signed in, so they can be moved to the account.
export function parseImportedQuery(value: unknown): Omit<BalanceQuery, "id"> | null {
  if (!value || typeof value !== "object") return null
  const q = value as Record<string, unknown>
  const str = (v: unknown, max = 200) => (typeof v === "string" && v.length > 0 && v.length <= max ? v : null)

  const network = str(q.network, 50)
  const networkName = str(q.networkName, 100)
  const walletAddress = str(q.walletAddress, 42)
  const symbol = str(q.symbol, 30)
  const balance = str(q.balance, 100)
  const balanceRaw = str(q.balanceRaw, 100)
  const contractAddress = q.contractAddress == null ? null : str(q.contractAddress, 42)
  const decimals = Number(q.decimals)
  const blockNumber = Number(q.blockNumber)
  const blockDate = new Date(String(q.blockDate))
  const queriedAt = new Date(String(q.queriedAt))

  if (!network || !networkName || !walletAddress || !ADDRESS.test(walletAddress)) return null
  if (!symbol || !balance || !balanceRaw || !/^\d+$/.test(balanceRaw)) return null
  if (q.contractAddress != null && (!contractAddress || !ADDRESS.test(contractAddress))) return null
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36) return null
  if (!Number.isSafeInteger(blockNumber) || blockNumber < 0) return null
  if (Number.isNaN(blockDate.getTime()) || Number.isNaN(queriedAt.getTime())) return null

  return {
    network,
    networkName,
    walletAddress,
    contractAddress,
    symbol,
    balance,
    balanceRaw,
    decimals,
    blockNumber,
    blockDate: blockDate.toISOString(),
    queriedAt: queriedAt.toISOString(),
    clientName: normalizeClientName(q.clientName) ?? undefined,
  }
}
