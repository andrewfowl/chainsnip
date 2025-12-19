import type { BlogPost } from "@/types/blog"
import { blogPosts } from "./blog-data"

const MAX_RELATED_POSTS = 3

export function getRelatedPosts(currentPost: BlogPost): BlogPost[] {
  const relatedScores: Map<string, { post: BlogPost; score: number }> = new Map()

  blogPosts.forEach((post) => {
    if (post.id === currentPost.id) return // Skip current post

    let score = 0

    // Score by matching tags (higher weight)
    const matchingTags = post.tags.filter((tag) => currentPost.tags.includes(tag))
    score += matchingTags.length * 3 // e.g., 3 points per matching tag

    // Score by matching category (lower weight)
    if (post.category === currentPost.category) {
      score += 2 // e.g., 2 points for same category
    }

    if (score > 0) {
      relatedScores.set(post.id, { post, score })
    }
  })

  // Sort by score descending, then by recency (optional, if scores are equal)
  const sortedRelatedPosts = Array.from(relatedScores.values())
    .sort((a, b) => {
      if (b.score === a.score) {
        return new Date(b.post.publishedAt).getTime() - new Date(a.post.publishedAt).getTime()
      }
      return b.score - a.score
    })
    .map((item) => item.post)

  return sortedRelatedPosts.slice(0, MAX_RELATED_POSTS)
}
