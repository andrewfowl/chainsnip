import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { blogPosts, formatPostDate, getPostBySlug } from "@/lib/blog-data"
import { MonthEndHero } from "@/components/blog/month-end-hero"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  const url = `https://chainsnip.com/blog/${post.slug}`
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      images: [{ url: post.ogImage, width: 1200, height: 630, alt: post.heroAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.ogImage],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <main className="container mx-auto px-4 py-12 lg:py-20">
      <article className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            All posts
          </Link>

          <header className="mt-8">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
              <span aria-hidden="true">{" · "}</span>
              {post.readTime} min read
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground text-balance sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 text-xl leading-relaxed text-muted-foreground text-pretty">{post.subtitle}</p>
          </header>
        </div>

        <MonthEndHero id="post-hero" alt={post.heroAlt} className="mt-10" />

        <div className="mx-auto mt-12 max-w-3xl space-y-6 text-lg leading-relaxed text-foreground/90">
          {post.intro.map((paragraph) => (
            <p key={paragraph} className="text-pretty">
              {paragraph}
            </p>
          ))}

          {post.video && (
            <figure className="!mt-10">
              <video
                controls
                preload="metadata"
                playsInline
                className="aspect-video w-full rounded-xl border border-border bg-black"
                aria-label={post.video.title}
              >
                <source src={post.video.src} type="video/mp4" />
                <a href={post.video.src}>Download the video</a>
              </video>
            </figure>
          )}

          {post.sections.map((section) => (
            <section key={section.heading} className="!mt-12 space-y-6">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground text-balance">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-pretty">
                  {paragraph}
                </p>
              ))}
              {section.figure && (
                <figure className="!mt-8">
                  <Image
                    src={section.figure.src}
                    alt={section.figure.alt}
                    width={1376}
                    height={768}
                    className="w-full rounded-xl border border-border"
                  />
                  <figcaption className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {section.figure.caption}
                  </figcaption>
                </figure>
              )}
            </section>
          ))}

          <div className="!mt-12 space-y-6 border-t border-border pt-10">
            {post.closing.map((paragraph) => (
              <p key={paragraph} className="text-pretty">
                {paragraph}
              </p>
            ))}
            <p className="text-pretty">
              {post.cta.lead}
              <Link
                href={post.cta.href}
                className="font-medium text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:decoration-foreground"
              >
                {post.cta.linkText}
              </Link>
              {post.cta.trail}
            </p>
          </div>
        </div>
      </article>
    </main>
  )
}
