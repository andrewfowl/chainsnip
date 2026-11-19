export interface BlogFigure {
  src: string
  alt: string
  caption: string
}

export interface BlogSection {
  heading: string
  paragraphs: string[]
  figure?: BlogFigure
}

export interface BlogPost {
  slug: string
  title: string
  subtitle: string
  description: string
  author: string
  publishedAt: string
  readTime: number
  heroAlt: string
  ogImage: string
  video?: {
    src: string
    title: string
  }
  intro: string[]
  sections: BlogSection[]
  closing: string[]
  cta: {
    lead: string
    linkText: string
    href: string
    trail: string
  }
}
