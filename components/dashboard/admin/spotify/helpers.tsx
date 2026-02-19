import { Badge } from '@/components/ui/badge';

export function getConfidenceBadge(score: number) {
  if (score >= 70) {
    return (
      <Badge
        variant="outline"
        className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
      >
        High: {score}%
      </Badge>
    );
  } else if (score >= 50) {
    return (
      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
        Medium: {score}%
      </Badge>
    );
  } else {
    return (
      <Badge
        variant="outline"
        className="bg-destructive/10 text-destructive border-destructive/20"
      >
        Low: {score}%
      </Badge>
    );
  }
}

export function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
