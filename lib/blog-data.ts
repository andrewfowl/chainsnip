import type { BlogPost } from "@/types/blog"

export const blogPosts: BlogPost[] = [
  {
    slug: "audit-evidence-for-every-month-end-wallet-balance",
    title: "Audit Evidence for Every Month-End Wallet Balance",
    subtitle: "Period-end wallet balance support your auditor can verify, including for months you didn't capture.",
    description:
      "How ChainSnip captures block explorer snapshots at every month-end and returns exact wallet balances at a past date or block, so crypto finance teams have audit-defensible period-end support.",
    author: "ChainSnip",
    publishedAt: "2026-11-19",
    readTime: 3,
    heroAlt:
      "Twelve small month calendars with the last day of each one lit in yellow and framed like a camera viewfinder, next to the headline Month-End Snapshots on Schedule.",
    ogImage: "/blog/month-end-snapshots/og.png",
    video: {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChainSnip-2OFAyih6P2MoShak59D5hbSuLKU0zm.mp4",
      title: "ChainSnip video",
    },
    intro: [
      "Controllers and technical accountants at crypto companies can use ChainSnip to keep period-end wallet balance evidence without taking screenshots by hand. ChainSnip captures each wallet's block explorer page at every month-end, and when a period-end was missed, it reads what the wallet held at that date.",
      "The quantity of digital assets held at period-end is an input to nearly every crypto audit. In practice, the support for it is often a screenshot someone took by hand, at whatever hour they remembered, saved in a folder the auditor then has to take on trust.",
    ],
    sections: [
      {
        heading: "1. Month-end explorer snapshots on a schedule",
        paragraphs: [
          "You add the explorer link for each wallet once, from Etherscan, Solscan, Mintscan or another supported explorer, and turn on month-end capture. ChainSnip then captures the page on the last day of every month, without anyone on the team at a browser.",
          "Each snapshot records its capture time, its source URL and a SHA-256 hash. In other words, if an auditor later asks whether a file was edited, you can re-hash it and show that it matches the value recorded at capture.",
        ],
        figure: {
          src: "/blog/month-end-snapshots/sha256-rehash.png",
          alt: "A wallet snapshot file is re-hashed with SHA-256. The hash recorded at capture and the hash computed today are identical, marked as a match.",
          caption:
            "When an auditor asks whether a month-end file was edited, re-hash it and show that the SHA-256 matches the one recorded when it was captured (values shown are samples).",
        },
      },
      {
        heading: "2. Exact balances at a past date or block",
        paragraphs: [
          "A missed month-end can still be supported. You choose a network, a wallet and a date or block height, and ChainSnip returns the balance at that block, on Ethereum and the other major EVM networks, Arc, Monad and Solana.",
          "This matters most for rebasing tokens such as stETH, where the balance changes without a transaction and the explorer's current page says nothing about a prior quarter-end.",
        ],
      },
      {
        heading: "3. Evidence filed by client",
        paragraphs: [
          "Snapshots and lookups are filed by client, and lookup results export to CSV with the block number and date behind each balance. For a quarterly review or a year-end audit, that keeps the period-end quantities and their support together.",
        ],
      },
      {
        heading: "4. How to start",
        paragraphs: [
          "A free account includes balance lookups and a small number of snapshots, and scheduled month-end capture is part of the paid plans.",
        ],
      },
    ],
    closing: [
      "ChainSnip reflects the principle behind our advisory work: crypto-native finance teams should have audit-defensible support for their digital assets without paying Big 4 rates.",
    ],
    cta: {
      lead: "To try it, ",
      linkText: "create a free account at chainsnip.com",
      href: "/auth/signup",
      trail: " and run a lookup for one wallet at your last quarter-end.",
    },
  },
]

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}

export function formatPostDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}
