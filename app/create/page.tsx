import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Lightbulb, Palette, Film, Music, Brain, Merge, Cpu, DatabaseZap, Workflow, Rocket } from "lucide-react" // Atom for Sparkles, more specific icons
import Link from "next/link"

export default function CreatePage() {
  const creationOptions = [
    {
      title: "Visualize Ideas",
      description: "Map concepts, brainstorm, and see connections.",
      icon: Brain,
      href: "/showcase", // Links to React Flow showcase
    },
    {
      title: "Design System",
      description: "Craft a unique visual identity and design language.",
      icon: Palette,
      href: "/create/design-system",
    },
    {
      title: "Interactive Story",
      description: "Weave narratives that adapt to user choices.",
      icon: Lightbulb,
      href: "/create/interactive-story",
    },
    {
      title: "Motion Graphics",
      description: "Animate visuals that captivate and explain.",
      icon: Film,
      href: "/create/motion-graphics",
    },
    {
      title: "Soundscape Design",
      description: "Compose audio experiences that immerse.",
      icon: Music,
      href: "/create/soundscape-design",
    },
    {
      title: "Merge & Fuse Insights",
      description: "Combine existing articles into new creative visions.",
      icon: Merge,
      href: "/#blog-merger-section", // Link to the section on the homepage
    },
    {
      title: "AI Co-Pilot",
      description: "Leverage intelligent assistance for complex creative tasks.",
      icon: Cpu,
      href: "/create/ai-copilot", // Placeholder
    },
    {
      title: "Data Synthesis Engine",
      description: "Transform raw data into actionable creative intelligence.",
      icon: DatabaseZap,
      href: "/create/data-synthesis", // Placeholder
    },
    {
      title: "Custom Workflow Builder",
      description: "Design and automate your unique creative pipelines.",
      icon: Workflow,
      href: "/create/workflow-builder", // Placeholder
    },
  ]

  return (
    <div className="relative min-h-screen text-foreground">
      <main className="relative z-10 container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16 sm:mb-20">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 drop-shadow-lg text-foreground leading-tight">
            The Alchemist's Workshop: <span className="text-primary">Forge Your Creation</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Select your crucible. Empower your vision with specialized toolsets designed to transform raw ideas into
            refined, impactful digital experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {" "}
          {/* Increased gap */}
          {creationOptions.map((option) => (
            <Link key={option.title} href={option.href} className="block group">
              <Card className="h-full bg-card/85 backdrop-blur-lg border shadow-xl hover:shadow-2xl hover:border-primary/70 transition-all duration-300 flex flex-col p-2">
                {" "}
                {/* Added padding to card itself */}
                <CardHeader className="items-center text-center pt-6">
                  {" "}
                  {/* Increased padding top */}
                  <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:scale-110 transition-transform border-2 border-primary/20">
                    <option.icon className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="text-foreground font-semibold group-hover:text-primary transition-colors">
                    {option.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center flex-grow px-6 pb-6">
                  {" "}
                  {/* Added horizontal padding */}
                  <p className="text-muted-foreground text-sm leading-relaxed">{option.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-20">
          {" "}
          {/* Increased margin */}
          <p className="text-muted-foreground mb-6 text-lg">Ready to deploy your next innovation?</p>
          <Link href="/projects/new">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-12 py-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-accent/40 text-base" // Enhanced CTA
            >
              <Rocket className="w-6 h-6 mr-3" />
              Initiate Project Genesis
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
