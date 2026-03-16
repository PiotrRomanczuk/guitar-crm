import { ChordCoverageStats, ChordCoverageTier } from '@/lib/services/song-analytics';
import { CheckCircle2, AlertCircle, Music, KeyRound, FileQuestion } from 'lucide-react';
import Link from 'next/link';

interface ChordCoverageTabProps {
  stats: ChordCoverageStats;
}

const TIER_CONFIG = [
  { key: 'analyzable' as const, label: 'Fully Analyzable', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  { key: 'missingKey' as const, label: 'Missing Key', icon: KeyRound, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { key: 'unparseable' as const, label: 'Unparseable Chords', icon: FileQuestion, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { key: 'missingChords' as const, label: 'No Chord Data', icon: Music, color: 'text-destructive', bg: 'bg-destructive/10' },
] as const;

function pct(count: number, total: number): string {
  return total > 0 ? `${Math.round((count / total) * 100)}%` : '0%';
}

function TierSongList({ tier, label }: { tier: ChordCoverageTier; label: string }) {
  if (tier.count === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-success bg-success/10 p-3 rounded-md">
        <CheckCircle2 className="w-4 h-4" />
        No songs in &ldquo;{label}&rdquo; tier!
      </div>
    );
  }

  return (
    <div className="bg-muted/30 rounded-md p-3 max-h-48 overflow-y-auto">
      <ul className="space-y-2">
        {tier.songs.slice(0, 20).map((song) => (
          <li key={song.id} className="text-sm flex justify-between items-center">
            <span className="truncate max-w-[300px]">
              <span className="font-medium">{song.title}</span>
              <span className="text-muted-foreground mx-1">by</span>
              <span className="text-muted-foreground">{song.author}</span>
              {song.chordCount > 0 && (
                <span className="text-muted-foreground ml-1">({song.chordCount} chords)</span>
              )}
            </span>
            <Link
              href={`/dashboard/songs/${song.id}`}
              className="text-xs text-primary hover:underline shrink-0 ml-2"
            >
              Edit
            </Link>
          </li>
        ))}
        {tier.songs.length > 20 && (
          <li className="text-xs text-muted-foreground pt-2 text-center">
            ...and {tier.songs.length - 20} more
          </li>
        )}
      </ul>
    </div>
  );
}

export function ChordCoverageTab({ stats }: ChordCoverageTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIER_CONFIG.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                {label}
              </h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${bg} ${color}`}>
                {pct(stats[key].count, stats.total)}
              </span>
            </div>
            <div className="text-2xl font-bold">{stats[key].count}</div>
            <div className="text-xs text-muted-foreground">of {stats.total} songs</div>
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/50">
          <h3 className="font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Chord Coverage Action Items
          </h3>
        </div>
        <div className="divide-y">
          {TIER_CONFIG.filter(({ key }) => key !== 'analyzable').map(({ key, label }) => (
            <div key={key} className="p-4">
              <h4 className="font-medium text-sm mb-3">{label} ({stats[key].count})</h4>
              <TierSongList tier={stats[key]} label={label} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
