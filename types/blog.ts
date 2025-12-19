export interface BlogPost {
  id: string
  title: string
  slug: string // Added slug
  content: string
  excerpt: string
  author: string
  publishedAt: string
  tags: string[]
  category: string
  readTime: number
  featured: boolean
}

export interface MergedBlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  originalPosts: BlogPost[]
  mergedAt: string
  tags: string[]
  readTime: number
}
