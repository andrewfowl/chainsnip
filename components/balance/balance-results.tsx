"use client"

import { format } from "date-fns"
import { Calendar, Download, Hash, Trash2, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatBalance, type BalanceQuery } from "@/lib/balance-tokens"

export const ALL_CLIENTS = "__all__"
export const NO_CLIENT = "__none__"

interface BalanceResultsProps {
  queries: BalanceQuery[]
  clients: string[]
  activeClient: string
  onActiveClientChange: (client: string) => void
  onDelete: (id: string) => void
  className?: string
}

function matchesClient(q: BalanceQuery, client: string) {
  if (client === ALL_CLIENTS) return true
  const name = q.clientName?.trim()
  if (client === NO_CLIENT) return !name
  return name?.toLowerCase() === client.toLowerCase()
}

function csvCell(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`
}

export function BalanceResults({
  queries,
  clients,
  activeClient,
  onActiveClientChange,
  onDelete,
  className,
}: BalanceResultsProps) {
  const visible = queries.filter((q) => matchesClient(q, activeClient))
  const unassignedCount = queries.filter((q) => !q.clientName?.trim()).length

  const tabs = [
    { value: ALL_CLIENTS, label: "All clients", count: queries.length },
    ...clients.map((c) => ({ value: c, label: c, count: queries.filter((q) => matchesClient(q, c)).length })),
    ...(unassignedCount > 0 && clients.length > 0
      ? [{ value: NO_CLIENT, label: "No client", count: unassignedCount }]
      : []),
  ]

  const activeLabel = tabs.find((t) => t.value === activeClient)?.label ?? "All clients"

  const exportToCSV = () => {
    const headers = ["Client", "Network", "Wallet Address", "Token", "Contract Address", "Balance", "Decimals", "Block Number", "Block Date", "Queried At"]
    const rows = visible.map((q) => [
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
    const csv = [headers.map(csvCell).join(","), ...rows.map((r) => r.map(csvCell).join(","))].join("\n")
    const slug =
      activeClient === ALL_CLIENTS ? "all-clients" : activeLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    const link = document.createElement("a")
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    link.download = `historical-balances-${slug}-${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <Card className={className}>
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              {visible.length} balance{visible.length !== 1 ? "s" : ""}
              {activeClient !== ALL_CLIENTS && ` for ${activeLabel}`}
            </CardDescription>
          </div>
          {visible.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Export CSV
            </Button>
          )}
        </div>

        {tabs.length > 1 && (
          <div role="group" aria-label="Filter by client" className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = tab.value === activeClient
              return (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onActiveClientChange(tab.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  <span className="max-w-40 truncate">{tab.label}</span>
                  <span className={cn("font-mono tabular-nums", active ? "text-background/70" : "text-muted-foreground/70")}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Wallet className="mx-auto mb-4 h-10 w-10 opacity-50" aria-hidden="true" />
            <p>No balances yet.</p>
            <p className="text-sm">Pick a network, paste a wallet and choose a date.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {activeClient === ALL_CLIENTS && <TableHead>Client</TableHead>}
                  <TableHead>Network</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>As of</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((q) => (
                  <TableRow key={q.id}>
                    {activeClient === ALL_CLIENTS && (
                      <TableCell>
                        {q.clientName ? (
                          <button
                            type="button"
                            onClick={() => onActiveClientChange(q.clientName!)}
                            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Badge variant="outline" className="hover:border-foreground/40">
                              {q.clientName}
                            </Badge>
                          </button>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant="secondary">{q.networkName}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs" title={q.walletAddress}>
                      {q.walletAddress.slice(0, 6)}...{q.walletAddress.slice(-4)}
                    </TableCell>
                    <TableCell>{q.symbol}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{formatBalance(q.balance)}</TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" aria-hidden="true" />
                          {format(new Date(q.blockDate), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Hash className="h-3 w-3" aria-hidden="true" />
                          Block {q.blockNumber.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(q.id)}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Delete result</span>
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
  )
}
