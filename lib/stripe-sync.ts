import "server-only"
import type Stripe from "stripe"
import { getStripe, resolvePlanFromPrice } from "./stripe"
import {
  activateSubscription,
  endSubscription,
  findBillingUser,
  grantLifetime,
  recordSubscriptionStatus,
  savePendingPurchase,
  takePendingPurchases,
  type BillingUser,
} from "./billing"

const GRANTS_ACCESS = new Set<Stripe.Subscription.Status>(["active", "trialing", "past_due"])
const ENDS_ACCESS = new Set<Stripe.Subscription.Status>(["canceled", "unpaid", "incomplete_expired", "paused"])

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null
  return typeof value === "string" ? value : value.id
}

// Always re-reads the subscription from Stripe, so events arriving out of order still leave the latest state.
async function syncSubscription(subscriptionId: string, knownUser?: BillingUser | null): Promise<boolean> {
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price.product"],
  })
  const customerId = idOf(subscription.customer)
  const user = knownUser ?? (await findBillingUser({ subscriptionId, customerId }))
  if (!user || !customerId) return false

  const item = subscription.items.data[0]

  if (GRANTS_ACCESS.has(subscription.status)) {
    const plan = item ? await resolvePlanFromPrice(item.price) : null
    if (!plan) {
      console.error(
        `Stripe subscription ${subscriptionId} has no recognizable plan. Set metadata plan=pro|enterprise on the product.`,
      )
    }
    await activateSubscription(user.id, {
      plan,
      customerId,
      subscriptionId,
      status: subscription.status,
      periodEnd: item?.current_period_end ? new Date(item.current_period_end * 1000) : null,
    })
  } else if (ENDS_ACCESS.has(subscription.status)) {
    await endSubscription(user.id, subscriptionId, subscription.status)
  } else {
    await recordSubscriptionStatus(user.id, subscriptionId, subscription.status)
  }
  return true
}

async function purchasedLifetime(sessionId: string): Promise<boolean> {
  const lineItems = await getStripe().checkout.sessions.listLineItems(sessionId, {
    expand: ["data.price.product"],
  })
  for (const line of lineItems.data) {
    if (line.price && (await resolvePlanFromPrice(line.price)) === "lifetime") return true
  }
  return false
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status === "unpaid") return

  const customerId = idOf(session.customer)
  const subscriptionId = idOf(session.subscription)
  const email = session.customer_details?.email ?? session.customer_email ?? null
  const user = await findBillingUser({ userId: session.client_reference_id, customerId, email })
  const isLifetime = session.mode === "payment" && (await purchasedLifetime(session.id))

  if (!user) {
    if (email && (subscriptionId || isLifetime)) {
      await savePendingPurchase({ email, customerId, subscriptionId, isLifetime })
    } else {
      console.error(`Stripe checkout ${session.id} could not be matched to a user and has no email.`)
    }
    return
  }

  if (subscriptionId) await syncSubscription(subscriptionId, user)
  if (isLifetime) await grantLifetime(user.id, customerId)
}

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await handleCheckoutCompleted(event.data.object)
      break
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      await syncSubscription(event.data.object.id)
      break
  }
}

// Links purchases made before the buyer had an account, once they sign up with the same email.
export async function claimPendingPurchases(userId: string, email: string): Promise<void> {
  const purchases = await takePendingPurchases(userId, email)
  if (purchases.length === 0) return

  const user = await findBillingUser({ userId })
  for (const purchase of purchases) {
    if (purchase.stripe_subscription_id) await syncSubscription(purchase.stripe_subscription_id, user)
    if (purchase.is_lifetime) await grantLifetime(userId, purchase.stripe_customer_id)
  }
}
