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
import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { signUp } from "@/app/actions/auth"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!name || !email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" })
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
      setIsLoading(false)
      return
    }

    if (!termsAccepted) {
      toast({ title: "Error", description: "Please accept the terms and conditions", variant: "destructive" })
      setIsLoading(false)
      return
    }

    const result = await signUp(email, password, name)

    if (result.success) {
      toast({ title: "Success", description: "Account created successfully!" })
      router.push("/dashboard")
    } else {
      toast({ title: "Error", description: result.error || "Signup failed", variant: "destructive" })
    }

    setIsLoading(false)
  }

  return (
    <AuthFormContainer
      title="Create Your Account"
      description="Start capturing balance snapshots in minutes."
      footerContent={
        <p>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-primary hover:underline">
            Log In
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" type="text" placeholder="John Doe" required disabled={isLoading} />
        </div>
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
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            required
            minLength={8}
            disabled={isLoading}
          />
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            disabled={isLoading}
          />
          <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground leading-tight">
            I agree to the{" "}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>
            {" and "}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
          Create Account
        </Button>
      </form>
    </AuthFormContainer>
  )
}
