import type React from "react"
import type { Metadata, Viewport } from "next"
import { Anton, DM_Sans } from "next/font/google"
import "./globals.css"
import ClientRootLayout from "./ClientRootLayout"
import { Toaster } from "@/components/ui/toaster"

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-display" })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e2e2df",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://chainsnip.com"),
  title: {
    default: "ChainSnip - Audit-Ready Crypto Balance Snapshots",
    template: "%s | ChainSnip",
  },
  description:
    "Automatically capture and archive blockchain explorer pages with wallet balances at month-end. Timestamped, verifiable proof for crypto accountants, auditors, and financial professionals.",
  keywords: [
    "crypto accounting",
    "blockchain snapshots",
    "wallet balance verification",
    "crypto audit",
    "cryptocurrency tax",
    "blockchain explorer",
    "month-end balances",
    "crypto compliance",
    "Web3 accounting",
    "DeFi auditing",
  ],
  authors: [{ name: "ChainSnip" }],
  creator: "ChainSnip",
  publisher: "ChainSnip",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon-dark-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chainsnip.com",
    siteName: "ChainSnip",
    title: "ChainSnip - Audit-Ready Crypto Balance Snapshots",
    description: "Automatically capture and archive blockchain explorer pages. Timestamped, verifiable proof for crypto accountants.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ChainSnip - Audit-Ready Crypto Balance Snapshots",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChainSnip - Audit-Ready Crypto Balance Snapshots",
    description: "Automatically capture and archive blockchain explorer pages. Timestamped, verifiable proof for crypto accountants.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://chainsnip.com",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${anton.variable} font-sans bg-background text-foreground selection:bg-primary selection:text-primary-foreground`}
      >
        <ClientRootLayout>{children}</ClientRootLayout>
        <Toaster />
      </body>
    </html>
  )
}
