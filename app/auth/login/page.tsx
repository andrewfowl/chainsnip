"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthFormContainer from "@/components/auth/auth-form-container"
import { useToast } from "@/hooks/use-toast"
import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react"
import { signIn } from "@/app/actions/auth"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
      setIsLoading(false)
      return
    }

    const result = await signIn(email, password)

    if (result.success) {
      toast({ title: "Success", description: "Welcome back!" })
      // Use window.location for full page navigation to ensure cookies are sent
      window.location.href = "/dashboard"
      return
    } else {
      toast({ title: "Error", description: result.error || "Login failed", variant: "destructive" })
    }

    setIsLoading(false)
  }

  return (
    <AuthFormContainer
      title="Welcome Back"
      description="Log in to access your balance snapshots."
      footerContent={
        <p>
          {"Don't have an account? "}
          <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
          Log In
        </Button>
      </form>
    </AuthFormContainer>
  )
}
