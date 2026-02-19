import { Skeleton } from '@/components/ui/skeleton';

export function StudentListSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border space-y-4">
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 mt-2" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
          <Skeleton className="h-11 sm:h-10 flex-1" />
          <div className="flex gap-2">
            <Skeleton className="h-11 sm:h-10 w-full sm:w-[140px]" />
            <Skeleton className="h-11 sm:h-10 w-full sm:w-[130px]" />
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
