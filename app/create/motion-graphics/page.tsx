import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Film, Zap, TrendingUp, Clock, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function MotionGraphicsPage() {
  const features = [
    {
      icon: Zap,
      title: "Dynamic Animations",
      description: "Bring static designs to life with fluid movements and captivating transitions.",
    },
    {
      icon: TrendingUp,
      title: "Visual Storytelling",
      description: "Convey complex ideas and narratives through engaging animated sequences.",
    },
    {
      icon: Clock,
      title: "Timeline Control",
      description: "Master timing and easing to create perfectly orchestrated motion pieces.",
    },
    {
      icon: Film,
      title: "Effects & Compositing",
      description: "Add depth and polish with visual effects, particle systems, and advanced compositing.",
    },
  ]

  return (
    <div className="relative min-h-screen text-foreground">
      <main className="relative z-10 container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <Film className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg text-foreground">
            Commandeer Visual Dynamics: <span className="text-primary">Motion Redefined</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Create stunning motion graphics that captivate, inform, and inspire. From intricate title sequences to
            dynamic data visualizations, set your ideas in motion.
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
          <Link href="/projects/new?template=motion-graphics">
            <Button
              size="lg"
              className="bg-primary hover:bg-accent text-primary-foreground font-semibold px-10 py-5 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Animating Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
