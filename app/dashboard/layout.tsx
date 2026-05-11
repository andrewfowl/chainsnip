import { Header } from "@/components/header"

// Prevent static prerendering of dashboard pages - they require authentication and dynamic data
export const dynamic = "force-dynamic"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </>
  )
}
