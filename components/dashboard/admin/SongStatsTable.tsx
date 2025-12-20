'use client';

import { SongDatabaseStats } from '@/lib/services/song-analytics';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface SongStatsTableProps {
  stats: SongDatabaseStats;
}

export function SongStatsTable({ stats }: SongStatsTableProps) {
  const { coverage, counts, missing } = stats;

  const metrics = [
    {
      label: 'Chords / Lyrics',
      percentage: coverage.chords,
      count: counts.withChords,
      missing: missing.chords,
      color: coverage.chords < 50 ? 'text-red-600' : 'text-green-600',
      bgColor: coverage.chords < 50 ? 'bg-red-100' : 'bg-green-100',
    },
    {
      label: 'YouTube Links',
      percentage: coverage.youtube,
      count: counts.withYoutube,
      missing: missing.youtube,
      color: coverage.youtube < 50 ? 'text-red-600' : 'text-green-600',
      bgColor: coverage.youtube < 50 ? 'bg-red-100' : 'bg-green-100',
    },
    {
      label: 'Ultimate Guitar Links',
      percentage: coverage.ultimateGuitar,
      count: counts.withUltimateGuitar,
      missing: missing.ultimateGuitar,
      color: coverage.ultimateGuitar < 50 ? 'text-red-600' : 'text-green-600',
      bgColor: coverage.ultimateGuitar < 50 ? 'bg-red-100' : 'bg-green-100',
    },
    {
      label: 'Gallery Images',
      percentage: coverage.galleryImages,
      count: counts.withGalleryImages,
      missing: missing.galleryImages,
      color: coverage.galleryImages < 50 ? 'text-red-600' : 'text-green-600',
      bgColor: coverage.galleryImages < 50 ? 'bg-red-100' : 'bg-green-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-sm text-muted-foreground">{metric.label}</h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${metric.bgColor} ${metric.color}`}>
                {metric.percentage}%
              </span>
            </div>
            <div className="text-2xl font-bold">{metric.count}</div>
            <div className="text-xs text-muted-foreground">songs completed</div>
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/50">
          <h3 className="font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Missing Metadata Action Items
          </h3>
        </div>
        <div className="divide-y">
          {metrics.map((metric) => (
            <div key={metric.label} className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-sm">{metric.label} Missing ({metric.missing.length})</h4>
              </div>
              {metric.missing.length > 0 ? (
                <div className="bg-muted/30 rounded-md p-3 max-h-48 overflow-y-auto">
                  <ul className="space-y-2">
                    {metric.missing.slice(0, 20).map((song) => (
                      <li key={song.id} className="text-sm flex justify-between items-center">
                        <span className="truncate max-w-[300px]">
                          <span className="font-medium">{song.title}</span>
                          <span className="text-muted-foreground mx-1">by</span>
                          <span className="text-muted-foreground">{song.author}</span>
                        </span>
                        <Link 
                          href={`/dashboard/songs/${song.id}`}
                          className="text-xs text-primary hover:underline shrink-0 ml-2"
                        >
                          Edit
                        </Link>
                      </li>
                    ))}
                    {metric.missing.length > 20 && (
                      <li className="text-xs text-muted-foreground pt-2 text-center">
                        ...and {metric.missing.length - 20} more
                      </li>
                    )}
                  </ul>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  <CheckCircle2 className="w-4 h-4" />
                  All songs have {metric.label.toLowerCase()}!
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
