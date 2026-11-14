import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, CalendarCheck, FileCheck, Shield, Link2, Clock, Building2 } from "lucide-react"
import { NetworkCoverage, NETWORK_COUNT } from "@/components/network-coverage"
import { StripePricingTable } from "@/components/stripe-pricing-table"
import { TaglineReveal } from "@/components/tagline-reveal"
import { ProductHuntCard } from "@/components/product-hunt-card"
import { serializeJsonForScript } from "@/lib/safe-url"

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
      description:
        "Ethereum, Arc, Monad, Solana, the main Cosmos chains and more, from Etherscan, Solscan, Mintscan and other explorers.",
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
        dangerouslySetInnerHTML={{ __html: serializeJsonForScript(jsonLd) }}
      />
      {/* Hero */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 pt-32 pb-16 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            {/* Left: copy */}
            <div>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl text-foreground uppercase text-balance">
                Prove what a wallet held, on any date.
              </h1>
              <p className="mt-8 text-lg text-muted-foreground max-w-lg leading-relaxed text-pretty">
                ChainSnip archives blockchain explorer pages at month-end and stamps each one with a timestamp and
                cryptographic hash. Evidence your auditor cannot argue with.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="group w-full sm:w-auto">
                  <Link href="/auth/signup">
                    Get started free
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link href="#how-it-works">How it works</Link>
                </Button>
              </div>
              <Link
                href="#networks"
                className="mt-8 inline-block font-mono text-sm md:text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {NETWORK_COUNT} networks · EVM · Solana · Cosmos · Bitcoin
              </Link>
              <ProductHuntCard className="mt-8" />
              <a
                href="https://www.producthunt.com/products/chainsnip?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-chainsnip"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="ChainSnip - Accountant's Proof of the Wallet's Balance | Product Hunt"
                  width={250}
                  height={54}
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1265615&theme=light&t=1790770572520"
                />
              </a>
            </div>

            {/* Right: evidence specimen — the signature element */}
            <div className="relative">
              <div className="rounded-[2.5rem] bg-card overflow-hidden font-mono text-base md:text-sm p-2">
                {/* Record header */}
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm md:text-xs uppercase tracking-widest text-muted-foreground">Snapshot Record</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-sulfur px-4 py-2 text-foreground text-sm md:text-xs">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                    Verified
                  </span>
                </div>
                {/* Captured explorer content (stylized) */}
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-muted-foreground text-sm md:text-xs">Address</span>
                    <span className="text-foreground truncate">0x742d35Cc6634C0532925a3b8D4a8fF</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-muted-foreground text-sm md:text-xs">ETH Balance</span>
                    <span className="text-foreground">1,284.5091 ETH</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-muted-foreground text-sm md:text-xs">USDC</span>
                    <span className="text-foreground">2,410,882.00</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-muted-foreground text-sm md:text-xs">Source</span>
                    <span className="text-foreground">etherscan.io</span>
                  </div>
                </div>
                {/* Proof footer */}
                <div className="rounded-[2rem] bg-foreground text-background p-4 grid grid-cols-1 gap-2 text-sm md:text-xs [&_.text-foreground]:text-background [&_.text-muted-foreground]:text-background/75">
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

      <NetworkCoverage />

      <TaglineReveal />

      {/* Historical balance lookup */}
      <section id="balance-lookup" className="border-b border-border scroll-mt-20">
        <div className="container mx-auto px-4 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <span className="font-mono text-sm md:text-xs uppercase tracking-widest text-muted-foreground">
                Historical balances
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl text-foreground uppercase text-balance">
                Missed a month-end? Look it up.
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed text-pretty">
                Pick a network, a wallet and a date. ChainSnip reads the exact balance from archive nodes at that block,
                so you can rebuild a period-end figure long after the fact.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Any past date or block height, on EVM networks (including Arc and Monad), Solana and the main Cosmos chains",
                  "Rebasing tokens like stETH, where balances move without transactions",
                  "Results filed by client, ready to export as CSV",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2 text-base md:text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="group mt-8">
                <Link href="/auth/signup">
                  Start looking up balances
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <div className="rounded-[2.5rem] bg-card font-mono text-base md:text-sm p-2" aria-hidden="true">
              <div className="grid grid-cols-3 gap-4 p-4 text-sm md:text-xs">
                <div>
                  <p className="text-muted-foreground">Network</p>
                  <p className="mt-2 text-foreground">Ethereum</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="mt-2 text-foreground">2025-12-31</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Client</p>
                  <p className="mt-2 text-foreground truncate">Acme Holdings</p>
                </div>
              </div>
              <div className="rounded-[2rem] bg-background p-4 space-y-2">
                {[
                  ["ETH", "412.0837"],
                  ["stETH", "1,029.4412"],
                  ["USDC", "880,120.55"],
                ].map(([token, amount]) => (
                  <div key={token} className="flex items-baseline justify-between gap-4">
                    <span className="text-muted-foreground text-sm md:text-xs">{token}</span>
                    <span className="text-foreground">{amount}</span>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-4 border-t border-border pt-2 text-sm md:text-xs">
                  <span className="text-muted-foreground">Block</span>
                  <span className="text-foreground">#24,136,902</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features — document-style index */}
      <section id="features" className="border-b border-border">
        <div className="container mx-auto px-4 py-24">
          <div className="grid lg:grid-cols-3 gap-16 max-w-6xl mx-auto">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <h2 className="text-3xl sm:text-4xl text-foreground uppercase text-balance">
                Built for the way accountants defend a number
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Stop screenshotting explorer pages by hand. ChainSnip turns balance verification into a repeatable,
                defensible record.
              </p>
              <Button asChild className="group mt-8">
                <Link href="/auth/signup">
                  Get started free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <dl className="lg:col-span-2 border-t border-border">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className="grid grid-cols-[auto_1fr_auto] items-start gap-4 py-8 border-b border-border group"
                >
                  <span className="font-mono text-sm md:text-xs text-muted-foreground pt-1 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <dt className="text-base font-semibold text-foreground">{feature.title}</dt>
                    <dd className="mt-2 text-base md:text-sm text-muted-foreground leading-relaxed max-w-md">
                      {feature.description}
                    </dd>
                  </div>
                  <feature.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors mt-0.5" aria-hidden="true" />
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
            <div className="mt-16 grid md:grid-cols-3 border-t border-border">
              {steps.map((item, i) => (
                <div
                  key={item.title}
                  className="py-8 md:px-8 md:first:pl-0 border-b md:border-b-0 md:border-r last:border-r-0 border-border"
                >
                  <span className="font-mono text-base md:text-sm text-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-base md:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
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
            <div className="mt-16 grid md:grid-cols-3 gap-px bg-border border border-border rounded-lg overflow-hidden">
              {[
                {
                  quote:
                    "I've been using ChainSnip and I can't believe that there wasn't an app made before. I find it really helpful to use during month-ends.",
                  name: "Dane Balatbat, CPA, CTT",
                  role: "Accounting Manager, Blockchain at Aprio",
                },
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
                  <figcaption className="mt-8">
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-base md:text-sm text-muted-foreground">{t.role}</p>
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
            <div className="max-w-xl mb-16">
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
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Button asChild size="lg" className="group">
                <Link href="/auth/signup">
                  Get started free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
