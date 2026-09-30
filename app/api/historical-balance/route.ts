import { NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromSession } from "@/lib/auth"
import { insertBalanceQuery } from "@/lib/balance-queries"
import type { BalanceQuery } from "@/lib/balance-tokens"

const CHAINSTACK_NODE_URL = process.env.CHAINSTACK_NODE_URL
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY

interface NetworkConfig {
  name: string
  chainId: number
  rpcUrl: string
  blockExplorerApi?: string
  isArchive: boolean
  provider: "chainstack" | "alchemy" | "public"
}

interface NetworkDefinition {
  name: string
  chainId: number
  alchemyHost: string
  publicRpcUrl: string
  blockExplorerApi?: string
  chainstackUrl?: string
}

const NETWORK_DEFINITIONS: Record<string, NetworkDefinition> = {
  ethereum: {
    name: "Ethereum Mainnet",
    chainId: 1,
    alchemyHost: "eth-mainnet",
    publicRpcUrl: "https://eth.llamarpc.com",
    blockExplorerApi: "https://api.etherscan.io/api",
    chainstackUrl: CHAINSTACK_NODE_URL,
  },
  polygon: {
    name: "Polygon",
    chainId: 137,
    alchemyHost: "polygon-mainnet",
    publicRpcUrl: "https://polygon.llamarpc.com",
    blockExplorerApi: "https://api.polygonscan.com/api",
  },
  bsc: {
    name: "BNB Smart Chain",
    chainId: 56,
    alchemyHost: "bnb-mainnet",
    publicRpcUrl: "https://bsc.llamarpc.com",
    blockExplorerApi: "https://api.bscscan.com/api",
  },
  arbitrum: {
    name: "Arbitrum One",
    chainId: 42161,
    alchemyHost: "arb-mainnet",
    publicRpcUrl: "https://arbitrum.llamarpc.com",
    blockExplorerApi: "https://api.arbiscan.io/api",
  },
  optimism: {
    name: "Optimism",
    chainId: 10,
    alchemyHost: "opt-mainnet",
    publicRpcUrl: "https://optimism.llamarpc.com",
    blockExplorerApi: "https://api-optimistic.etherscan.io/api",
  },
  base: {
    name: "Base",
    chainId: 8453,
    alchemyHost: "base-mainnet",
    publicRpcUrl: "https://base.llamarpc.com",
    blockExplorerApi: "https://api.basescan.org/api",
  },
  avalanche: {
    name: "Avalanche C-Chain",
    chainId: 43114,
    alchemyHost: "avax-mainnet",
    publicRpcUrl: "https://avalanche.llamarpc.com",
    blockExplorerApi: "https://api.snowtrace.io/api",
  },
}

// Priority: dedicated Chainstack node > Alchemy archive > public (non-archive) RPC
function resolveNetworkConfig(def: NetworkDefinition): NetworkConfig {
  const base = { name: def.name, chainId: def.chainId, blockExplorerApi: def.blockExplorerApi }
  if (def.chainstackUrl) {
    return { ...base, rpcUrl: def.chainstackUrl, isArchive: true, provider: "chainstack" }
  }
  if (ALCHEMY_API_KEY) {
    return {
      ...base,
      rpcUrl: `https://${def.alchemyHost}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      isArchive: true,
      provider: "alchemy",
    }
  }
  return { ...base, rpcUrl: def.publicRpcUrl, isArchive: false, provider: "public" }
}

const NETWORK_CONFIGS: Record<string, NetworkConfig> = Object.fromEntries(
  Object.entries(NETWORK_DEFINITIONS).map(([id, def]) => [id, resolveNetworkConfig(def)])
)

// Standard ERC20 balanceOf ABI
const BALANCE_OF_ABI = {
  inputs: [{ name: "account", type: "address" }],
  name: "balanceOf",
  outputs: [{ name: "", type: "uint256" }],
  stateMutability: "view",
  type: "function",
}

// ERC20 decimals and symbol ABI
const DECIMALS_ABI = {
  inputs: [],
  name: "decimals",
  outputs: [{ name: "", type: "uint8" }],
  stateMutability: "view",
  type: "function",
}

const SYMBOL_ABI = {
  inputs: [],
  name: "symbol",
  outputs: [{ name: "", type: "string" }],
  stateMutability: "view",
  type: "function",
}

// Encode function call data
function encodeFunctionCall(functionName: string, params: string[]): string {
  // Simple encoding for balanceOf(address)
  if (functionName === "balanceOf" && params.length === 1) {
    const methodId = "0x70a08231" // keccak256("balanceOf(address)").slice(0, 10)
    const address = params[0].toLowerCase().replace("0x", "").padStart(64, "0")
    return methodId + address
  }
  if (functionName === "decimals") {
    return "0x313ce567" // keccak256("decimals()").slice(0, 10)
  }
  if (functionName === "symbol") {
    return "0x95d89b41" // keccak256("symbol()").slice(0, 10)
  }
  throw new Error(`Unknown function: ${functionName}`)
}

// Decode uint256 result
function decodeUint256(hex: string): string {
  if (!hex || hex === "0x") return "0"
  return BigInt(hex).toString()
}

// Decode string result (for symbol)
function decodeString(hex: string): string {
  if (!hex || hex === "0x" || hex.length < 130) return "UNKNOWN"
  try {
    // Skip method selector + offset + length, decode the actual string
    const lengthHex = hex.slice(66, 130)
    const length = parseInt(lengthHex, 16)
    const stringHex = hex.slice(130, 130 + length * 2)
    return Buffer.from(stringHex, "hex").toString("utf8").replace(/\0/g, "")
  } catch {
    return "UNKNOWN"
  }
}

// Get block number by timestamp using binary search
async function getBlockByTimestamp(
  network: string,
  timestamp: number
): Promise<{ blockNumber: number; blockTimestamp: number }> {
  const config = NETWORK_CONFIGS[network]
  if (!config) throw new Error(`Unknown network: ${network}`)

  // First, try to get current block
  const currentBlockRes = await fetch(config.rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_blockNumber",
      params: [],
      id: 1,
    }),
  })
  const currentBlockData = await currentBlockRes.json()
  const currentBlockNumber = parseInt(currentBlockData.result, 16)

  // Binary search for the block closest to the timestamp
  let low = 1
  let high = currentBlockNumber
  let closestBlock = currentBlockNumber
  let closestTimestamp = Math.floor(Date.now() / 1000)

  // Do a limited number of iterations
  for (let i = 0; i < 20 && low <= high; i++) {
    const mid = Math.floor((low + high) / 2)
    
    const blockRes = await fetch(config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: [`0x${mid.toString(16)}`, false],
        id: 1,
      }),
    })
    const blockData = await blockRes.json()
    
    if (!blockData.result) {
      high = mid - 1
      continue
    }

    const blockTimestamp = parseInt(blockData.result.timestamp, 16)
    
    if (Math.abs(blockTimestamp - timestamp) < Math.abs(closestTimestamp - timestamp)) {
      closestBlock = mid
      closestTimestamp = blockTimestamp
    }

    if (blockTimestamp === timestamp) {
      return { blockNumber: mid, blockTimestamp }
    } else if (blockTimestamp < timestamp) {
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  return { blockNumber: closestBlock, blockTimestamp: closestTimestamp }
}

// Query balance at specific block
async function queryBalanceAtBlock(
  network: string,
  walletAddress: string,
  contractAddress: string | null, // null for native token
  blockNumber: number
): Promise<{ balance: string; decimals: number; symbol: string }> {
  const config = NETWORK_CONFIGS[network]
  if (!config) throw new Error(`Unknown network: ${network}`)

  const blockHex = `0x${blockNumber.toString(16)}`

  if (!contractAddress) {
    // Query native token balance (ETH, MATIC, BNB, etc.)
    const res = await fetch(config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [walletAddress, blockHex],
        id: 1,
      }),
    })
    const data = await res.json()
    
    if (data.error) {
      throw new Error(data.error.message || "Failed to query balance")
    }

    const nativeSymbols: Record<string, string> = {
      ethereum: "ETH",
      polygon: "MATIC",
      bsc: "BNB",
      arbitrum: "ETH",
      optimism: "ETH",
      base: "ETH",
      avalanche: "AVAX",
    }

    return {
      balance: decodeUint256(data.result),
      decimals: 18,
      symbol: nativeSymbols[network] || "ETH",
    }
  }

  // Query ERC20 token balance
  const balanceData = encodeFunctionCall("balanceOf", [walletAddress])
  
  const balanceRes = await fetch(config.rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        { to: contractAddress, data: balanceData },
        blockHex,
      ],
      id: 1,
    }),
  })
  const balanceResult = await balanceRes.json()

  if (balanceResult.error) {
    throw new Error(balanceResult.error.message || "Failed to query token balance")
  }

  // Get decimals (at current block, should be constant)
  const decimalsData = encodeFunctionCall("decimals", [])
  const decimalsRes = await fetch(config.rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{ to: contractAddress, data: decimalsData }, "latest"],
      id: 1,
    }),
  })
  const decimalsResult = await decimalsRes.json()

  // Get symbol
  const symbolData = encodeFunctionCall("symbol", [])
  const symbolRes = await fetch(config.rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{ to: contractAddress, data: symbolData }, "latest"],
      id: 1,
    }),
  })
  const symbolResult = await symbolRes.json()

  return {
    balance: decodeUint256(balanceResult.result),
    decimals: decimalsResult.error ? 18 : parseInt(decodeUint256(decimalsResult.result)),
    symbol: symbolResult.error ? "TOKEN" : decodeString(symbolResult.result),
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      network,
      walletAddress,
      contractAddress,
      date, // ISO date string or timestamp
      blockNumber, // Optional: directly specify block number
    } = body

    if (!network || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields: network and walletAddress" },
        { status: 400 }
      )
    }

    if (!NETWORK_CONFIGS[network]) {
      return NextResponse.json(
        { error: `Unsupported network: ${network}. Supported: ${Object.keys(NETWORK_CONFIGS).join(", ")}` },
        { status: 400 }
      )
    }

    // Validate wallet address
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      )
    }

    // Validate contract address if provided
    if (contractAddress && !/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
      return NextResponse.json(
        { error: "Invalid contract address format" },
        { status: 400 }
      )
    }

    let targetBlock: number
    let blockTimestamp: number

    if (blockNumber) {
      // Use provided block number directly
      targetBlock = parseInt(blockNumber)
      
      // Get the timestamp for this block
      const config = NETWORK_CONFIGS[network]
      const blockRes = await fetch(config.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getBlockByNumber",
          params: [`0x${targetBlock.toString(16)}`, false],
          id: 1,
        }),
      })
      const blockData = await blockRes.json()
      blockTimestamp = blockData.result ? parseInt(blockData.result.timestamp, 16) : 0
    } else if (date) {
      // Convert date to timestamp and find block
      const timestamp = typeof date === "number" ? date : Math.floor(new Date(date).getTime() / 1000)
      const blockInfo = await getBlockByTimestamp(network, timestamp)
      targetBlock = blockInfo.blockNumber
      blockTimestamp = blockInfo.blockTimestamp
    } else {
      return NextResponse.json(
        { error: "Either date or blockNumber must be provided" },
        { status: 400 }
      )
    }

    // Query balance at the target block
    const { balance, decimals, symbol } = await queryBalanceAtBlock(
      network,
      walletAddress,
      contractAddress || null,
      targetBlock
    )

    // Format balance with decimals
    const balanceBigInt = BigInt(balance)
    const divisor = BigInt(10 ** decimals)
    const integerPart = balanceBigInt / divisor
    const fractionalPart = balanceBigInt % divisor
    const formattedBalance = `${integerPart}.${fractionalPart.toString().padStart(decimals, "0")}`

    const blockDate = new Date(blockTimestamp * 1000).toISOString()
    const queriedAt = new Date().toISOString()

    let saved: BalanceQuery | null = null
    const user = await getCurrentUserFromSession()
    if (user) {
      try {
        saved = await insertBalanceQuery(user.id, {
          network,
          networkName: NETWORK_CONFIGS[network].name,
          walletAddress,
          contractAddress: contractAddress || null,
          symbol,
          balance: formattedBalance,
          balanceRaw: balance,
          decimals,
          blockNumber: targetBlock,
          blockDate,
          queriedAt,
          clientName: body.clientName,
        })
      } catch (error) {
        console.error("Failed to save balance query:", error)
      }
    }

    return NextResponse.json({
      success: true,
      saved,
      data: {
        network: NETWORK_CONFIGS[network].name,
        walletAddress,
        contractAddress: contractAddress || "native",
        symbol,
        balance: formattedBalance,
        balanceRaw: balance,
        decimals,
        blockNumber: targetBlock,
        blockTimestamp,
        blockDate,
        queriedAt,
      },
    })
  } catch (error) {
    console.error("[v0] Historical balance query error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to query historical balance",
        details: "This may be due to the RPC node not having archival data for the requested block. Try using a dedicated archive node endpoint.",
      },
      { status: 500 }
    )
  }
}

// GET endpoint to return supported networks
export async function GET() {
  return NextResponse.json({
    networks: Object.entries(NETWORK_CONFIGS).map(([id, config]) => ({
      id,
      name: config.name,
      chainId: config.chainId,
      isArchive: config.isArchive,
      provider: config.provider,
    })),
    hasArchiveNode: Object.values(NETWORK_CONFIGS).some((config) => config.isArchive),
  })
}
