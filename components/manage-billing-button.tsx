"use client"

import { useTransition } from "react"
import { CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createBillingPortalSession } from "@/app/actions/billing"

export function ManageBillingButton() {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const openPortal = () => {
    startTransition(async () => {
      const result = await createBillingPortalSession()
      if (!result.url) {
        toast({ title: "Billing unavailable", description: result.error, variant: "destructive" })
        return
      }
      // Stripe's portal refuses to load inside an iframe, such as the v0 preview.
      if (window.self !== window.top) {
        window.open(result.url, "_blank", "noopener,noreferrer")
      } else {
        window.location.href = result.url
      }
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={openPortal} disabled={isPending}>
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
      Manage billing
    </Button>
  )
}
