"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Camera, History } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/dashboard", label: "Snapshots", icon: Camera, match: (p: string) => p === "/dashboard" || p.startsWith("/dashboard/archive") },
  { href: "/dashboard/historical-balance", label: "Balance Lookup", icon: History, match: (p: string) => p.startsWith("/dashboard/historical-balance") },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Dashboard sections" className="mb-8 border-b border-border">
      <ul className="flex gap-1 -mb-px overflow-x-auto">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "border-foreground text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
