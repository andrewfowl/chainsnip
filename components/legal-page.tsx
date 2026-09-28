import type React from "react"

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-4 py-16 lg:py-24">
      <article className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Last updated {updated}</p>
        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground text-balance">
          {title}
        </h1>
        <div className="mt-10 space-y-10">{children}</div>
      </article>
    </div>
  )
}

export function LegalSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="border-b border-border pb-2 text-lg font-medium text-foreground">{heading}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a:hover]:no-underline">
        {children}
      </div>
    </section>
  )
}
