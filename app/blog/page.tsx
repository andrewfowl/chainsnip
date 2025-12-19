import Link from "next/link"
import { blogPosts } from "@/lib/blog-data"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, ArrowRight } from "lucide-react"

export default function BlogListPage() {
  const featuredPost = blogPosts.find((post) => post.featured)
  const regularPosts = blogPosts.filter((post) => !post.featured)

  return (
    <div className="relative min-h-screen text-foreground">
      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-4 drop-shadow-lg text-foreground leading-tight">
            The Innovation Nexus: <span className="text-primary">Insights & Intel</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Dive into a curated stream of strategic knowledge. Explore emergent techniques, visionary concepts, and the
            art of sustained creative momentum.
          </p>
        </div>

        {/* Featured Post Section */}
        {featuredPost && (
          <section className="mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8 text-center sm:text-left">
              Priority Transmission
            </h2>
            <Link href={`/blog/${featuredPost.slug}`} className="block group">
              <Card className="bg-card/85 backdrop-blur-lg border shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden hover:border-primary/50">
                <CardHeader className="p-0">
                  {/* Placeholder for a featured image if you add one */}
                  {/* <img src="/abstract-creative-flow.png" alt={featuredPost.title} className="w-full h-64 object-cover"/> */}
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  {" "}
                  {/* Increased padding */}
                  <CardTitle className="text-2xl sm:text-3xl text-primary group-hover:text-accent transition-colors mb-3">
                    {featuredPost.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1.5" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" />
                      {featuredPost.readTime} min read
                    </div>
                  </div>
                  <p className="text-foreground mb-4 leading-relaxed">{featuredPost.excerpt}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featuredPost.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border text-muted-foreground">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="inline-flex items-center text-secondary group-hover:text-primary font-semibold transition-colors">
                    Access Full Briefing{" "}
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </section>
        )}

        {/* Regular Posts Grid */}
        <section>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8 text-center sm:text-left">
            Knowledge Continuum
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regularPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
                <Card className="h-full bg-card/85 backdrop-blur-lg border shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col hover:border-secondary/50">
                  <CardContent className="p-6 flex-grow flex flex-col">
                    <CardTitle className="text-xl text-primary group-hover:text-accent transition-colors mb-2">
                      {post.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.readTime} min read
                      </div>
                    </div>
                    <p className="text-foreground text-sm mb-3 leading-relaxed flex-grow">{post.excerpt}</p>
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border text-muted-foreground">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
