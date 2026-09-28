"use server"

import { headers } from "next/headers"
import { getCurrentUserFromSession } from "@/lib/auth"
import { getStripeCustomerId } from "@/lib/billing"
import { getStripe } from "@/lib/stripe"

export async function createBillingPortalSession(): Promise<{ url?: string; error?: string }> {
  const user = await getCurrentUserFromSession()
  if (!user) return { error: "Please sign in again." }

  const customerId = await getStripeCustomerId(user.id)
  if (!customerId) return { error: "No billing account is linked to your profile yet." }

  const headerList = await headers()
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host")
  const protocol = headerList.get("x-forwarded-proto") ?? "https"
  const origin = headerList.get("origin") ?? `${protocol}://${host}`

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    })
    return { url: session.url }
  } catch (error) {
    console.error("Failed to open Stripe billing portal:", error)
    return { error: "Billing portal is unavailable right now. Please try again shortly." }
  }
}
