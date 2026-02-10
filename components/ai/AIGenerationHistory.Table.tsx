'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AIGeneration } from '@/types/ai-generation';
import { GENERATION_TYPE_LABELS } from '@/types/ai-generation';
import { truncateContent, getGenerationTypeColor, formatRelativeDate } from './ai-generation.helpers';

interface TableProps {
  generations: AIGeneration[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelect: (generation: AIGeneration) => void;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AIGenerationHistoryTable({
  generations,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onSelect,
  onToggleStar,
  onDelete,
}: TableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading generations...
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        No AI generations found.
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Type</TableHead>
            <TableHead>Content</TableHead>
            <TableHead className="w-[120px]">Model</TableHead>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead className="w-[60px]">Status</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {generations.map((gen) => (
            <TableRow
              key={gen.id}
              className="cursor-pointer"
              onClick={() => onSelect(gen)}
            >
              <TableCell>
                <Badge className={getGenerationTypeColor(gen.generation_type)}>
                  {GENERATION_TYPE_LABELS[gen.generation_type]}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[300px]">
                <span className="text-sm truncate block">
                  {truncateContent(gen.output_content)}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs text-muted-foreground">
                  {gen.model_id ? gen.model_id.split('/').pop() : '-'}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatRelativeDate(gen.created_at)}
              </TableCell>
              <TableCell>
                {gen.is_successful ? (
                  <CheckCircle className="size-4 text-green-500" />
                ) : (
                  <XCircle className="size-4 text-destructive" />
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => onToggleStar(gen.id)}
                  >
                    <Star
                      className={`size-3.5 ${gen.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:text-destructive"
                    onClick={() => onDelete(gen.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
