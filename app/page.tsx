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
        
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Announcement badge */}
          <Link 
            href="#features"
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-card border border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all duration-300 group"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>Now supporting 15+ blockchain explorers</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-foreground mb-8 tracking-tighter text-balance leading-[1.05]">
            Audit-Ready Crypto
            <br />
            <span className="text-muted-foreground">Balance Snapshots</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed text-pretty">
            Automatically archive blockchain explorer pages at month-end.
            <br className="hidden sm:block" />
            Timestamped, verifiable proof for your clients.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-base px-8 h-14 font-medium bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.02] transition-all duration-200 group">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto stagger-children">
          {[
            { 
              title: "Automated Capture", 
              description: "Schedule month-end snapshots automatically. No manual screenshots needed.",
              icon: CalendarCheck,
            },
            { 
              title: "Verifiable Proof", 
              description: "Each snapshot is timestamped and hashed for tamper-proof audit trails.",
              icon: Shield,
            },
            { 
              title: "Multi-Chain Ready", 
              description: "Works with Ethereum, BSC, Solana, and 15+ blockchain explorers.",
              icon: Link2,
            },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-border hover-lift group">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof - Balanced centered layout */}
      <section className="py-16 border-y border-border bg-card/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-wider font-medium">
            Works with all major blockchain explorers
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 max-w-4xl mx-auto">
            {SUPPORTED_EXPLORERS.slice(0, 6).map((explorer) => (
              <div 
                key={explorer.name} 
                className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Wallet className="w-4 h-4 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm font-medium">{explorer.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          {/* Two-column layout for better balance */}
          <div className="grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
            {/* Left: Header content */}
            <div className="lg:sticky lg:top-32">
              <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Features</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 tracking-tight text-balance">
                Built for crypto accounting workflows
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Stop manually screenshotting explorer pages. ChainShip automates balance verification so you can focus on your clients.
              </p>
              <Link href="/auth/signup">
                <Button className="bg-foreground text-background hover:bg-foreground/90 group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Right: Feature grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, i) => (
                <div 
                  key={feature.title} 
                  className="p-5 rounded-xl border border-border bg-card/50 hover:border-primary/30 hover:bg-card transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                    <feature.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          {/* Centered header for visual balance */}
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 tracking-tight">
              Three simple steps
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Capture audit-ready proof in minutes, not hours
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((item, i) => (
              <div key={item.step} className="relative group">
                {/* Connecting line between steps */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary font-semibold text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          {/* Centered header */}
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Use Cases</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 tracking-tight">
              Perfect for every crypto accounting need
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Scale, title: "Tax Preparation", description: "Document year-end balances across all client wallets for accurate tax reporting." },
              { icon: FileCheck, title: "Financial Audits", description: "Provide auditors with timestamped proof of on-chain balances." },
              { icon: Building2, title: "Fund Administration", description: "Track NAV calculations with verified balance snapshots." },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border hover-lift group">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <item.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          {/* Centered header */}
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-sm font-medium text-accent mb-3 uppercase tracking-wider">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Start free, scale as your practice grows
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 rounded-2xl transition-all duration-300 ${
                  plan.popular 
                    ? "bg-foreground text-background scale-[1.02] shadow-2xl shadow-primary/10" 
                    : "bg-card border border-border hover:border-primary/30"
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
      <section className="py-24 border-t border-border relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.05] rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 tracking-tight">
              Ready to simplify crypto accounting?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Start capturing audit-ready balance snapshots today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="text-base px-8 h-14 font-medium bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.02] transition-all duration-200 group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="text-base px-8 h-14 font-medium border-border hover:border-primary/50">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
