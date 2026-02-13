import type { Song } from '@/components/songs/types';

interface HoverStatsCardProps {
  song: Song & {
    stats?: {
      lessonCount: number;
      studentCount: number;
      statusBreakdown?: {
        mastered: number;
        learning: number;
        to_learn: number;
      };
    };
  };
}

export default function HoverStatsCard({ song }: HoverStatsCardProps) {
  if (!song.stats) return null;

  return (
    <div className="absolute left-4 top-full mt-1 z-50 hidden group-hover:block w-72 p-4 bg-card rounded-lg shadow-xl border border-border">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Song Usage
      </h4>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Lessons:</span>
          <span className="font-medium text-foreground">{song.stats.lessonCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Students:</span>
          <span className="font-medium text-foreground">{song.stats.studentCount}</span>
        </div>
      </div>

      {song.stats.statusBreakdown && (
        <>
          <div className="border-t border-border my-3" />
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Progress
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-success">✓ Mastered</span>
              <span className="font-medium text-foreground">
                {song.stats.statusBreakdown.mastered}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-warning">→ Learning</span>
              <span className="font-medium text-foreground">
                {song.stats.statusBreakdown.learning}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">○ To Learn</span>
              <span className="font-medium text-foreground">
                {song.stats.statusBreakdown.to_learn}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
