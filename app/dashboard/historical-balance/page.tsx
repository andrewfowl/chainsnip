"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Loader2 } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getCurrentUser } from "@/app/actions/auth"
import type { User } from "@/lib/auth"
import { BalanceQueryTool } from "@/components/balance/balance-query-tool"

export default function HistoricalBalancePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      if (!currentUser) {
        router.push("/auth/login")
        return
      }
      setUser(currentUser)
      setIsLoading(false)
    })
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Balance Lookup</h1>
        <p className="text-sm text-muted-foreground">
          Find out exactly what a wallet held on any past date, and file the result under a client.
        </p>
      </div>

      <ol className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { title: "Choose network and wallet", body: "Paste the wallet address and pick the chain it lives on." },
          { title: "Pick a date or block", body: "Month-end, quarter-end, or any day you need a figure for." },
          { title: "Tag a client and run", body: "Previously used clients appear as you type. Results are saved to your account." },
        ].map((step, i) => (
          <li key={step.title} className="flex gap-3 rounded-lg border border-border p-4">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-medium text-background">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{step.title}</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <BalanceQueryTool />

      <Collapsible className="mt-6 rounded-lg border border-border">
        <CollapsibleTrigger className="group flex w-full items-center justify-between px-4 py-3 text-sm font-medium">
          When should I use a historical lookup?
          <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
        </CollapsibleTrigger>
        <CollapsibleContent className="prose prose-sm dark:prose-invert max-w-none px-4 pb-4">
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
