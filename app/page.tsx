import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, CalendarCheck, FileCheck, Shield, Link2, Clock, Building2 } from "lucide-react"
import { SUPPORTED_EXPLORERS } from "@/lib/chains"
import { StripePricingTable } from "@/components/stripe-pricing-table"

export default function HomePage() {
  const features = [
    {
      icon: CalendarCheck,
      title: "Month-end snapshots",
      description: "Captures wallet balances on the last day of each month, on schedule, without anyone touching a browser.",
    },
    {
      icon: FileCheck,
      title: "Audit-ready proof",
      description: "Every capture is a timestamped screenshot of the live explorer page, framed for an auditor to read at a glance.",
    },
    {
      icon: Shield,
      title: "Tamper-evident hashing",
      description: "A SHA-256 hash is recorded at capture time. Re-hash the file later to prove it was never edited.",
    },
    {
      icon: Link2,
      title: "Multi-chain coverage",
      description: "Etherscan, BscScan, Solscan, and 15+ other explorers across EVM, Solana, Bitcoin, and Cosmos.",
    },
    {
      icon: Clock,
      title: "Historical record",
      description: "A dated ledger of balances that stands up for quarterly reviews and year-end reporting.",
    },
    {
      icon: Building2,
      title: "Organized by client",
      description: "Group captures by client, wallet, or chain, and export the set you need for delivery.",
    },
  ]

  const steps = [
    { title: "Add wallet URLs", description: "Paste explorer links for each client wallet from any supported chain." },
    { title: "Set the schedule", description: "Turn on month-end capture and step away. It runs on the last day, every month." },
    { title: "Hand over proof", description: "Download timestamped, hashed snapshots whenever an audit or filing needs them." },
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://chainsnip.com/#organization",
        name: "ChainSnip",
        url: "https://chainsnip.com",
        logo: "https://chainsnip.com/icon-dark-32x32.png",
      },
      {
        "@type": "WebSite",
        "@id": "https://chainsnip.com/#website",
        url: "https://chainsnip.com",
        name: "ChainSnip",
        publisher: { "@id": "https://chainsnip.com/#organization" },
      },
      {
        "@type": "SoftwareApplication",
        name: "ChainSnip",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        url: "https://chainsnip.com",
        description:
          "Automatically capture and archive blockchain explorer pages with wallet balances at month-end. Timestamped, verifiable proof for crypto accountants, auditors, and financial professionals.",
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: "0",
        },
      },
    ],
  }

  return (
    <div className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 pt-32 pb-16 lg:pt-40 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            {/* Left: copy */}
            <div>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl text-foreground uppercase text-balance">
                Prove what a wallet held, on any date.
              </h1>
              <p className="mt-8 text-lg text-muted-foreground max-w-lg leading-relaxed text-pretty">
                ChainSnip archives blockchain explorer pages at month-end and stamps each one with a timestamp and
                cryptographic hash. Evidence your auditor cannot argue with.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/auth/signup">
                  <Button size="lg" className="group w-full sm:w-auto">
                    Get started
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    How it works
                  </Button>
                </Link>
              </div>
              <p className="mt-8 font-mono text-xs text-muted-foreground">
                Etherscan · BscScan · Solscan · {SUPPORTED_EXPLORERS.length - 3}+ more explorers
              </p>
            </div>

            {/* Right: evidence specimen — the signature element */}
            <div className="relative">
              <div className="rounded-[2.5rem] bg-card overflow-hidden font-mono text-sm p-2">
                {/* Record header */}
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Snapshot Record</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sulfur px-3 py-1 text-foreground text-xs">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                    Verified
                  </span>
                </div>
                {/* Captured explorer content (stylized) */}
                <div className="px-5 pb-5 space-y-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-muted-foreground text-xs">Address</span>
                    <span className="text-foreground truncate">0x742d35Cc6634C0532925a3b8D4a8fF</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-muted-foreground text-xs">ETH Balance</span>
                    <span className="text-foreground">1,284.5091 ETH</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-muted-foreground text-xs">USDC</span>
                    <span className="text-foreground">2,410,882.00</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-muted-foreground text-xs">Source</span>
                    <span className="text-foreground">etherscan.io</span>
                  </div>
                </div>
                {/* Proof footer */}
                <div className="rounded-[2rem] bg-foreground text-background p-5 grid grid-cols-1 gap-2.5 text-xs [&_.text-foreground]:text-background [&_.text-muted-foreground]:text-background/60">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-muted-foreground">Captured</span>
                    <span className="text-foreground">2025-05-31 23:59:00 UTC</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-muted-foreground">SHA-256</span>
                    <span className="text-foreground truncate">f8a9c2e4…7b31d0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explorer support strip */}
      <section className="border-b border-border bg-secondary/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 max-w-4xl mx-auto">
            {SUPPORTED_EXPLORERS.slice(0, 9).map((explorer) => (
              <span key={explorer.name} className="font-mono text-xs text-muted-foreground">
                {explorer.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features — document-style index */}
      <section id="features" className="border-b border-border">
        <div className="container mx-auto px-4 py-24">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 max-w-6xl mx-auto">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <h2 className="text-3xl sm:text-4xl text-foreground uppercase text-balance">
                Built for the way accountants defend a number
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Stop screenshotting explorer pages by hand. ChainSnip turns balance verification into a repeatable,
                defensible record.
              </p>
              <Link href="/auth/signup" className="inline-block mt-6">
                <Button className=" group">
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>

            <dl className="lg:col-span-2 border-t border-border">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className="grid grid-cols-[auto_1fr_auto] items-start gap-4 sm:gap-6 py-6 border-b border-border group"
                >
                  <span className="font-mono text-xs text-muted-foreground pt-1 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <dt className="text-base font-semibold text-foreground">{feature.title}</dt>
                    <dd className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-md">
                      {feature.description}
                    </dd>
                  </div>
                  <feature.icon className="h-5 w-5 text-muted-foreground/60 group-hover:text-foreground transition-colors mt-0.5" />
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-b border-border bg-secondary/20">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl text-foreground uppercase max-w-xl">
              From wallet link to audit evidence in three steps
            </h2>
            <div className="mt-12 grid md:grid-cols-3 border-t border-border">
              {steps.map((item, i) => (
                <div
                  key={item.title}
                  className="py-8 md:py-10 md:px-8 md:first:pl-0 border-b md:border-b-0 md:border-r last:border-r-0 border-border"
                >
                  <span className="font-mono text-sm text-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl text-foreground uppercase max-w-xl">
              Accountants who care about evidence
            </h2>
            <div className="mt-12 grid md:grid-cols-2 gap-px bg-border border border-border rounded-lg overflow-hidden">
              {[
                {
                  quote:
                    "Auditors stopped questioning our balance verification. We show them the timestamped proof and they move on. Saves us three hours per client.",
                  name: "Jennifer Martinez",
                  role: "Partner, Pinnacle Accounting",
                },
                {
                  quote:
                    "Finally, defensible proof that I captured balances when I said I did. The hash verification takes away all doubt.",
                  name: "David Kim",
                  role: "Solo CPA, Crypto Tax Practice",
                },
              ].map((t) => (
                <figure key={t.name} className="bg-card p-8 flex flex-col justify-between">
                  <blockquote className="text-foreground leading-relaxed text-pretty">{t.quote}</blockquote>
                  <figcaption className="mt-6">
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b border-border">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-xl mb-12">
              <h2 className="text-3xl sm:text-4xl text-foreground uppercase">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">Start free, scale as your practice grows.</p>
            </div>
            <StripePricingTable />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl sm:text-4xl text-foreground uppercase text-balance">
                Start building the record before your next close.
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Capture your first audit-ready balance snapshot today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="group"
                >
                  Get started free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline">
                  View pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
