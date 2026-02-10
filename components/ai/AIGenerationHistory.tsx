'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import type { AIGeneration } from '@/types/ai-generation';
import { useAIGenerationHistory } from './useAIGenerationHistory';
import { AIGenerationHistoryFilters } from './AIGenerationHistory.Filters';
import { AIGenerationHistoryTable } from './AIGenerationHistory.Table';
import { AIGenerationHistoryDetail } from './AIGenerationHistory.Detail';

export function AIGenerationHistory() {
  const {
    generations,
    totalPages,
    isLoading,
    error,
    filters,
    setTypeFilter,
    setStarredFilter,
    setSearchFilter,
    setPage,
    handleToggleStar,
    handleDelete,
  } = useAIGenerationHistory();

  const [selected, setSelected] = useState<AIGeneration | null>(null);

  return (
    <div className="space-y-4">
      <AIGenerationHistoryFilters
        typeFilter={filters.generationType}
        isStarred={filters.isStarred}
        search={filters.search}
        onTypeChange={setTypeFilter}
        onStarredChange={setStarredFilter}
        onSearchChange={setSearchFilter}
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Card>
        <AIGenerationHistoryTable
          generations={generations}
          isLoading={isLoading}
          page={filters.page ?? 0}
          totalPages={totalPages}
          onPageChange={setPage}
          onSelect={setSelected}
          onToggleStar={handleToggleStar}
          onDelete={handleDelete}
        />
      </Card>

      <AIGenerationHistoryDetail
        generation={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        onToggleStar={(id) => {
          handleToggleStar(id);
          setSelected((prev) => prev ? { ...prev, is_starred: !prev.is_starred } : null);
        }}
      />
    </div>
  );
}
