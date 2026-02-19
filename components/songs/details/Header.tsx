import { Badge } from '@/components/ui/badge';
import { Signal, Music2 } from 'lucide-react';

interface Props {
  title: string;
  author: string;
  level?: string | null;
  songKey?: string | null;
}

const difficultyColors = {
  beginner: 'bg-success/15 text-success hover:bg-success/25 border-0',
  intermediate: 'bg-primary/10 text-primary hover:bg-primary/20 border-0',
  advanced: 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-0',
};

export default function SongDetailHeader({ title, author, level, songKey }: Props) {
  return (
    <div className="space-y-3">
      <div className="space-y-1 md:space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          {title}
        </h1>
        <p className="text-xl md:text-2xl font-medium text-muted-foreground">{author}</p>
      </div>

      {(level || songKey) && (
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {level && (
            <Badge
              variant="secondary"
              className={`capitalize flex items-center gap-1.5 px-3 py-1 ${difficultyColors[level as keyof typeof difficultyColors] || ''
                }`}
            >
              <Signal className="w-3.5 h-3.5" />
              {level}
            </Badge>
          )}
          {songKey && (
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 bg-background/50 backdrop-blur-sm">
              <Music2 className="w-3.5 h-3.5 text-muted-foreground" />
              Key: {songKey}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
