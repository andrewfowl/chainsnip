import { blogPosts } from "@/lib/blog-data"
import { Badge } from "@/components/ui/badge"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, User, Tag, CalendarDays } from "lucide-react"
import { slugify } from "@/lib/utils"
import { getRelatedPosts } from "@/lib/blog-utils" // Import the utility function
import RelatedPosts from "@/components/blog/related-posts" // Import the new component

interface BlogPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }))
}

export default function BlogPage({ params }: BlogPageProps) {
  const post = blogPosts.find((p) => p.slug === params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedPosts(post) // Get related posts

  return (
    <div className="relative min-h-screen text-foreground">
      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16">
        <article className="max-w-3xl mx-auto bg-card/85 backdrop-blur-lg p-6 sm:p-10 rounded-xl shadow-2xl border">
          <Link
            href="/blog"
            className="inline-flex items-center text-secondary hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Return to Innovation Nexus
          </Link>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg text-foreground">
            {post.title.split(":")[0]}
            {post.title.includes(":") && (
              <>
                <span className="block text-primary text-2xl sm:text-3xl lg:text-4xl mt-2">
                  {post.title.substring(post.title.indexOf(":") + 1).trim()}
                </span>
              </>
            )}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-8">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1.5 text-secondary" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center">
              <CalendarDays className="w-4 h-4 mr-1.5 text-secondary" />
              <span>
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-secondary" />
              <span>{post.readTime} min read</span>
            </div>
          </div>

          {post.featured && (
            <Badge className="bg-primary/10 text-primary border-primary/30 mb-8 text-sm px-3 py-1">
              Priority Briefing
            </Badge>
          )}

          <div className="prose prose-invert prose-stark prose-lg max-w-none text-foreground leading-relaxed selection:bg-primary/30 selection:text-primary-foreground">
            {post.content.split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-4 text-balance">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Key Intel Tags:
            </h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/blog/tags/${slugify(tag)}`}>
                  <Badge
                    variant="outline"
                    className="border text-muted-foreground hover:bg-muted/50 hover:border-secondary transition-colors px-3 py-1"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          {/* Render RelatedPosts component */}
          <RelatedPosts posts={relatedPosts} />
        </article>
      </div>
    </div>
  )
}
