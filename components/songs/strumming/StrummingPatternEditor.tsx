'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Undo2, Trash2, Space } from 'lucide-react';
import { StrummingPatternDisplay } from './StrummingPatternDisplay';

// ============================================================================
// TYPES
// ============================================================================

interface StrokeButton {
  char: string;
  label: string;
  shortcut: string;
  description: string;
  color: string;
}

interface StrummingPatternEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STROKE_BUTTONS: StrokeButton[] = [
  { char: 'D', label: '\u2193', shortcut: 'D', description: 'Down stroke', color: 'bg-primary/15 text-primary hover:bg-primary/25 border-primary/30' },
  { char: 'U', label: '\u2191', shortcut: 'U', description: 'Up stroke', color: 'bg-primary/15 text-primary hover:bg-primary/25 border-primary/30' },
  { char: 'x', label: '\u2715', shortcut: 'X', description: 'Muted strum', color: 'bg-muted text-muted-foreground hover:bg-muted/80 border-border' },
  { char: 'd', label: '\u2193\u0305', shortcut: 'P', description: 'Palm muted down', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border-amber-500/30' },
  { char: 'u', label: '\u2191\u0305', shortcut: 'Q', description: 'Palm muted up', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border-amber-500/30' },
  { char: 'B', label: '\u25CF', shortcut: 'B', description: 'Bass hit', color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/25 border-indigo-500/30' },
  { char: '-', label: '\u2014', shortcut: '-', description: 'Rest', color: 'bg-muted/50 text-muted-foreground/60 hover:bg-muted/70 border-border/50' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function StrummingPatternEditor({
  value,
  onChange,
  onBlur,
  error,
}: StrummingPatternEditorProps) {
  const [showRaw, setShowRaw] = useState(false);

  function addStroke(char: string) {
    onChange(value + char);
  }

  function addSpace() {
    if (value.length > 0 && !value.endsWith(' ')) {
      onChange(value + ' ');
    }
  }

  function undo() {
    if (value.length === 0) return;
    // Remove last character (including trailing space)
    const trimmed = value.trimEnd();
    if (trimmed.length < value.length) {
      // Had trailing space, just remove that
      onChange(trimmed);
    } else {
      onChange(value.slice(0, -1));
    }
  }

  function clear() {
    onChange('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // Prevent form submission
    if (e.key === 'Enter') {
      e.preventDefault();
      return;
    }

    const key = e.key.toUpperCase();

    // Map keyboard shortcuts to strokes
    const mapping: Record<string, string> = {
      D: 'D',
      U: 'U',
      X: 'x',
      P: 'd',
      Q: 'u',
      B: 'B',
    };

    if (key === ' ') {
      e.preventDefault();
      addSpace();
    } else if (key === '-') {
      e.preventDefault();
      addStroke('-');
    } else if (key === 'BACKSPACE') {
      e.preventDefault();
      undo();
    } else if (mapping[key]) {
      e.preventDefault();
      addStroke(mapping[key]);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Strumming Pattern</Label>
        <button
          type="button"
          onClick={() => setShowRaw(!showRaw)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showRaw ? 'Visual editor' : 'Edit raw text'}
        </button>
      </div>

      {showRaw ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder="D-DU-UDU or D DU UDU"
          className="font-[family-name:--font-music]"
        />
      ) : (
        <div
          className="space-y-3 rounded-lg border border-border p-3 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
        >
          {/* Stroke buttons */}
          <TooltipProvider delayDuration={300}>
            <div className="flex flex-wrap gap-1.5">
              {STROKE_BUTTONS.map((btn) => (
                <Tooltip key={btn.char}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={`h-9 w-9 text-base font-bold border ${btn.color}`}
                      onClick={() => addStroke(btn.char)}
                    >
                      {btn.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p className="font-medium">{btn.description}</p>
                    <p className="text-muted-foreground">Key: {btn.shortcut}</p>
                  </TooltipContent>
                </Tooltip>
              ))}

              <div className="w-px bg-border mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-2 text-xs"
                    onClick={addSpace}
                  >
                    <Space className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p className="font-medium">Beat group separator</p>
                  <p className="text-muted-foreground">Key: Space</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-9"
                    onClick={undo}
                    disabled={value.length === 0}
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p className="font-medium">Undo last</p>
                  <p className="text-muted-foreground">Key: Backspace</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 text-destructive hover:text-destructive"
                    onClick={clear}
                    disabled={value.length === 0}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Clear all
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {/* Live preview */}
          {value ? (
            <StrummingPatternDisplay pattern={value} showCard={false} />
          ) : (
            <p className="text-sm text-muted-foreground py-3 text-center">
              Click buttons or type keys to build a pattern
            </p>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
