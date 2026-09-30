import { NextResponse, type NextRequest } from "next/server"
import type Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import { handleStripeEvent } from "@/lib/stripe-sync"
import { hasProcessedEvent, markEventProcessed } from "@/lib/billing"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get("stripe-signature")
  if (!secret || !signature) {
    return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 })
  }

  const body = await request.text()
  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret)
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  if (await hasProcessedEvent(event.id)) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    await handleStripeEvent(event)
    await markEventProcessed(event.id, event.type)
  } catch (error) {
    console.error(`Stripe webhook ${event.type} (${event.id}) failed:`, error)
    // A 500 makes Stripe retry the event later.
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
