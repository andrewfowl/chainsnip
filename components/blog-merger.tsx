"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { MergedBlogPost } from "@/types/blog"
import { blogPosts } from "@/lib/blog-data"
import { Merge, Clock, User, Tag, ArrowRight, Info, Combine, Brain } from "lucide-react" // Added Combine, Brain
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { slugify } from "@/lib/utils"

export default function BlogMerger() {
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [mergedPosts, setMergedPosts] = useState<MergedBlogPost[]>([])

  const handlePostSelection = (postId: string, checked: boolean) => {
    if (checked) {
      setSelectedPosts((prev) => [...prev, postId])
    } else {
      setSelectedPosts((prev) => prev.filter((id) => id !== postId))
    }
  }

  const mergePosts = () => {
    if (selectedPosts.length < 2) return

    const postsToMerge = blogPosts.filter((post) => selectedPosts.includes(post.id))
    const mergedContent = postsToMerge.map((post) => `## ${post.title}\n\n${post.content}`).join("\n\n---\n\n") // Add titles to merged content
    const allTags = [...new Set(postsToMerge.flatMap((post) => post.tags))]
    const totalReadTime = postsToMerge.reduce((sum, post) => sum + post.readTime, 0)

    // Create a title for the merged post
    const mergedTitle = `Creative Flow Fusion: ${postsToMerge.map((p) => p.title.split(":")[0]).join(" + ")}`

    // Generate a slug for the merged post
    const mergedSlug = slugify(mergedTitle)

    const newMergedPost: MergedBlogPost = {
      id: `merged-${Date.now()}`,
      title: mergedTitle,
      slug: mergedSlug,
      content: mergedContent,
      excerpt: `A fusion of insights combining ${postsToMerge.length} perspectives on creative flow and digital innovation. Explore the combined wisdom from these articles.`,
      originalPosts: postsToMerge,
      mergedAt: new Date().toISOString(),
      tags: allTags,
      readTime: Math.ceil(totalReadTime * 0.85), // Adjusted read time
    }

    setMergedPosts((prev) => [newMergedPost, ...prev])
    setSelectedPosts([])
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4 leading-tight">
          Insight Synthesizer <Brain className="inline-block w-10 h-10 ml-2 text-primary" />
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Forge new paradigms by fusing existing knowledge. Select multiple articles to synthesize their core insights
          into a singular, powerful creative directive.
        </p>
      </div>

      {/* Merge Controls - Enhanced Section */}
      <div className="relative p-6 sm:p-8 rounded-xl bg-card/85 backdrop-blur-lg border shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full filter blur-3xl animate-pulse-glow animation-delay-2000"></div>
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary/10 rounded-full filter blur-3xl animate-pulse-glow animation-delay-4000"></div>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center justify-center">
          {" "}
          {/* Increased gap */}
          <div className="flex items-center gap-2 text-foreground">
            <span className="font-medium">{selectedPosts.length} articles selected for synthesis</span>
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <button className="p-1 rounded-full hover:bg-muted transition-colors">
                    <Info className="w-4 h-4 text-secondary" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-popover border text-popover-foreground">
                  <p>Select a minimum of two articles to initiate the insight synthesis process.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button
            onClick={mergePosts}
            disabled={selectedPosts.length < 2}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-105 group-hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Combine className="w-5 h-5 mr-2" /> {/* Changed Icon */}
            Synthesize Insights
          </Button>
        </div>
      </div>

      {/* Merged Posts Display */}
      {mergedPosts.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-foreground text-center">Your Synthesized Briefs</h3>
          {mergedPosts.map((mergedPost) => (
            <Card
              key={mergedPost.id}
              className="bg-card/85 backdrop-blur-lg border shadow-xl hover:shadow-2xl transition-shadow duration-300" // Removed pulse, added hover
            >
              <CardHeader>
                <Link href={`/blog/merged/${mergedPost.slug}`}>
                  <CardTitle className="text-foreground font-semibold text-xl mb-2 hover:text-primary transition-colors">
                    {mergedPost.title}
                  </CardTitle>
                </Link>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {mergedPost.readTime} min read
                  </div>
                  <div className="flex items-center gap-1">
                    <Merge className="w-4 h-4" />
                    {mergedPost.originalPosts.length} articles synthesized
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground">{mergedPost.excerpt}</p>
                <div className="flex flex-wrap gap-2">
                  {mergedPost.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-muted text-muted-foreground border">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold">Source Intel:</span>{" "}
                  {mergedPost.originalPosts.map((p) => p.title).join(", ")}
                </div>
                {/* Link to view merged content */}
                <Link
                  href={`/blog/merged/${mergedPost.slug}`}
                  className="inline-flex items-center text-primary hover:text-accent transition-colors group"
                >
                  <span className="transition-all duration-300 group-hover:underline">Access Synthesized Brief</span>
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Original Posts Selection */}
      <div className="grid gap-6 md:grid-cols-2">
        {blogPosts.map((post) => (
          <Card
            key={post.id}
            className="bg-card/85 backdrop-blur-lg border shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedPosts.includes(post.id)}
                  onCheckedChange={(checked) => handlePostSelection(post.id, checked as boolean)}
                  className="mt-1 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors"
                />
                <div className="flex-1">
                  <Link href={`/blog/${post.slug}`} className="group">
                    <CardTitle className="text-foreground font-semibold group-hover:text-primary text-lg mb-2 transition-colors">
                      {post.title}
                    </CardTitle>
                  </Link>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime} min read
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-grow flex flex-col">
              <p className="text-foreground text-sm leading-relaxed flex-grow">{post.excerpt}</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs border text-muted-foreground hover:bg-muted/50 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              {post.featured && (
                <Badge className="bg-primary/10 text-primary border-primary/30 mt-2 self-start">Featured Intel</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
