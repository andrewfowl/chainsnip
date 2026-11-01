export interface BalanceNetwork {
  id: string
  name: string
  chainId: number | string
  isArchive: boolean
  family?: "evm" | "cosmos" | "solana"
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
  arc: [{ address: "0x3600000000000000000000000000000000000000", symbol: "USDC", name: "USD Coin" }],
  monad: [
    { address: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603", symbol: "USDC", name: "USD Coin" },
    { address: "0xe7cd86e13AC4309349F30B3435a9d337750fC82D", symbol: "USDT0", name: "Tether USD" },
    { address: "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A", symbol: "WMON", name: "Wrapped MON" },
  ],
  "arc-testnet": [
    { address: "0x3600000000000000000000000000000000000000", symbol: "USDC", name: "USD Coin" },
    { address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a", symbol: "EURC", name: "Euro Coin" },
  ],
  solana: [
    { address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", symbol: "USDC", name: "USD Coin" },
    { address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", symbol: "USDT", name: "Tether USD" },
    { address: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn", symbol: "JitoSOL", name: "Jito Staked SOL" },
  ],
  osmosis: [
    { address: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4", symbol: "USDC", name: "USD Coin (Noble)" },
  ],
  cosmoshub: [
    { address: "ibc/F663521BF1836B00F5F177680F74BFB9A8B5654A694D0D2BC249E03CF2509013", symbol: "USDC", name: "USD Coin (Noble)" },
  ],
}

export const NETWORK_ADDRESS_HINTS: Record<string, { wallet: string; token: string; block: string }> = {
  evm: { wallet: "0x...", token: "Or paste a token contract address", block: "Block number" },
  solana: { wallet: "Solana address (base58)", token: "Or paste an SPL token mint address", block: "Slot" },
  cosmos: { wallet: "e.g. cosmos1..., osmo1...", token: "Or paste a denom (e.g. ibc/...)", block: "Block height" },
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
