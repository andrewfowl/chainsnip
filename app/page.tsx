import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Wallet,
  CalendarCheck,
  Shield,
  FileCheck,
  Clock,
  Link2,
  Check,
  ArrowRight,
  Building2,
  Scale,
} from "lucide-react"
import { SUPPORTED_EXPLORERS } from "@/lib/archives"

export default function HomePage() {
  const features = [
    {
      icon: CalendarCheck,
      title: "Month-End Snapshots",
      description: "Automatically capture wallet balances on the last day of each month for clean accounting periods.",
    },
    {
      icon: FileCheck,
      title: "Audit-Ready Proof",
      description: "Generate timestamped, verifiable screenshots of explorer pages that hold up to auditor scrutiny.",
    },
    {
      icon: Shield,
      title: "Tamper-Proof Records",
      description: "Each snapshot is hashed and timestamped. Prove your records haven't been altered after the fact.",
    },
    {
      icon: Link2,
      title: "Multi-Chain Support",
      description: "Works with Etherscan, BscScan, Solscan, and 15+ blockchain explorers across all major networks.",
    },
    {
      icon: Clock,
      title: "Historical Tracking",
      description: "Build a complete history of wallet balances over time. Perfect for quarterly and annual reporting.",
    },
    {
      icon: Building2,
      title: "Client Management",
      description: "Organize snapshots by client, wallet, or chain. Export reports for easy client delivery.",
    },
  ]

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "$0",
      period: "forever",
      description: "For individual accountants getting started",
      features: ["3 wallet addresses", "10 snapshots/month", "Manual captures only", "7-day retention", "Basic export"],
      cta: "Get Started",
      href: "/auth/signup",
      popular: false,
    },
    {
      id: "professional",
      name: "Professional",
      price: "$25",
      period: "per month",
      description: "For active crypto accountants",
      features: [
        "25 wallet addresses",
        "300 snapshots/month",
        "Auto month-end captures",
        "Unlimited retention",
        "PDF exports",
        "Priority support",
      ],
      cta: "Buy Now",
      href: "/checkout/professional",
      popular: true,
    },
    {
      id: "firm",
      name: "Firm",
      price: "$100",
      period: "per month",
      description: "For accounting firms & teams",
      features: [
        "Unlimited wallets",
        "Unlimited snapshots",
        "Team collaboration",
        "API access",
        "Custom branding",
        "Dedicated account manager",
        "SOC 2 compliance",
      ],
      cta: "Start Free Trial",
      href: "/checkout/firm",
      popular: false,
    },
    {
      id: "lifetime",
      name: "Lifetime",
      price: "$250",
      period: "one-time",
      description: "Pay once, use forever",
      features: [
        "25 wallet addresses",
        "300 snapshots/month",
        "Auto month-end captures",
        "Unlimited retention",
        "PDF exports",
        "Priority support",
        "All future updates",
        "No recurring fees",
      ],
      cta: "Get Lifetime Access",
      href: "/checkout/lifetime",
      popular: false,
      isLifetime: true,
    },
  ]

  const steps = [
    {
      step: "1",
      title: "Add Wallet URLs",
      description: "Paste explorer URLs for your client wallets from any supported chain",
    },
    {
      step: "2",
      title: "Set Month-End Schedule",
      description: "Enable automatic captures on the last day of each month",
    },
    {
      step: "3",
      title: "Download Proof",
      description: "Access timestamped snapshots anytime for audits and reporting",
    },
  ]

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-24 relative">
        {/* Subtle gradient glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/[0.08] rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center">
          {/* Announcement badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-card border border-border text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>Now supporting 15+ blockchain explorers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-foreground mb-8 tracking-tighter text-balance leading-[1.05]">
            Audit-Ready Crypto
            <br />
            <span className="text-muted-foreground">Balance Snapshots</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Automatically archive blockchain explorer pages at month-end.
            <br className="hidden sm:block" />
            Timestamped, verifiable proof for your clients.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-base px-8 h-14 font-medium bg-foreground text-background hover:bg-foreground/90">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                size="lg"
                variant="ghost"
                className="text-base px-8 h-14 font-medium text-muted-foreground hover:text-foreground"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Value Props */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { 
              title: "Automated Capture", 
              description: "Schedule month-end snapshots automatically. No manual screenshots needed."
            },
            { 
              title: "Verifiable Proof", 
              description: "Each snapshot is timestamped and hashed for tamper-proof audit trails."
            },
            { 
              title: "Multi-Chain Ready", 
              description: "Works with Ethereum, BSC, Solana, and 15+ blockchain explorers."
            },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-border">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-6 font-medium">
            Works with all major blockchain explorers
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {SUPPORTED_EXPLORERS.slice(0, 6).map((explorer) => (
              <div key={explorer.name} className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="w-4 h-4" />
                <span className="text-sm font-medium">{explorer.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Features</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 tracking-tight">
              Built for crypto accounting workflows
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Stop manually screenshotting explorer pages. ChainShip automates balance verification so you can focus on your clients.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl">
            {features.map((feature) => (
              <div key={feature.title} className="group">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 tracking-tight">
              Three simple steps
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Capture audit-ready proof in minutes, not hours
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden max-w-4xl">
            {steps.map((item) => (
              <div key={item.step} className="bg-card p-8">
                <span className="text-5xl font-light text-muted-foreground/30 mb-4 block">{item.step}</span>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Use Cases</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 tracking-tight">
              Perfect for every crypto accounting need
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
            <div className="p-6 rounded-2xl bg-card border border-border">
              <Scale className="w-8 h-8 text-foreground mb-4" />
              <h3 className="text-base font-semibold text-foreground mb-2">Tax Preparation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Document year-end balances across all client wallets for accurate tax reporting.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border">
              <FileCheck className="w-8 h-8 text-foreground mb-4" />
              <h3 className="text-base font-semibold text-foreground mb-2">Financial Audits</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Provide auditors with timestamped proof of on-chain balances.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border">
              <Building2 className="w-8 h-8 text-foreground mb-4" />
              <h3 className="text-base font-semibold text-foreground mb-2">Fund Administration</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Track NAV calculations with verified balance snapshots.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-medium text-accent mb-3 uppercase tracking-wider">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Start free, scale as your practice grows
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 rounded-2xl ${
                  plan.popular 
                    ? "bg-foreground text-background" 
                    : "bg-card border border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-6">
                    <span className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                      Popular
                    </span>
                  </div>
                )}
                {plan.isLifetime && (
                  <div className="absolute -top-3 left-6">
                    <span className="px-3 py-1 text-xs font-medium bg-accent text-accent-foreground rounded-full">
                      Best Value
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-1 ${plan.popular ? "text-background" : "text-foreground"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${plan.popular ? "text-background/70" : "text-muted-foreground"}`}>
                    {plan.description}
                  </p>
                </div>
                
                <div className="mb-6">
                  <span className={`text-4xl font-semibold ${plan.popular ? "text-background" : "text-foreground"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.popular ? "text-background/70" : "text-muted-foreground"}`}>
                    {plan.period === "one-time" ? " once" : `/${plan.period.replace("per ", "")}`}
                  </span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? "text-background" : "text-accent"}`} />
                      <span className={plan.popular ? "text-background/80" : "text-muted-foreground"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href={plan.href} className="block">
                  <Button
                    className={`w-full h-11 font-medium ${
                      plan.popular
                        ? "bg-background text-foreground hover:bg-background/90"
                        : "bg-secondary hover:bg-secondary/80 text-foreground"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 tracking-tight">
              Ready to simplify crypto accounting?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Start capturing audit-ready balance snapshots today.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="text-base px-8 h-14 font-medium bg-foreground text-background hover:bg-foreground/90">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
