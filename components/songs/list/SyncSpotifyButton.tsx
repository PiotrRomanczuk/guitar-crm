'use client';

import { useState } from 'react';
import { RefreshCw, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export function SyncSpotifyButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSync = async (
    options: {
      enableAI?: boolean;
      limit?: number;
      force?: boolean;
      minConfidence?: number;
    } = {}
  ) => {
    setIsLoading(true);

    const { enableAI = true, limit = 25, force = false, minConfidence = 70 } = options;

    try {
      // Build URL with parameters
      const params = new URLSearchParams({
        limit: limit.toString(),
        force: force.toString(),
        ai: enableAI.toString(),
        minConfidence: minConfidence.toString(),
      });

      const response = await fetch(`/api/spotify/sync?${params}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync');
      }

      // Enhanced success message with AI stats
      const aiInfo =
        enableAI && data.aiMatches > 0 ? ` (${data.aiMatches} AI-enhanced matches)` : '';

      const stats = [
        `Updated: ${data.updated}`,
        `Skipped: ${data.skipped}`,
        data.failed > 0 ? `Failed: ${data.failed}` : null,
        data.averageConfidence ? `Avg Confidence: ${data.averageConfidence}%` : null,
      ]
        .filter(Boolean)
        .join(' • ');

      toast.success(`✅ Sync Complete${aiInfo}`, {
        description: stats,
        duration: 5000,
      });

      // Show warnings for low success rate
      if (data.total > 0) {
        const successRate = (data.updated / data.total) * 100;
        if (successRate < 50) {
          toast.warning(`Low success rate (${Math.round(successRate)}%)`, {
            description: 'Consider using AI mode or checking song data quality',
            duration: 7000,
          });
        }
      }

      // Show errors if any
      if (data.errors && data.errors.length > 0) {
        toast.error(`${data.errors.length} songs had issues`, {
          description: data.errors.slice(0, 3).join('; '),
          duration: 8000,
        });
      }

      router.refresh();
    } catch (error: unknown) {
      console.error('Sync error:', error);
      toast.error('Sync Failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isLoading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Syncing...' : 'Sync Spotify'}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-medium">🎵 Spotify Sync Options</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleSync({ enableAI: true, limit: 25 })}
          disabled={isLoading}
        >
          <Brain className="w-4 h-4 mr-2 text-purple-500" />
          <div className="flex flex-col">
            <span className="font-medium">🤖 AI-Enhanced Sync</span>
            <span className="text-xs text-muted-foreground">
              Smart matching for messy data (25 songs)
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleSync({ enableAI: false, limit: 50 })}
          disabled={isLoading}
        >
          <Zap className="w-4 h-4 mr-2 text-blue-500" />
          <div className="flex flex-col">
            <span className="font-medium">⚡ Quick Sync</span>
            <span className="text-xs text-muted-foreground">Fast basic matching (50 songs)</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleSync({ enableAI: true, limit: 100, minConfidence: 60 })}
          disabled={isLoading}
        >
          <RefreshCw className="w-4 h-4 mr-2 text-green-500" />
          <div className="flex flex-col">
            <span className="font-medium">🔄 Full AI Sync</span>
            <span className="text-xs text-muted-foreground">
              Process 100 songs with lower confidence
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleSync({ enableAI: true, force: true, limit: 25 })}
          disabled={isLoading}
        >
          <RefreshCw className="w-4 h-4 mr-2 text-orange-500" />
          <div className="flex flex-col">
            <span className="font-medium">🔧 Force Refresh</span>
            <span className="text-xs text-muted-foreground">
              Re-sync songs that already have Spotify data
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
