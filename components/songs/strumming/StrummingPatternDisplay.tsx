'use client';

import { Waves } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

type StrokeType = 'down' | 'up' | 'muted' | 'palm-down' | 'palm-up' | 'bass' | 'rest';

interface Stroke {
  type: StrokeType;
  char: string;
}

interface StrokeGroup {
  strokes: Stroke[];
}

// ============================================================================
// PARSING
// ============================================================================

function parseChar(ch: string): Stroke | null {
  switch (ch) {
    case 'D':
      return { type: 'down', char: ch };
    case 'U':
      return { type: 'up', char: ch };
    case 'x':
    case 'X':
      return { type: 'muted', char: ch };
    case 'd':
      return { type: 'palm-down', char: ch };
    case 'u':
      return { type: 'palm-up', char: ch };
    case 'B':
      return { type: 'bass', char: ch };
    case '-':
      return { type: 'rest', char: ch };
    default:
      return null;
  }
}

function parsePattern(pattern: string): StrokeGroup[] {
  const groups: StrokeGroup[] = [];
  let current: Stroke[] = [];

  for (const ch of pattern) {
    if (ch === ' ') {
      if (current.length > 0) {
        groups.push({ strokes: current });
        current = [];
      }
      continue;
    }
    const stroke = parseChar(ch);
    if (stroke) {
      current.push(stroke);
    }
  }

  if (current.length > 0) {
    groups.push({ strokes: current });
  }

  return groups;
}

// ============================================================================
// STROKE ICONS (SVG)
// ============================================================================

function DownArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 40" className={cn('w-5 h-8', className)} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="4" x2="12" y2="32" />
      <polyline points="6,26 12,34 18,26" />
    </svg>
  );
}

function UpArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 40" className={cn('w-5 h-8', className)} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="36" x2="12" y2="8" />
      <polyline points="6,14 12,6 18,14" />
    </svg>
  );
}

function MutedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 40" className={cn('w-5 h-8', className)} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="13" x2="17" y2="27" />
      <line x1="17" y1="13" x2="7" y2="27" />
    </svg>
  );
}

function PalmDownArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 40" className={cn('w-5 h-8', className)} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="4" x2="12" y2="32" strokeDasharray="4 3" />
      <polyline points="6,26 12,34 18,26" />
    </svg>
  );
}

function PalmUpArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 40" className={cn('w-5 h-8', className)} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="36" x2="12" y2="8" strokeDasharray="4 3" />
      <polyline points="6,14 12,6 18,14" />
    </svg>
  );
}

function BassIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 40" className={cn('w-5 h-8', className)} fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="20" r="6" fill="currentColor" />
      <line x1="12" y1="26" x2="12" y2="34" />
    </svg>
  );
}

function RestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 40" className={cn('w-5 h-8', className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="8" y1="20" x2="16" y2="20" />
    </svg>
  );
}

// ============================================================================
// STROKE RENDERING
// ============================================================================

const strokeConfig: Record<StrokeType, {
  icon: React.FC<{ className?: string }>;
  color: string;
  label: string;
}> = {
  down:        { icon: DownArrow,     color: 'text-primary',              label: 'D' },
  up:          { icon: UpArrow,       color: 'text-primary',              label: 'U' },
  muted:       { icon: MutedIcon,     color: 'text-muted-foreground',     label: 'X' },
  'palm-down': { icon: PalmDownArrow, color: 'text-amber-500',            label: 'P' },
  'palm-up':   { icon: PalmUpArrow,   color: 'text-amber-500',            label: 'P' },
  bass:        { icon: BassIcon,      color: 'text-indigo-500',           label: 'B' },
  rest:        { icon: RestIcon,      color: 'text-muted-foreground/50',  label: '-' },
};

function StrokeCell({ stroke, beat }: { stroke: Stroke; beat: string }) {
  const config = strokeConfig[stroke.type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <Icon className={config.color} />
      <span className="text-[10px] font-mono text-muted-foreground">{beat}</span>
    </div>
  );
}

// ============================================================================
// LEGEND
// ============================================================================

function Legend({ types }: { types: Set<StrokeType> }) {
  const entries: { type: StrokeType; label: string; description: string }[] = [
    { type: 'down',      label: 'D',  description: 'Down' },
    { type: 'up',        label: 'U',  description: 'Up' },
    { type: 'muted',     label: 'X',  description: 'Muted' },
    { type: 'palm-down', label: 'PM', description: 'Palm mute' },
    { type: 'bass',      label: 'B',  description: 'Bass hit' },
  ];

  const visible = entries.filter(
    (e) => types.has(e.type) || (e.type === 'palm-down' && types.has('palm-up'))
  );

  if (visible.length <= 2) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-border/50">
      {visible.map((entry) => {
        const config = strokeConfig[entry.type];
        const Icon = config.icon;
        return (
          <div key={entry.type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className={cn('!w-3.5 !h-5', config.color)} />
            <span>{entry.description}</span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface StrummingPatternDisplayProps {
  pattern: string;
  title?: string;
  showCard?: boolean;
  className?: string;
}

export function StrummingPatternDisplay({
  pattern,
  title = 'Strumming Pattern',
  showCard = true,
  className,
}: StrummingPatternDisplayProps) {
  const groups = parsePattern(pattern);
  const allStrokes = groups.flatMap((g) => g.strokes);

  if (allStrokes.length === 0) return null;

  const usedTypes = new Set(allStrokes.map((s) => s.type));

  // Generate beat labels: 1 & 2 & 3 & ...
  let beatIndex = 0;
  function nextBeat(): string {
    const beat = beatIndex % 2 === 0 ? `${Math.floor(beatIndex / 2) + 1}` : '&';
    beatIndex++;
    return beat;
  }

  const content = (
    <div className={cn('space-y-0', className)}>
      <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
        {groups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-1">
            {group.strokes.map((stroke, si) => (
              <StrokeCell key={si} stroke={stroke} beat={nextBeat()} />
            ))}
          </div>
        ))}
      </div>
      <Legend types={usedTypes} />
      <p className="text-xs font-mono text-muted-foreground/60 mt-2">{pattern}</p>
    </div>
  );

  if (!showCard) return content;

  return (
    <Card className="bg-card border-border/50 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <Waves className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg">
          {content}
        </div>
      </CardContent>
    </Card>
  );
}
