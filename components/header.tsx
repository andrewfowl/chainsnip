"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { getCurrentUser, signOut } from "@/app/actions/auth"
import type { User } from "@/lib/auth"

export default function Header() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [pathname])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    window.location.href = "/"
  }

  const navItems = [
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#how-it-works", label: "How It Works" },
  ]

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto flex items-center justify-between px-4 h-full">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-semibold text-foreground hover:opacity-80 transition-opacity"
          >
            <Image src="/icon-512.png" alt="" width={28} height={28} className="h-7 w-7 rounded-md" priority />
            <span className="tracking-tight">ChainSnip</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="text-sm bg-foreground text-background hover:bg-foreground/90">
                  <Link href="/auth/signup">Get started</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 z-50 bg-background border-b border-border p-4 lg:hidden">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-border pt-4 mt-2 flex flex-col gap-2">
                {user ? (
                  <>
                    <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                      <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                        Sign in
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        Get started
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  )
}
