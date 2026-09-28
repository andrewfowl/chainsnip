"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"

// Allow the Stripe custom element in JSX
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-pricing-table": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "pricing-table-id": string
          "publishable-key": string
          "client-reference-id"?: string
          "customer-email"?: string
        },
        HTMLElement
      >
    }
  }
}

const PRICING_TABLE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || "prctbl_1TizGh6YHL8XOD21lCtMuNsh"

export function StripePricingTable() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  const { user, loading } = useAuth()

  useEffect(() => {
    // Load the Stripe pricing table script once
    if (document.querySelector('script[src="https://js.stripe.com/v3/pricing-table.js"]')) {
      return
    }
    const script = document.createElement("script")
    script.src = "https://js.stripe.com/v3/pricing-table.js"
    script.async = true
    document.body.appendChild(script)
  }, [])

  if (!publishableKey) {
    return (
      <div className="max-w-md mx-auto rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Pricing is temporarily unavailable. Please check back shortly.
        </p>
      </div>
    )
  }

  // The element reads its attributes once when it mounts, so wait for the session before rendering it.
  if (loading) {
    return <div className="max-w-5xl mx-auto min-h-96" aria-busy="true" />
  }

  return (
    <div className="max-w-5xl mx-auto">
      <stripe-pricing-table
        key={user?.id ?? "anonymous"}
        pricing-table-id={PRICING_TABLE_ID}
        publishable-key={publishableKey}
        {...(user ? { "client-reference-id": user.id, "customer-email": user.email } : {})}
      />
    </div>
  )
}
