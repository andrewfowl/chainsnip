import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
      {/* Hero Section - Updated styling for new aesthetic */}
      <section className="container mx-auto px-4 pt-24 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-secondary text-muted-foreground border-border rounded-full px-4 py-1.5">
            Trusted by 500+ crypto accounting professionals
          </Badge>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight text-balance">
            Audit-ready crypto balance snapshots.
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto font-medium">
            Automatically archive blockchain explorer pages at month-end. Get timestamped, verifiable proof of wallet
            balances for your clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-base px-8 rounded-full h-14 font-medium">
                Start Capturing Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 rounded-full h-14 font-medium border-border bg-transparent"
              >
                See How It Works
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {[
            { value: "1.2M+", label: "Snapshots Captured" },
            { value: "500+", label: "Accountants" },
            { value: "15+", label: "Explorers Supported" },
            { value: "100%", label: "Audit Pass Rate" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
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
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Built for crypto accounting workflows
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
              Stop manually screenshotting explorer pages. ChainShip automates balance verification so you can focus on
              your clients.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 ring-1 ring-white/10">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">How It Works</h2>
            <p className="text-lg text-muted-foreground font-medium">Capture audit-ready proof in three simple steps</p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Connecting line - visible on desktop */}
            <div className="hidden md:block relative">
              <div className="absolute top-10 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
              {steps.map((item, index) => (
                <div key={item.step} className="relative group">
                  {/* Card container */}
                  <div className="bg-card border border-border rounded-2xl p-8 h-full transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                    {/* Step number badge */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 w-16 h-16 rounded-full bg-primary/20 blur-xl group-hover:bg-primary/30 transition-colors" />
                        {/* Number circle */}
                        <div className="relative w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold ring-4 ring-background">
                          {item.step}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Arrow connector for mobile */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center my-4 md:hidden">
                      <ArrowRight className="w-6 h-6 text-primary/50" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Perfect for every crypto accounting need
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-card border-border">
              <CardHeader>
                <Scale className="w-10 h-10 text-primary mb-2" />
                <CardTitle className="text-foreground">Tax Preparation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Document year-end balances across all client wallets for accurate tax reporting and IRS compliance.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <FileCheck className="w-10 h-10 text-primary mb-2" />
                <CardTitle className="text-foreground">Financial Audits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Provide auditors with timestamped proof of on-chain balances that meets professional standards.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <Building2 className="w-10 h-10 text-primary mb-2" />
                <CardTitle className="text-foreground">Fund Administration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track NAV calculations with verified balance snapshots for crypto funds and DAOs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground font-medium">Start free, scale as your practice grows</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative bg-card ${plan.popular ? "border-primary ring-1 ring-primary" : plan.isLifetime ? "border-accent ring-1 ring-accent" : "border-border"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground rounded-full px-4">Most Popular</Badge>
                  </div>
                )}
                {plan.isLifetime && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground rounded-full px-4">Best Value</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl text-foreground">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period === "one-time" ? "" : `/${plan.period}`}</span>
                    {plan.period === "one-time" && (
                      <div className="text-sm text-accent font-medium mt-1">one-time payment</div>
                    )}
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className="block">
                    <Button
                      className={`w-full rounded-full h-12 font-medium ${
                        plan.popular
                          ? ""
                          : plan.isLifetime
                            ? "bg-accent hover:bg-accent/80 text-accent-foreground"
                            : "bg-secondary hover:bg-secondary/80 text-foreground"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Ready to simplify crypto accounting?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto font-medium">
              Join hundreds of accountants who trust ChainShip for audit-ready balance verification.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="text-base px-8 rounded-full h-14 font-medium">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
