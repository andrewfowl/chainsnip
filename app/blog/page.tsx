import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { blogPosts, formatPostDate } from "@/lib/blog-data"
import { MonthEndHero } from "@/components/blog/month-end-hero"

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles from ChainSnip on period-end wallet balance evidence for crypto finance teams.",
  alternates: { canonical: "https://chainsnip.com/blog" },
}

export default function BlogListPage() {
  const posts = [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

  return (
    <main className="container mx-auto px-4 py-16 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <header className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">ChainSnip blog</p>
          <h1 className="mt-4 font-display text-5xl uppercase leading-none text-foreground sm:text-6xl">Blog</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
            Articles on period-end wallet balance evidence for crypto finance teams.
          </p>
        </header>

        <ul className="mt-12 flex flex-col gap-8">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <MonthEndHero alt="" className="rounded-none" />
                <div className="flex flex-col gap-3 p-6 sm:p-8">
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
                    <span aria-hidden="true">{" · "}</span>
                    {post.readTime} min read
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">
                    {post.title}
                  </h2>
                  <p className="leading-relaxed text-muted-foreground text-pretty">{post.subtitle}</p>
                  <span className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    Read the article
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
