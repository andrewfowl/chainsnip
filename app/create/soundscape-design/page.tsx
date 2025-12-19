import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Music, Waves, Volume2, SlidersHorizontal, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function SoundscapeDesignPage() {
  const features = [
    {
      icon: Waves,
      title: "Immersive Audio Environments",
      description: "Design rich, spatial soundscapes that transport listeners to another world.",
    },
    {
      icon: Volume2,
      title: "Dynamic Sound Effects",
      description: "Craft impactful SFX that enhance interactivity and emotional resonance.",
    },
    {
      icon: Music,
      title: "Adaptive Musical Scores",
      description: "Compose music that intelligently reacts to in-experience events and user actions.",
    },
    {
      icon: SlidersHorizontal,
      title: "Advanced Mixing & Mastering",
      description: "Achieve professional audio quality with powerful mixing and mastering tools.",
    },
  ]

  return (
    <div className="relative min-h-screen text-foreground">
      <main className="relative z-10 container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <Music className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg text-foreground">
            Orchestrate Sonic Realities: <span className="text-primary">The Art of Auditory Immersion</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Design immersive soundscapes and adaptive audio that breathe life into your projects. From subtle ambiences
            to epic scores, shape the sound of experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12 sm:mb-16">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-card/85 backdrop-blur-lg border shadow-xl">
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
          <Link href="/projects/new?template=soundscape-design">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 py-5 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Compose Your Soundscape
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
