import Link from 'next/link';
import { BarChart3, Music2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  visible: boolean;
}

export default function AnalyticsQuickAccess({ visible }: Props) {
  if (!visible) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Link href="/dashboard/songs/analytics">
        <Card className="border-dashed hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
          <CardContent className="flex items-center gap-3 p-4">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Song Analytics</p>
              <p className="text-xs text-muted-foreground">Charts, stats & database health</p>
            </div>
            <Button variant="ghost" size="sm" tabIndex={-1}>
              View
            </Button>
          </CardContent>
        </Card>
      </Link>
      <Link href="/dashboard/songs/chord-analysis">
        <Card className="border-dashed hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
          <CardContent className="flex items-center gap-3 p-4">
            <Music2 className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Chord Analysis</p>
              <p className="text-xs text-muted-foreground">Progressions, theory & archetypes</p>
            </div>
            <Button variant="ghost" size="sm" tabIndex={-1}>
              View
            </Button>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
