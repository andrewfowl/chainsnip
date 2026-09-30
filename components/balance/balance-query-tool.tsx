"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { format } from "date-fns"
import { AlertCircle, Coins, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { COMMON_TOKENS, formatBalance, uniqueClients, type BalanceNetwork, type BalanceQuery } from "@/lib/balance-tokens"
import { ClientCombobox } from "./client-combobox"
import { ALL_CLIENTS, BalanceResults } from "./balance-results"

const STORAGE_KEY = "chainship-balance-queries"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function BalanceQueryTool() {
  const { toast } = useToast()
  const { data: networkData } = useSWR<{ networks: BalanceNetwork[] }>("/api/historical-balance", fetcher)
  const networks = networkData?.networks ?? []

  const [queries, setQueries] = useState<BalanceQuery[]>([])
  const [activeClient, setActiveClient] = useState(ALL_CLIENTS)

  const [selectedNetwork, setSelectedNetwork] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [contractAddress, setContractAddress] = useState("")
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const [blockNumber, setBlockNumber] = useState("")
  const [useBlockNumber, setUseBlockNumber] = useState(false)
  const [clientName, setClientName] = useState("")
  const [isQuerying, setIsQuerying] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setQueries(JSON.parse(saved))
    } catch {}
  }, [])

  const clients = uniqueClients(queries)

  const saveQueries = (next: BalanceQuery[]) => {
    setQueries(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedNetwork || !walletAddress) return

    const typedClient = clientName.trim()
    const normalizedClient = typedClient
      ? (clients.find((c) => c.toLowerCase() === typedClient.toLowerCase()) ?? typedClient)
      : undefined

    setIsQuerying(true)
    try {
      const res = await fetch("/api/historical-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          network: selectedNetwork,
          walletAddress: walletAddress.trim(),
          contractAddress: contractAddress.trim() || null,
          date: useBlockNumber ? undefined : selectedDate,
          blockNumber: useBlockNumber ? Number.parseInt(blockNumber, 10) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Query failed")

      const result: BalanceQuery = {
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
        clientName: normalizedClient,
      }

      saveQueries([result, ...queries])
      setClientName(normalizedClient ?? "")
      if (normalizedClient) setActiveClient(normalizedClient)
      else if (activeClient !== ALL_CLIENTS) setActiveClient(ALL_CLIENTS)

      toast({
        title: "Balance retrieved",
        description: `${formatBalance(data.data.balance)} ${data.data.symbol} at block ${data.data.blockNumber.toLocaleString()}`,
      })
    } catch (error) {
      toast({
        title: "Query failed",
        description: error instanceof Error ? error.message : "Failed to query balance",
        variant: "destructive",
      })
    } finally {
      setIsQuerying(false)
    }
  }

  const handleDelete = (id: string) => {
    const next = queries.filter((q) => q.id !== id)
    saveQueries(next)
    if (activeClient !== ALL_CLIENTS && !uniqueClients(next).some((c) => c === activeClient)) {
      setActiveClient(ALL_CLIENTS)
    }
  }

  const networkTokens = COMMON_TOKENS[selectedNetwork] ?? []
  const presetToken = networkTokens.find((t) => t.address === contractAddress)

  return (
    <div className="grid items-start gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" aria-hidden="true" />
            Query balance
          </CardTitle>
          <CardDescription>Balance of any wallet at a past date or block.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleQuery} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bq-network">Network</Label>
              <Select
                value={selectedNetwork}
                onValueChange={(v) => {
                  setSelectedNetwork(v)
                  setContractAddress("")
                }}
              >
                <SelectTrigger id="bq-network">
                  <SelectValue placeholder={networks.length ? "Select network" : "Loading networks..."} />
                </SelectTrigger>
                <SelectContent>
                  {networks.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bq-wallet">Wallet address</Label>
              <Input
                id="bq-wallet"
                placeholder="0x..."
                className="font-mono"
                spellCheck={false}
                autoComplete="off"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bq-token">Token</Label>
              <Select
                value={presetToken ? presetToken.address : contractAddress ? "custom" : "native"}
                onValueChange={(v) => {
                  if (v === "native") setContractAddress("")
                  else if (v !== "custom") setContractAddress(v)
                }}
                disabled={!selectedNetwork}
              >
                <SelectTrigger id="bq-token">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="native">Native token</SelectItem>
                  {networkTokens.map((t) => (
                    <SelectItem key={t.address} value={t.address}>
                      {t.symbol} - {t.name}
                    </SelectItem>
                  ))}
                  {contractAddress && !presetToken && <SelectItem value="custom">Custom contract</SelectItem>}
                </SelectContent>
              </Select>
              <Input
                aria-label="Custom token contract address"
                placeholder="Or paste a token contract address"
                className="font-mono text-xs"
                spellCheck={false}
                autoComplete="off"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bq-when">{useBlockNumber ? "Block number" : "Date"}</Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => setUseBlockNumber((v) => !v)}
                >
                  {useBlockNumber ? "Use date instead" : "Use block number instead"}
                </Button>
              </div>
              {useBlockNumber ? (
                <Input
                  id="bq-when"
                  type="number"
                  min={0}
                  placeholder="Block number"
                  value={blockNumber}
                  onChange={(e) => setBlockNumber(e.target.value)}
                />
              ) : (
                <Input
                  id="bq-when"
                  type="date"
                  max={format(new Date(), "yyyy-MM-dd")}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bq-client">Client (optional)</Label>
              <ClientCombobox
                id="bq-client"
                value={clientName}
                onChange={setClientName}
                clients={clients}
                placeholder={clients.length ? "Pick or type a client" : "e.g. Acme Holdings"}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isQuerying || !selectedNetwork || !walletAddress.trim() || (useBlockNumber && !blockNumber)}
            >
              {isQuerying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Querying...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Query balance
                </>
              )}
            </Button>

            <p className="flex gap-2 rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Reads the balance from archive nodes at the last block on or before the chosen date. Works for rebasing
              tokens like stETH.
            </p>
          </form>
        </CardContent>
      </Card>

      <BalanceResults
        className="lg:col-span-2"
        queries={queries}
        clients={clients}
        activeClient={activeClient}
        onActiveClientChange={setActiveClient}
        onDelete={handleDelete}
      />
    </div>
  )
}
