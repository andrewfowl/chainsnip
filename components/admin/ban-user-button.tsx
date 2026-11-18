"use client"

import { useState, useTransition } from "react"
import { Ban, Loader2, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { banUser, unbanUser } from "@/app/actions/admin"

export function BanUserButton({ userId, email, banned }: { userId: string; email: string; banned: boolean }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [isPending, startTransition] = useTransition()

  const report = (result: { success: boolean; error?: string }, done: string) => {
    if (result.success) {
      toast({ title: done, description: email })
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
  }

  if (banned) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => startTransition(async () => report(await unbanUser(userId), "User unbanned"))}
      >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Undo2 className="mr-2 h-4 w-4" />}
        Unban
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
          <Ban className="mr-2 h-4 w-4" />
          Ban
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban this user?</DialogTitle>
          <DialogDescription>
            {`${email} will be signed out immediately and won't be able to log in or sign up again with this email. You can undo this later.`}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            startTransition(async () => {
              const result = await banUser(userId, reason)
              report(result, "User banned")
              if (result.success) setOpen(false)
            })
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor={`ban-reason-${userId}`}>Reason (only visible to admins)</Label>
            <Input
              id={`ban-reason-${userId}`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Bot signup, disposable email"
              maxLength={500}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
              Ban user
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
