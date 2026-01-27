import { Skeleton } from "@/components/ui/skeleton";

export function GuestViewSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col">
      {/* Hero Header Skeleton */}
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 pb-12">
          <div className="max-w-4xl mx-auto w-full space-y-4">
            <Skeleton className="h-10 w-2/3 md:w-1/2 bg-white/20" />
            <Skeleton className="h-4 w-1/3 bg-white/10" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
              <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 -mt-8 bg-white dark:bg-neutral-950 rounded-t-[32px] px-6 pt-10 pb-20 max-w-4xl mx-auto w-full space-y-12">
        {/* Quick Actions / Info Cards */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 border border-gray-100 dark:border-neutral-800 rounded-3xl space-y-3"
            >
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </section>

        {/* Tab Selection Strip */}
        <div className="flex gap-4 overflow-hidden py-2 border-b border-gray-100 dark:border-neutral-900">
          {[1, 2, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              className="h-10 w-28 rounded-full flex-shrink-0"
            />
          ))}
        </div>

        {/* Category Description / Welcome */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        {/* Recommendation Cards List */}
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex gap-5 p-4 border border-gray-50 dark:border-neutral-900 rounded-3xl bg-gray-50/30 dark:bg-black/10"
            >
              <Skeleton
                className="h-28 w-28 rounded-2xl flex-shrink-0"
                title="Image placeholder"
              />
              <div className="flex-1 space-y-4 py-1">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <div className="flex gap-2 items-center">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sticky Nav / Call to Action Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-black/60 backdrop-blur-md border-t border-gray-100 dark:border-neutral-800 md:hidden flex justify-center">
        <Skeleton className="h-12 w-full max-w-sm rounded-2xl" />
      </div>
    </div>
  );
}
