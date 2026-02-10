'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { AIGeneration, AIGenerationType, AIGenerationFilters } from '@/types/ai-generation';
import { getAIGenerations, toggleAIGenerationStar, deleteAIGeneration } from '@/app/actions/ai-history';

const PAGE_SIZE = 20;

export function useAIGenerationHistory() {
  const [generations, setGenerations] = useState<AIGeneration[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AIGenerationFilters>({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const fetchIdRef = useRef(0);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    const id = ++fetchIdRef.current;

    getAIGenerations(filters).then((result) => {
      if (cancelled || id !== fetchIdRef.current) return;
      setGenerations(result.data);
      setTotal(result.total);
      setError(result.error ?? null);
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [filters]);

  const setTypeFilter = useCallback((type: AIGenerationType | undefined) => {
    setIsLoading(true);
    setFilters((prev) => ({ ...prev, generationType: type, page: 0 }));
  }, []);

  const setStarredFilter = useCallback((starred: boolean | undefined) => {
    setIsLoading(true);
    setFilters((prev) => ({ ...prev, isStarred: starred, page: 0 }));
  }, []);

  const setSearchFilter = useCallback((search: string) => {
    setIsLoading(true);
    setFilters((prev) => ({ ...prev, search: search || undefined, page: 0 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setIsLoading(true);
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleToggleStar = useCallback(async (id: string) => {
    const result = await toggleAIGenerationStar(id);
    if (result.success) {
      setGenerations((prev) =>
        prev.map((g) => (g.id === id ? { ...g, is_starred: !g.is_starred } : g))
      );
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const result = await deleteAIGeneration(id);
    if (result.success) {
      setGenerations((prev) => prev.filter((g) => g.id !== id));
      setTotal((prev) => prev - 1);
    }
  }, []);

  return {
    generations,
    total,
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
  };
}
