'use client';

import { useCallback, useState, useTransition } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { updateSelfRatingAction } from '@/app/actions/self-rating';
import { SELF_RATING_LABELS } from '@/schemas/SelfRatingSchema';
import { toast } from 'sonner';

interface SelfRatingStarsProps {
  repertoireId: string;
  currentRating: number | null;
  updatedAt: string | null;
  isReadOnly?: boolean;
}

export function SelfRatingStars({
  repertoireId,
  currentRating,
  updatedAt,
  isReadOnly = false,
}: SelfRatingStarsProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [optimisticRating, setOptimisticRating] = useState(currentRating);
  const [isPending, startTransition] = useTransition();

  const displayRating = hoveredStar ?? optimisticRating ?? 0;

  const handleRate = useCallback(
    (rating: number) => {
      if (isReadOnly || isPending) return;

      setOptimisticRating(rating);
      startTransition(async () => {
        const result = await updateSelfRatingAction(repertoireId, rating);
        if ('error' in result) {
          setOptimisticRating(currentRating);
          toast.error(result.error);
        }
      });
    },
    [isReadOnly, isPending, repertoireId, currentRating]
  );

  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const label = displayRating > 0 ? SELF_RATING_LABELS[displayRating] : 'Not rated';

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn('flex items-center gap-0.5', !isReadOnly && 'cursor-pointer')}
        onMouseLeave={() => setHoveredStar(null)}
        role={isReadOnly ? undefined : 'radiogroup'}
        aria-label="Self-assessment rating"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Tooltip key={star}>
            <TooltipTrigger asChild>
              <button
                type="button"
                disabled={isReadOnly || isPending}
                className={cn(
                  'p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm',
                  isReadOnly && 'cursor-default',
                  isPending && 'opacity-50'
                )}
                onClick={() => handleRate(star)}
                onMouseEnter={() => !isReadOnly && setHoveredStar(star)}
                aria-label={`${star} - ${SELF_RATING_LABELS[star]}`}
              >
                <Star
                  className={cn(
                    'h-4 w-4 transition-colors',
                    star <= displayRating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-none text-muted-foreground/40'
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <span>{SELF_RATING_LABELS[star]}</span>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <span className="text-[10px] text-muted-foreground min-w-[60px]">
        {label}
      </span>

      {isReadOnly && formattedDate && (
        <span className="text-[10px] text-muted-foreground/60">({formattedDate})</span>
      )}
    </div>
  );
}
