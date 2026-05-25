import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Stats Bar */}
      <Skeleton className="h-12 w-full rounded-lg mb-6" />

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full sm:w-[140px]" />
      </div>

      {/* Portfolio Sections */}
      <div className="space-y-4">
        {/* Portfolio 1 */}
        <div className="border rounded-lg">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="border-t">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b last:border-b-0">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-8 h-8 rounded" />
                  <div>
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block">
                    <Skeleton className="h-3 w-24 mb-1" />
                    <Skeleton className="h-2 w-20" />
                  </div>
                  <div className="flex gap-1">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio 2 (collapsed) */}
        <div className="border rounded-lg">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>

        {/* Portfolio 3 (collapsed) */}
        <div className="border rounded-lg">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-14" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
