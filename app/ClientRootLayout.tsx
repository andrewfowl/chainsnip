"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <div className="relative z-10 flex flex-col min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-base focus:text-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="flex-grow pt-16 focus:outline-none">
          {children}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}
