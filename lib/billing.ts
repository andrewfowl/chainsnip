import "server-only"
import { queryOne, queryMany, execute } from "./db"
import type { PaidPlan } from "./stripe"

export interface BillingUser {
  id: string
  email: string
  plan: "free" | PaidPlan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  has_lifetime: boolean
}

export interface PendingPurchase {
  id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  is_lifetime: boolean
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const BILLING_COLUMNS = "id, email, plan, stripe_customer_id, stripe_subscription_id, has_lifetime"

export async function findBillingUser(lookup: {
  userId?: string | null
  subscriptionId?: string | null
  customerId?: string | null
  email?: string | null
}): Promise<BillingUser | null> {
  if (lookup.userId && UUID_PATTERN.test(lookup.userId)) {
    const user = await queryOne<BillingUser>(`SELECT ${BILLING_COLUMNS} FROM users WHERE id = $1`, [lookup.userId])
    if (user) return user
  }
  if (lookup.subscriptionId) {
    const user = await queryOne<BillingUser>(`SELECT ${BILLING_COLUMNS} FROM users WHERE stripe_subscription_id = $1`, [
      lookup.subscriptionId,
    ])
    if (user) return user
  }
  if (lookup.customerId) {
    const user = await queryOne<BillingUser>(`SELECT ${BILLING_COLUMNS} FROM users WHERE stripe_customer_id = $1`, [
      lookup.customerId,
    ])
    if (user) return user
  }
  if (lookup.email) {
    return queryOne<BillingUser>(`SELECT ${BILLING_COLUMNS} FROM users WHERE email = $1`, [lookup.email.toLowerCase()])
  }
  return null
}

export async function activateSubscription(
  userId: string,
  details: {
    plan: PaidPlan | null
    customerId: string
    subscriptionId: string
    status: string
    periodEnd: Date | null
  },
): Promise<void> {
  // A lifetime holder buying Pro keeps Lifetime (same limits); an unresolved plan keeps the current plan.
  await execute(
    `UPDATE users SET
       plan = CASE
         WHEN $2::text IS NULL THEN plan
         WHEN has_lifetime AND $2::text = 'pro' THEN 'lifetime'
         ELSE $2::text
       END,
       stripe_customer_id = $3,
       stripe_subscription_id = $4,
       subscription_status = $5,
       current_period_end = $6,
       updated_at = NOW()
     WHERE id = $1`,
    [userId, details.plan, details.customerId, details.subscriptionId, details.status, details.periodEnd],
  )
}

export async function recordSubscriptionStatus(userId: string, subscriptionId: string, status: string): Promise<void> {
  await execute(
    `UPDATE users SET subscription_status = $3, updated_at = NOW()
     WHERE id = $1 AND stripe_subscription_id = $2`,
    [userId, subscriptionId, status],
  )
}

// Only ends access for the subscription currently on file, so a stale event for an old subscription can't downgrade a newer one.
export async function endSubscription(userId: string, subscriptionId: string, status: string): Promise<void> {
  await execute(
    `UPDATE users SET
       plan = CASE WHEN has_lifetime THEN 'lifetime' ELSE 'free' END,
       stripe_subscription_id = NULL,
       subscription_status = $3,
       current_period_end = NULL,
       updated_at = NOW()
     WHERE id = $1 AND (stripe_subscription_id = $2 OR stripe_subscription_id IS NULL)`,
    [userId, subscriptionId, status],
  )
}

export async function grantLifetime(userId: string, customerId: string | null): Promise<void> {
  await execute(
    `UPDATE users SET
       has_lifetime = true,
       plan = CASE WHEN plan = 'enterprise' AND stripe_subscription_id IS NOT NULL THEN plan ELSE 'lifetime' END,
       stripe_customer_id = COALESCE(stripe_customer_id, $2),
       updated_at = NOW()
     WHERE id = $1`,
    [userId, customerId],
  )
}

export async function getStripeCustomerId(userId: string): Promise<string | null> {
  const row = await queryOne<{ stripe_customer_id: string | null }>(
    `SELECT stripe_customer_id FROM users WHERE id = $1`,
    [userId],
  )
  return row?.stripe_customer_id ?? null
}

export async function hasProcessedEvent(eventId: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(`SELECT id FROM stripe_events WHERE id = $1`, [eventId])
  return !!row
}

export async function markEventProcessed(eventId: string, type: string): Promise<void> {
  await execute(`INSERT INTO stripe_events (id, type) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, [eventId, type])
}

export async function savePendingPurchase(purchase: {
  email: string
  customerId: string | null
  subscriptionId: string | null
  isLifetime: boolean
}): Promise<void> {
  await execute(
    `INSERT INTO stripe_pending_purchases (email, stripe_customer_id, stripe_subscription_id, is_lifetime)
     VALUES ($1, $2, $3, $4)`,
    [purchase.email.toLowerCase(), purchase.customerId, purchase.subscriptionId, purchase.isLifetime],
  )
}

export async function takePendingPurchases(userId: string, email: string): Promise<PendingPurchase[]> {
  return queryMany<PendingPurchase>(
    `UPDATE stripe_pending_purchases SET claimed_by = $1, claimed_at = NOW()
     WHERE lower(email) = lower($2) AND claimed_by IS NULL
     RETURNING id, stripe_customer_id, stripe_subscription_id, is_lifetime`,
    [userId, email],
  )
}
