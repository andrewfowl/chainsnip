import Link from "next/link"
import { Wallet } from "lucide-react"

export default function Footer() {
  const year = new Date().getFullYear()

  const footerNav = {
    product: [
      { name: "Features", href: "/#features" },
      { name: "How It Works", href: "/#how-it-works" },
      { name: "Pricing", href: "/#pricing" },
    ],
    legal: [
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
    ],
  }

  return (
    <footer className="relative z-10 border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 text-base font-semibold text-foreground mb-4">
              <Wallet className="w-5 h-5" />
              <span className="tracking-tight">ChainShip</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Audit-ready balance snapshots from blockchain explorers for crypto accountants.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              {footerNav.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerNav.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">&copy; {year} ChainShip. All rights reserved.</p>
          <a
            href="mailto:hello@chainship.io"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            hello@chainship.io
          </a>
        </div>
      </div>
    </footer>
  )
}
