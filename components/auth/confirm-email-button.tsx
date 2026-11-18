"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { verifyEmail } from "@/app/actions/auth"

// Confirmation needs a click: email security scanners open links automatically and would otherwise use up the token.
export function ConfirmEmailButton({ token }: { token: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setIsLoading(true)
    setError(null)
    const result = await verifyEmail(token)
    if (result.success) {
      window.location.href = "/dashboard"
      return
    }
    setError(result.error || "Could not confirm your email.")
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" className="w-full" onClick={handleClick} disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
        Confirm email
      </Button>
      <p role="alert" className="text-sm text-destructive">
        {error ?? ""}
      </p>
    </div>
  )
}
