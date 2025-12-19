import Link from "next/link"
import type { BlogPost } from "@/types/blog"
import { Card, CardTitle, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface RelatedPostsProps {
  posts: BlogPost[]
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Expand Your Perspective</h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
            <Card className="h-full bg-card/90 backdrop-blur-md border shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col hover:border-secondary/50">
              <CardContent className="p-5 flex-grow flex flex-col">
                <CardTitle className="text-lg text-primary group-hover:text-accent transition-colors mb-2 leading-tight">
                  {post.title}
                </CardTitle>
                <p className="text-foreground/80 text-sm mb-3 leading-relaxed flex-grow line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-auto">
                  <Clock className="w-3 h-3 mr-1" />
                  {post.readTime} min read
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
