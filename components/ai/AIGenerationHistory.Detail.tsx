'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Copy, Check } from 'lucide-react';
import type { AIGeneration } from '@/types/ai-generation';
import { GENERATION_TYPE_LABELS } from '@/types/ai-generation';
import { getGenerationTypeColor } from './ai-generation.helpers';

interface DetailProps {
  generation: AIGeneration | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStar: (id: string) => void;
}

export function AIGenerationHistoryDetail({ generation, isOpen, onClose, onToggleStar }: DetailProps) {
  const [isCopied, setIsCopied] = useState(false);

  if (!generation) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generation.output_content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge className={getGenerationTypeColor(generation.generation_type)}>
              {GENERATION_TYPE_LABELS[generation.generation_type]}
            </Badge>
            {!generation.is_successful && <Badge variant="destructive">Error</Badge>}
          </div>
          <DialogTitle className="text-lg">Generation Details</DialogTitle>
          <DialogDescription>
            {new Date(generation.created_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          <div>
            <h4 className="text-sm font-medium mb-1 text-muted-foreground">Output</h4>
            <div className="rounded-md bg-muted p-3 text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              {generation.output_content || <span className="italic text-muted-foreground">No content</span>}
            </div>
          </div>

          {generation.error_message && (
            <div>
              <h4 className="text-sm font-medium mb-1 text-destructive">Error</h4>
              <p className="text-sm text-destructive">{generation.error_message}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium mb-1 text-muted-foreground">Input Parameters</h4>
            <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto max-h-[200px] overflow-y-auto">
              {JSON.stringify(generation.input_params, null, 2)}
            </pre>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {generation.model_id && (
              <div>
                <span className="text-muted-foreground">Model:</span>{' '}
                <span className="font-mono text-xs">{generation.model_id}</span>
              </div>
            )}
            {generation.provider && (
              <div>
                <span className="text-muted-foreground">Provider:</span> {generation.provider}
              </div>
            )}
            {generation.agent_id && (
              <div>
                <span className="text-muted-foreground">Agent:</span>{' '}
                <span className="font-mono text-xs">{generation.agent_id}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={() => onToggleStar(generation.id)} className="gap-1.5">
            <Star className={`size-4 ${generation.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            {generation.is_starred ? 'Unstar' : 'Star'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
            {isCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
