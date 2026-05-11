import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientRootLayout from "./ClientRootLayout"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: "ChainShip - Audit-Ready Crypto Balance Snapshots",
    template: "%s | ChainShip",
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
  authors: [{ name: "ChainShip" }],
  creator: "ChainShip",
  publisher: "ChainShip",
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
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-dark-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chainship.io",
    siteName: "ChainShip",
    title: "ChainShip - Audit-Ready Crypto Balance Snapshots",
    description: "Automatically capture and archive blockchain explorer pages. Timestamped, verifiable proof for crypto accountants.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ChainShip - Audit-Ready Crypto Balance Snapshots",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChainShip - Audit-Ready Crypto Balance Snapshots",
    description: "Automatically capture and archive blockchain explorer pages. Timestamped, verifiable proof for crypto accountants.",
    images: ["/og-image.png"],
    creator: "@chainship",
  },
  alternates: {
    canonical: "https://chainship.io",
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
        className={`${inter.className} bg-background text-foreground selection:bg-primary selection:text-primary-foreground`}
      >
        <ClientRootLayout>{children}</ClientRootLayout>
        <Toaster />
      </body>
    </html>
  )
}
