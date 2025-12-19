import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* The EnhancedLavaLamp3D is in the root layout, so it will be behind this.
          We can add a semi-transparent overlay here if we want to dim the background specifically for auth pages.
      */}
      <div className="absolute inset-0 bg-background/50 dark:bg-background/70 backdrop-blur-sm z-0" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  )
}
