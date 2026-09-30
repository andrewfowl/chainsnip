export interface BalanceNetwork {
  id: string
  name: string
  chainId: number
  isArchive: boolean
}

export interface BalanceQuery {
  id: string
  network: string
  networkName: string
  walletAddress: string
  contractAddress: string | null
  symbol: string
  balance: string
  balanceRaw: string
  decimals: number
  blockNumber: number
  blockDate: string
  queriedAt: string
  clientName?: string
}

export const COMMON_TOKENS: Record<string, { address: string; symbol: string; name: string }[]> = {
  ethereum: [
    { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether USD" },
    { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", name: "USD Coin" },
    { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", name: "Dai Stablecoin" },
    { address: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", symbol: "stETH", name: "Lido Staked ETH" },
  ],
  polygon: [
    { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", symbol: "USDT", name: "Tether USD" },
    { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", symbol: "USDC", name: "USD Coin" },
  ],
  bsc: [
    { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", name: "Tether USD" },
    { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", symbol: "USDC", name: "USD Coin" },
  ],
  arbitrum: [
    { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", symbol: "USDT", name: "Tether USD" },
    { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", symbol: "USDC", name: "USD Coin" },
  ],
  optimism: [
    { address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", symbol: "USDT", name: "Tether USD" },
    { address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", symbol: "USDC", name: "USD Coin" },
  ],
  base: [{ address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC", name: "USD Coin" }],
  avalanche: [
    { address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", symbol: "USDT", name: "Tether USD" },
    { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", symbol: "USDC", name: "USD Coin" },
  ],
}

export function formatBalance(balance: string, maxFractionDigits = 6): string {
  const [intPart, fracPart = ""] = balance.split(".")
  let intFormatted = intPart
  try {
    intFormatted = BigInt(intPart || "0").toLocaleString("en-US")
  } catch {}
  const frac = fracPart.slice(0, maxFractionDigits).replace(/0+$/, "")
  return frac ? `${intFormatted}.${frac}` : intFormatted
}

export function uniqueClients(queries: BalanceQuery[]): string[] {
  const seen = new Map<string, string>()
  for (const q of queries) {
    const name = q.clientName?.trim()
    if (name && !seen.has(name.toLowerCase())) seen.set(name.toLowerCase(), name)
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b))
}
