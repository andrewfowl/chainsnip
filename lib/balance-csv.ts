import type { BalanceQuery } from "./balance-tokens"

function csvCell(value: string | number) {
  const text = String(value)
  // CSV quoting does not stop spreadsheet formulas. Protect the exported copy,
  // including formulas hidden behind whitespace/control characters.
  const safe = /^(?:[\t\r\n]|[\s\u0000-\u001f]*[=+\-@])/.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}

export function historicalBalancesCSV(queries: readonly BalanceQuery[]) {
  const headers = ["Client", "Network", "Wallet Address", "Token", "Contract Address", "Balance", "Decimals", "Block Number", "Block Date", "Queried At"]
  const rows = queries.map((q) => [
    q.clientName || "",
    q.networkName,
    q.walletAddress,
    q.symbol,
    q.contractAddress || "Native",
    q.balance,
    q.decimals,
    q.blockNumber,
    q.blockDate,
    q.queriedAt,
  ])
  return [headers.map(csvCell).join(","), ...rows.map((r) => r.map(csvCell).join(","))].join("\n")
}
