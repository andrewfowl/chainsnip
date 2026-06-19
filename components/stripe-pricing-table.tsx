"use client"

import { useEffect } from "react"

// Allow the Stripe custom element in JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-pricing-table": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "pricing-table-id": string
          "publishable-key": string
        },
        HTMLElement
      >
    }
  }
}

const PRICING_TABLE_ID = "prctbl_1TizGh6YHL8XOD21lCtMuNsh"

export function StripePricingTable() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

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

  return (
    <div className="max-w-5xl mx-auto">
      <stripe-pricing-table pricing-table-id={PRICING_TABLE_ID} publishable-key={publishableKey} />
    </div>
  )
}
