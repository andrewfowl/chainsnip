const PRODUCT_HUNT_URL =
  "https://www.producthunt.com/products/chainsnip?embed=true&utm_source=embed&utm_medium=post_embed"

const LOGO_URL =
  "https://ph-files.imgix.net/681ec73e-b387-41cc-a153-a80984e72c78.png?auto=compress,format&codec=mozjpeg&cs=strip&fit=crop&h=80&w=80"

export function ProductHuntCard({ className = "" }: { className?: string }) {
  return (
    <div className={`max-w-md rounded-xl border border-border bg-card p-5 ${className}`}>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- external Product Hunt asset */}
        <img
          src={LOGO_URL}
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold leading-tight text-foreground">ChainSnip</p>
          <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
            {"Accountant's Proof of the Wallet's Balance"}
          </p>
        </div>
      </div>
      <a
        href={PRODUCT_HUNT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#ff6154] px-4 py-2 text-base font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {"Check it out on Product Hunt →"}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </div>
  )
}
