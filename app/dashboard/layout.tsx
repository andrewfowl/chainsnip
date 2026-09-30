import Header from "@/components/header"
import { DashboardNav } from "@/components/dashboard-nav"

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
      <main className="container mx-auto px-4 pt-20 pb-8">
        <DashboardNav />
        {children}
      </main>
    </>
  )
}
