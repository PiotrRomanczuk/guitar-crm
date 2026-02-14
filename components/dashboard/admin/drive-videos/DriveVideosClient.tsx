'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCcw, HardDrive, FolderSync, ClipboardList, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { cardEntrance } from '@/lib/animations';
import { SyncedVideosTable, type SyncedVideo } from './SyncedVideosTable';
import { DriveScanTable, type ScanResult } from './DriveScanTable';
import { ReviewQueueTable, type ReviewQueueItem } from './ReviewQueueTable';
import { DuplicatesTable, type DuplicateVideo } from './DuplicatesTable';
import { useDriveScan } from './useDriveVideos';

interface ScanResponse {
  totalFiles: number;
  matched: number;
  reviewQueue: number;
  unmatched: number;
  skipped: number;
  results: ScanResult[];
  duplicates: DuplicateVideo[];
}

export function DriveVideosClient() {
  const [activeTab, setActiveTab] = useState<'synced' | 'scan' | 'review' | 'duplicates'>('synced');
  const [videos, setVideos] = useState<SyncedVideo[]>([]);
  const [scanData, setScanData] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/drive-videos');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to fetch videos');
      }
      const data = await res.json();
      setVideos(data.videos ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load synced videos';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Use TanStack Query for scan data
  const { data: scanDataQuery, isLoading: isLoadingScan, refetch: refetchScan } = useDriveScan();

  // Set scanData from query result
  useEffect(() => {
    if (scanDataQuery) {
      setScanData(scanDataQuery);
      setScanning(false);
    }
  }, [scanDataQuery]);

  // Fetch videos on synced tab
  useEffect(() => {
    if (activeTab === 'synced') fetchVideos();
  }, [activeTab, fetchVideos]);

  // Trigger scan on scan/review/duplicates tabs
  useEffect(() => {
    if ((activeTab === 'scan' || activeTab === 'review' || activeTab === 'duplicates') && !scanData && !isLoadingScan) {
      refetchScan();
      setScanning(true);
    }
  }, [activeTab, scanData, isLoadingScan, refetchScan]);

  const handleSyncMatched = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/drive-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Sync failed');
      }
      const data = await res.json();
      toast.success(`Synced ${data.inserted ?? 0} new videos`);
      setScanData(null);
      fetchVideos();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync videos';
      toast.error(message);
    } finally {
      setSyncing(false);
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'synced') {
      fetchVideos();
    } else {
      setScanData(null);
      setScanning(true);
      refetchScan();
    }
  };

  const matchedCount = scanData?.results.filter((r) => r.status === 'matched').length ?? 0;
  const reviewQueueItems: ReviewQueueItem[] = scanData?.results
    .filter((r) => r.status === 'review_queue')
    .map((r) => ({
      filename: r.filename,
      driveFileId: r.driveFileId,
      parsed: r.parsed,
      bestMatch: r.bestMatch,
      runnerUp: r.runnerUp,
    })) ?? [];
  const duplicateCount = scanData?.duplicates?.length ?? 0;

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="visible" className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'synced' | 'scan' | 'review' | 'duplicates')}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="synced" className="min-h-[44px]">
              <HardDrive className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Synced</span> {videos.length > 0 && activeTab === 'synced' && `(${videos.length})`}
            </TabsTrigger>
            <TabsTrigger value="scan" className="min-h-[44px]">
              <FolderSync className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Scan</span>
            </TabsTrigger>
            <TabsTrigger value="review" className="min-h-[44px]">
              <ClipboardList className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Review</span> {reviewQueueItems.length > 0 && activeTab === 'review' && `(${reviewQueueItems.length})`}
            </TabsTrigger>
            <TabsTrigger value="duplicates" className="min-h-[44px]">
              <Copy className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Dupes</span> {duplicateCount > 0 && activeTab === 'duplicates' && `(${duplicateCount})`}
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            {activeTab === 'scan' && scanData && matchedCount > 0 && (
              <Button size="sm" onClick={handleSyncMatched} disabled={syncing} className="min-h-[44px]">
                {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FolderSync className="w-4 h-4 mr-2" />}
                Sync {matchedCount} Matched
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || scanning} className="min-h-[44px]">
              <RefreshCcw className={`w-4 h-4 mr-2 ${loading || scanning ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <TabsContent value="synced" className="space-y-4 mt-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </motion.div>
            ) : videos.length === 0 ? (
              <EmptyState icon={<HardDrive className="w-12 h-12 text-muted-foreground/50" />} title="No synced videos" message="Run a Drive scan to find and sync videos." />
            ) : (
              <motion.div key="table" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <SyncedVideosTable videos={videos} onVideoUpdated={fetchVideos} onVideoDeleted={fetchVideos} />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="scan" className="space-y-4 mt-6">
          {scanData && (
            <div className="flex flex-wrap gap-3 mb-4">
              <StatBadge label="Total" value={scanData.totalFiles} />
              <StatBadge label="Matched" value={scanData.matched} variant="green" />
              <StatBadge label="Review Queue" value={scanData.reviewQueue} variant="yellow" />
              <StatBadge label="Unmatched" value={scanData.unmatched} variant="red" />
              <StatBadge label="Skipped" value={scanData.skipped} />
            </div>
          )}
          <AnimatePresence mode="wait">
            {scanning ? (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Scanning Google Drive...</p>
              </motion.div>
            ) : !scanData || scanData.results.length === 0 ? (
              <EmptyState icon={<FolderSync className="w-12 h-12 text-muted-foreground/50" />} title="No scan results" message="Click Refresh to scan Google Drive for video files." />
            ) : (
              <motion.div key="scan-table" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <DriveScanTable results={scanData.results} />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="review" className="space-y-4 mt-6">
          {scanData && (
            <div className="flex flex-wrap gap-3 mb-4">
              <StatBadge label="Review Queue" value={reviewQueueItems.length} variant="yellow" />
              <StatBadge label="High Score (70+)" value={reviewQueueItems.filter(i => i.bestMatch && i.bestMatch.score >= 70).length} variant="green" />
            </div>
          )}
          <AnimatePresence mode="wait">
            {scanning ? (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Scanning Google Drive...</p>
              </motion.div>
            ) : reviewQueueItems.length === 0 ? (
              <EmptyState icon={<ClipboardList className="w-12 h-12 text-muted-foreground/50" />} title="No videos to review" message="All videos have been matched or skipped. Run a new scan to check for new videos." />
            ) : (
              <motion.div key="review-table" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <ReviewQueueTable items={reviewQueueItems} onRefresh={handleRefresh} />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-4 mt-6">
          {scanData && duplicateCount > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              <StatBadge label="Duplicates" value={duplicateCount} />
            </div>
          )}
          <AnimatePresence mode="wait">
            {scanning ? (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Scanning Google Drive...</p>
              </motion.div>
            ) : !scanData?.duplicates || duplicateCount === 0 ? (
              <EmptyState icon={<Copy className="w-12 h-12 text-muted-foreground/50" />} title="No duplicate videos" message="All videos are unique. No duplicates found in the current scan." />
            ) : (
              <motion.div key="duplicates-table" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <DuplicatesTable duplicates={scanData.duplicates} />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function EmptyState({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 sm:py-16 text-center space-y-4 border-2 border-dashed border-border rounded-xl bg-muted/10">
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>{icon}</motion.div>
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      </div>
    </motion.div>
  );
}

function StatBadge({ label, value, variant }: { label: string; value: number; variant?: 'green' | 'yellow' | 'red' }) {
  const colorMap = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  const cls = variant ? colorMap[variant] : 'bg-muted text-muted-foreground';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${cls}`}>
      {label}: <span className="font-bold">{value}</span>
    </span>
  );
}
