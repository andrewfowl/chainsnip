export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  mode: "payment" | "subscription"
  interval?: "month" | "year"
  features: string[]
}

export const PRODUCTS: Product[] = [
  {
    id: "professional",
    name: "ChainSnip Professional",
    description: "For active crypto accountants - 25 wallets, 300 snapshots/month, auto month-end captures",
    priceInCents: 2500,
    mode: "subscription",
    interval: "month",
    features: [
      "25 wallet addresses",
      "300 snapshots/month",
      "Auto month-end captures",
      "Unlimited retention",
      "PDF exports",
      "Priority support",
    ],
  },
  {
    id: "firm",
    name: "ChainSnip Firm",
    description: "For accounting firms & teams - Unlimited wallets, team collaboration, API access",
    priceInCents: 10000,
    mode: "subscription",
    interval: "month",
    features: [
      "Unlimited wallets",
      "Unlimited snapshots",
      "Team collaboration",
      "API access",
      "Custom branding",
      "Dedicated account manager",
      "SOC 2 compliance",
    ],
  },
  {
    id: "lifetime",
    name: "ChainSnip Lifetime",
    description: "Pay once, use forever - Same features as Professional with no recurring fees",
    priceInCents: 25000,
    mode: "payment",
    features: [
      "25 wallet addresses",
      "300 snapshots/month",
      "Auto month-end captures",
      "Unlimited retention",
      "PDF exports",
      "Priority support",
      "All future updates",
      "No recurring fees",
    ],
  },
]

export function getProduct(productId: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === productId)
}
