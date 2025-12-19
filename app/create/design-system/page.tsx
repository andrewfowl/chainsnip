import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Palette, Layers, Type, Grid, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DesignSystemPage() {
  const features = [
    {
      icon: Palette,
      title: "Unified Color Palettes",
      description: "Define and manage harmonious color schemes that reflect your brand's essence.",
    },
    {
      icon: Type,
      title: "Typography Scales",
      description: "Establish consistent and accessible typographic hierarchies for all your content.",
    },
    {
      icon: Grid,
      title: "Component Libraries",
      description: "Build reusable UI components for rapid, consistent development across projects.",
    },
    {
      icon: Layers,
      title: "Layout & Spacing Grids",
      description: "Implement robust grid systems and spacing rules for visually balanced interfaces.",
    },
  ]

  return (
    <div className="relative min-h-screen text-foreground">
      <main className="relative z-10 container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <Palette className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg text-foreground">
            Engineer Your Brand's <span className="text-primary">Digital DNA</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Orchestrate a design system that embodies your brand's innovation and streamlines your creative process.
            Define the core elements of your digital identity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12 sm:mb-16">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-card/85 backdrop-blur-lg border-accent/30 shadow-xl">
              <CardHeader className="flex flex-row items-center gap-4">
                <feature.icon className="w-8 h-8 text-secondary" />
                <CardTitle className="text-foreground font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/projects/new?template=design-system">
            <Button
              size="lg"
              className="bg-primary hover:bg-accent text-primary-foreground font-semibold px-10 py-5 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Building Your Design System
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
