import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Stats {
  total: number;
  withSpotify: number;
  withoutSpotify: number;
  coveragePercentage: number;
}

interface StatsCardsProps {
  stats: Stats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Total Songs</CardDescription>
          <CardTitle className="text-3xl">{stats.total}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            All songs in library
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardDescription>With Spotify</CardDescription>
          <CardTitle className="text-3xl text-green-600">{stats.withSpotify}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Progress value={stats.coveragePercentage} className="flex-1" />
            <span className="text-xs font-medium">{stats.coveragePercentage}%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Without Spotify</CardDescription>
          <CardTitle className="text-3xl text-orange-600">{stats.withoutSpotify}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            Need to be synced
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Coverage</CardDescription>
          <CardTitle className="text-3xl">{stats.coveragePercentage}%</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            {stats.coveragePercentage >= 80 ? 'Excellent' : stats.coveragePercentage >= 60 ? 'Good' : 'Needs work'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
