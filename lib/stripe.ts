import "server-only"
import Stripe from "stripe"

export type PaidPlan = "pro" | "enterprise" | "lifetime"

let client: Stripe | null = null

export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
    client = new Stripe(key)
  }
  return client
}

export function matchPlan(value: string | null | undefined): PaidPlan | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (normalized === "pro" || normalized === "enterprise" || normalized === "lifetime") return normalized
  if (/\blifetime\b/.test(normalized)) return "lifetime"
  if (/\b(enterprise|firm)\b/.test(normalized)) return "enterprise"
  if (/\b(pro|professional)\b/.test(normalized)) return "pro"
  return null
}

// Explicit `plan` metadata wins over names, so renaming a product in Stripe can't change what customers get.
export async function resolvePlanFromPrice(price: Stripe.Price | string): Promise<PaidPlan | null> {
  const needsFetch = typeof price === "string" || typeof price.product === "string"
  const full = needsFetch
    ? await getStripe().prices.retrieve(typeof price === "string" ? price : price.id, { expand: ["product"] })
    : price

  const product =
    typeof full.product === "object" && full.product && !("deleted" in full.product && full.product.deleted)
      ? (full.product as Stripe.Product)
      : null

  return (
    matchPlan(full.metadata?.plan) ??
    matchPlan(product?.metadata?.plan) ??
    matchPlan(full.lookup_key) ??
    matchPlan(product?.name) ??
    matchPlan(full.nickname)
  )
}
