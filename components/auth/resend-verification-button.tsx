"use client"

import { useState } from "react"
import { Loader2, MailCheck, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { resendVerificationEmail } from "@/app/actions/auth"

export function ResendVerificationButton({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle")

  const handleClick = async () => {
    setState("sending")
    await resendVerificationEmail(email)
    setState("sent")
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="outline" className="w-full" onClick={handleClick} disabled={state !== "idle"}>
        {state === "sending" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : state === "sent" ? (
          <MailCheck className="mr-2 h-4 w-4" />
        ) : (
          <RotateCw className="mr-2 h-4 w-4" />
        )}
        {state === "sent" ? "Link sent" : "Resend confirmation link"}
      </Button>
      <p role="status" className="text-xs text-muted-foreground">
        {state === "sent" ? "If that address has an unconfirmed account, a new link is on its way." : ""}
      </p>
    </div>
  )
}
