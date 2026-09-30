"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

      <BalanceQueryTool />

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
