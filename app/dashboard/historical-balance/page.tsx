"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/app/actions/auth"
import type { User } from "@/lib/auth"
import {
  Loader2,
  Plus,
  Trash2,
  Download,
  Calendar,
  Wallet,
  Coins,
  ArrowLeft,
  Clock,
  Hash,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface Network {
  id: string
  name: string
  chainId: number
  isArchive: boolean
}

interface BalanceQuery {
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

// Common tokens by network
const COMMON_TOKENS: Record<string, { address: string; symbol: string; name: string }[]> = {
  ethereum: [
    { address: "", symbol: "ETH", name: "Ethereum (Native)" },
    { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether USD" },
    { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", name: "USD Coin" },
    { address: "0x6B175474E89094C44Da98b954EesD1 fF C2B6baab", symbol: "DAI", name: "Dai Stablecoin" },
    { address: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", symbol: "stETH", name: "Lido Staked ETH" },
  ],
  polygon: [
    { address: "", symbol: "MATIC", name: "Polygon (Native)" },
    { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", symbol: "USDT", name: "Tether USD" },
    { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", symbol: "USDC", name: "USD Coin" },
  ],
  bsc: [
    { address: "", symbol: "BNB", name: "BNB (Native)" },
    { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", name: "Tether USD" },
    { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", symbol: "USDC", name: "USD Coin" },
  ],
  arbitrum: [
    { address: "", symbol: "ETH", name: "Ethereum (Native)" },
    { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", symbol: "USDT", name: "Tether USD" },
    { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", symbol: "USDC", name: "USD Coin" },
  ],
  optimism: [
    { address: "", symbol: "ETH", name: "Ethereum (Native)" },
    { address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", symbol: "USDT", name: "Tether USD" },
    { address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", symbol: "USDC", name: "USD Coin" },
  ],
  base: [
    { address: "", symbol: "ETH", name: "Ethereum (Native)" },
    { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC", name: "USD Coin" },
  ],
  avalanche: [
    { address: "", symbol: "AVAX", name: "Avalanche (Native)" },
    { address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", symbol: "USDT", name: "Tether USD" },
    { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", symbol: "USDC", name: "USD Coin" },
  ],
}

export default function HistoricalBalancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [networks, setNetworks] = useState<Network[]>([])
  const [queries, setQueries] = useState<BalanceQuery[]>([])
  
  // Form state
  const [selectedNetwork, setSelectedNetwork] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [contractAddress, setContractAddress] = useState("")
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [blockNumber, setBlockNumber] = useState("")
  const [useBlockNumber, setUseBlockNumber] = useState(false)
  const [clientName, setClientName] = useState("")
  const [isQuerying, setIsQuerying] = useState(false)

  useEffect(() => {
    const init = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/auth/login")
        return
      }
      setUser(currentUser)

      // Fetch supported networks
      try {
        const res = await fetch("/api/historical-balance")
        const data = await res.json()
        setNetworks(data.networks || [])
      } catch (error) {
        console.error("Failed to fetch networks:", error)
      }

      // Load saved queries from localStorage
      const saved = localStorage.getItem("chainship-balance-queries")
      if (saved) {
        setQueries(JSON.parse(saved))
      }

      setIsLoading(false)
    }
    init()
  }, [router])

  const saveQueries = (newQueries: BalanceQuery[]) => {
    setQueries(newQueries)
    localStorage.setItem("chainship-balance-queries", JSON.stringify(newQueries))
  }

  const handleQuery = async () => {
    if (!selectedNetwork || !walletAddress) {
      toast({
        title: "Missing Fields",
        description: "Please select a network and enter a wallet address.",
        variant: "destructive",
      })
      return
    }

    setIsQuerying(true)

    try {
      const res = await fetch("/api/historical-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          network: selectedNetwork,
          walletAddress,
          contractAddress: contractAddress || null,
          date: useBlockNumber ? undefined : selectedDate,
          blockNumber: useBlockNumber ? parseInt(blockNumber) : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Query failed")
      }

      const newQuery: BalanceQuery = {
        id: crypto.randomUUID(),
        network: selectedNetwork,
        networkName: data.data.network,
        walletAddress: data.data.walletAddress,
        contractAddress: data.data.contractAddress === "native" ? null : data.data.contractAddress,
        symbol: data.data.symbol,
        balance: data.data.balance,
        balanceRaw: data.data.balanceRaw,
        decimals: data.data.decimals,
        blockNumber: data.data.blockNumber,
        blockDate: data.data.blockDate,
        queriedAt: data.data.queriedAt,
        clientName: clientName || undefined,
      }

      saveQueries([newQuery, ...queries])

      toast({
        title: "Balance Retrieved",
        description: `${data.data.balance} ${data.data.symbol} at block ${data.data.blockNumber}`,
      })
    } catch (error) {
      toast({
        title: "Query Failed",
        description: error instanceof Error ? error.message : "Failed to query balance",
        variant: "destructive",
      })
    }

    setIsQuerying(false)
  }

  const handleDeleteQuery = (id: string) => {
    saveQueries(queries.filter((q) => q.id !== id))
    toast({ title: "Deleted", description: "Query result removed." })
  }

  const exportToCSV = () => {
    const headers = [
      "Client",
      "Network",
      "Wallet Address",
      "Token",
      "Contract Address",
      "Balance",
      "Decimals",
      "Block Number",
      "Block Date",
      "Queried At",
    ]
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

    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `historical-balances-${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
    URL.revokeObjectURL(link.href)

    toast({ title: "Exported", description: `Exported ${queries.length} records to CSV` })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  const networkTokens = COMMON_TOKENS[selectedNetwork] || []

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Historical Balance Reports</h1>
        <p className="text-muted-foreground">
          Query wallet balances at specific dates or block heights for accounting records.
          Useful for rebasing tokens where balances change without transactions.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Query Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Query Balance
            </CardTitle>
            <CardDescription>
              Enter wallet details to query historical balance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Network</Label>
              <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {networks.map((network) => (
                    <SelectItem key={network.id} value={network.id}>
                      {network.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <Input
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Token (Optional)</Label>
              <Select
                value={contractAddress}
                onValueChange={(v) => setContractAddress(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Native token or select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Native Token</SelectItem>
                  {networkTokens.map((token) => (
                    <SelectItem key={token.address || "native"} value={token.address}>
                      {token.symbol} - {token.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Or enter custom contract address below
              </p>
              <Input
                placeholder="Custom token contract address"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{useBlockNumber ? "Block Number" : "Date"}</Label>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => setUseBlockNumber(!useBlockNumber)}
                >
                  {useBlockNumber ? "Use date instead" : "Use block number instead"}
                </Button>
              </div>
              {useBlockNumber ? (
                <Input
                  type="number"
                  placeholder="Block number"
                  value={blockNumber}
                  onChange={(e) => setBlockNumber(e.target.value)}
                />
              ) : (
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Client Name (Optional)</Label>
              <Input
                placeholder="e.g., Client ABC"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleQuery}
              disabled={isQuerying || !selectedNetwork || !walletAddress}
            >
              {isQuerying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Querying...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Query Balance
                </>
              )}
            </Button>

            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <AlertCircle className="h-4 w-4 mb-1 inline-block mr-1" />
              <strong>Note:</strong> Historical queries require archive node access.
              Some public RPCs may not have full historical data. For rebasing tokens
              like stETH, this returns the balance at that specific block.
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Query Results</CardTitle>
                <CardDescription>
                  {queries.length} historical balance{queries.length !== 1 ? "s" : ""} queried
                </CardDescription>
              </div>
              {queries.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {queries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Wallet className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No balance queries yet.</p>
                <p className="text-sm">Use the form to query historical balances.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Network</TableHead>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Block Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queries.map((query) => (
                      <TableRow key={query.id}>
                        <TableCell>
                          {query.clientName ? (
                            <Badge variant="outline">{query.clientName}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{query.networkName}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {query.walletAddress.slice(0, 6)}...{query.walletAddress.slice(-4)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Coins className="h-3 w-3" />
                            {query.symbol}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {parseFloat(query.balance).toLocaleString(undefined, {
                            maximumFractionDigits: 6,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(query.blockDate), "MMM d, yyyy")}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Hash className="h-3 w-3" />
                              Block {query.blockNumber.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteQuery(query.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About Historical Balance Queries</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Historical balance queries allow you to retrieve the exact token balance of a wallet
            at a specific point in time. This is particularly useful for:
          </p>
          <ul>
            <li>
              <strong>Rebasing tokens</strong> (like stETH, sKLIMA, AMPL) where balances change
              daily without transactions
            </li>
            <li>
              <strong>Period-end reporting</strong> - Get balances at month-end, quarter-end, or
              year-end dates
            </li>
            <li>
              <strong>Audit documentation</strong> - Provide verifiable proof of balances at
              specific dates
            </li>
            <li>
              <strong>Tax reporting</strong> - Document fair market values at specific dates
            </li>
          </ul>
          <p>
            The query uses archival blockchain data to call the token&apos;s <code>balanceOf()</code>
            function at a specific block height, returning the exact balance that would have been
            shown in the wallet at that time.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
