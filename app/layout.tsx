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
  title: "ChainShip - Blockchain Balance Snapshots for Crypto Accountants",
  description:
    "Capture and archive blockchain explorer pages with wallet balances at month-end dates. Audit-ready proof for crypto accounting, tax prep, and compliance.",
  generator: "v0.dev",
  icons: {
    icon: [
      { url: "/favicon.jpg", type: "image/svg+xml" },
      { url: "/favicon.jpg", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "ChainShip - Blockchain Balance Snapshots",
    description: "Audit-ready proof for crypto accounting, tax prep, and compliance.",
    type: "website",
  },
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
