import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-neutral-900 overflow-hidden">
      {/* Sidebar Placeholder (Desktop) */}
      <aside className="hidden md:flex w-64 border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-black/20 flex-col p-6 space-y-6">
        <Skeleton className="h-10 w-32 mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Placeholder */}
        <header className="h-16 border-b border-gray-200 dark:border-neutral-800 bg-white/50 dark:bg-black/10 backdrop-blur-md flex items-center justify-between px-8">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-12 w-44 rounded-2xl" />
          </div>

          {/* Grid of Property Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-neutral-800 rounded-3xl border border-gray-100 dark:border-neutral-700 overflow-hidden"
              >
                <Skeleton className="aspect-video w-full" />
                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="pt-4 flex justify-between gap-4 border-t border-gray-50 dark:border-neutral-700">
                    <Skeleton className="h-10 flex-1 rounded-xl" />
                    <Skeleton className="h-10 flex-1 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
