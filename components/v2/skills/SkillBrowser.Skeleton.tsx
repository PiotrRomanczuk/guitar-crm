/**
 * Skeleton loading state for the skill browser.
 */
export function SkillBrowserSkeleton() {
  return (
    <div className="px-4 py-4 space-y-4">
      {/* Search skeleton */}
      <div className="h-11 bg-muted rounded-lg animate-pulse" />

      {/* Filter chips skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-9 bg-muted rounded-full animate-pulse shrink-0"
            style={{ width: `${60 + i * 10}px` }}
          />
        ))}
      </div>

      {/* Skill cards skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-border p-4 animate-pulse"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
              <div className="h-5 bg-muted rounded-full w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
