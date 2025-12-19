import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Lightbulb, GitBranch, Users, Edit3, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function InteractiveStoryPage() {
  const features = [
    {
      icon: GitBranch,
      title: "Branching Narratives",
      description: "Create complex storylines with multiple paths and endings based on user choices.",
    },
    {
      icon: Users,
      title: "Character Development",
      description: "Design dynamic characters whose arcs evolve with the player's interactions.",
    },
    {
      icon: Edit3,
      title: "Choice-Driven Mechanics",
      description: "Implement meaningful choices that have tangible consequences within the story.",
    },
    {
      icon: Lightbulb,
      title: "World Building Tools",
      description: "Craft rich, immersive worlds with detailed lore and interactive environments.",
    },
  ]

  return (
    <div className="relative min-h-screen text-foreground">
      <main className="relative z-10 container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <Lightbulb className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg text-foreground">
            Architect Immersive Narrative Universes
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Craft compelling narratives where every choice matters. Build immersive worlds and stories that respond to
            the audience, creating unique, personal experiences.
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
          <Link href="/projects/new?template=interactive-story">
            <Button
              size="lg"
              className="bg-primary hover:bg-accent text-primary-foreground font-semibold px-10 py-5 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Embark on Your Narrative Creation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
