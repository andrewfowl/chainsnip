import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Tag, Merge, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// This is a placeholder since we're storing merged posts in state
// In a real app, you would fetch this from a database
const getMergedPost = (slug: string) => {
  // In a real implementation, this would fetch from a database
  // For now, we'll show a placeholder
  return {
    title: `Creative Flow Fusion: ${slug.replace(/-/g, " ")}`,
    readTime: 12,
    mergedAt: new Date().toISOString(),
    tags: ["creativity", "fusion", "innovation", "design"],
    originalPosts: [
      { title: "The Art of Creative Flow", author: "Maya Chen" },
      { title: "Fluid Design Principles", author: "Alex Rivera" },
    ],
    content: `
    ## The Art of Creative Flow

    In the digital age, creativity flows like liquid inspiration through our minds. Understanding how to harness this flow is essential for any creative professional. When we allow our ideas to merge and blend naturally, we discover new possibilities that emerge from the intersection of different concepts.

    ## Fluid Design Principles

    Design is not static—it's a living, breathing entity that evolves through the merger of concepts. Like blobs in a lava lamp, our design ideas should flow together, creating something greater than the sum of their parts. This organic approach to design thinking opens up new avenues for innovation.
  `,
  }
}

interface MergedBlogPageProps {
  params: {
    slug: string
  }
}

export default function MergedBlogPage({ params }: MergedBlogPageProps) {
  const mergedPost = getMergedPost(params.slug)

  if (!mergedPost) {
    notFound()
  }

  return (
    <div className="relative min-h-screen text-foreground">
      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12">
        <article className="max-w-3xl mx-auto bg-card/85 backdrop-blur-lg p-6 sm:p-10 rounded-xl shadow-2xl">
          <Link
            href="/blog"
            className="inline-flex items-center text-secondary hover:text-primary transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Creative Insights
          </Link>

          <div className="mb-6">
            <Badge className="bg-accent/10 text-accent border-accent/30 mb-4">
              <Merge className="w-3 h-3 mr-1" />
              Fused Insight
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight drop-shadow-lg text-foreground">
              {mergedPost.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-6">
            <div className="flex items-center">
              <Merge className="w-4 h-4 mr-1.5 text-secondary" />
              <span>Fused Insight</span>
            </div>
            <div className="flex items-center">
              <CalendarDays className="w-4 h-4 mr-1.5 text-secondary" />
              <span>
                {new Date(mergedPost.mergedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-secondary" />
              <span>{mergedPost.readTime} min read</span>
            </div>
          </div>

          <div className="prose prose-invert prose-lg max-w-none text-foreground/90 leading-relaxed selection:bg-primary/30 selection:text-secondary">
            {/* This is a simplified content rendering. For real markdown, use a library like 'react-markdown'. */}
            {mergedPost.content.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-accent/30">
            <h3 className="text-foreground font-semibold mb-3 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {mergedPost.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-accent/50 text-muted-foreground hover:bg-accent/10 hover:border-accent transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-accent/30">
            <h3 className="text-foreground font-semibold mb-4">Original Articles</h3>
            <div className="space-y-3">
              {mergedPost.originalPosts.map((post, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <div>
                    <h4 className="font-medium text-foreground">{post.title}</h4>
                    <p className="text-sm text-muted-foreground">By {post.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
