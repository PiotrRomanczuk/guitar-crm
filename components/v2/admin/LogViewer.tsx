'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, RefreshCcw } from 'lucide-react';
import { MobilePageShell } from '@/components/v2/primitives';
import { CollapsibleFilterBar } from '@/components/v2/primitives';
import { Button } from '@/components/ui/button';
import { staggerContainer, listItem } from '@/lib/animations/variants';
import { LEVEL_FILTERS, SAMPLE_LOGS } from './LogViewer.types';
import type { LogEntry } from './LogViewer.types';
import { LogEntryRow } from './LogViewer.EntryRow';

/**
 * v2 LogViewer -- mobile-friendly log display with level filtering.
 * Uses placeholder data until /api/admin/logs is implemented.
 */
export function LogViewerV2({ isAdmin }: { isAdmin?: boolean }) {
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [logs] = useState<LogEntry[]>(SAMPLE_LOGS);

  const filteredLogs = levelFilter
    ? logs.filter((log) => log.level === levelFilter)
    : logs;

  const handleRefresh = useCallback(() => {
    // placeholder -- will fetch from API when available
  }, []);

  return (
    <MobilePageShell
      title="System Logs"
      subtitle={isAdmin ? 'All system activity' : 'Your activity logs'}
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          className="min-h-[44px] min-w-[44px]"
          onClick={handleRefresh}
          aria-label="Refresh logs"
        >
          <RefreshCcw className="h-5 w-5" />
        </Button>
      }
    >
      <CollapsibleFilterBar
        filters={LEVEL_FILTERS}
        active={levelFilter}
        onChange={setLevelFilter}
        allLabel="All Levels"
      />

      {filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <ScrollText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold mb-1">No logs</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {levelFilter
              ? `No ${levelFilter} level logs found.`
              : 'No log entries to display.'}
          </p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {filteredLogs.map((entry) => (
            <motion.div key={entry.id} variants={listItem}>
              <LogEntryRow entry={entry} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </MobilePageShell>
  );
}
