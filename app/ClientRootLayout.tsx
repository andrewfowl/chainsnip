"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import SingleBlobBackground from "@/components/single-blob-background"

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <SingleBlobBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-16">{children}</main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}
