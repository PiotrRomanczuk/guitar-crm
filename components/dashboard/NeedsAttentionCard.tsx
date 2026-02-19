'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar, Clock, FileText, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { staggerContainer, listItem, cardEntrance } from '@/lib/animations';

interface AttentionItem {
  id: string;
  studentId: string;
  studentName: string;
  reason: 'no_recent_lesson' | 'overdue_assignment' | 'inactive';
  daysAgo: number;
  actionUrl: string;
}

const reasonConfig = {
  no_recent_lesson: {
    icon: Calendar,
    label: 'No recent lesson',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
  overdue_assignment: {
    icon: FileText,
    label: 'Overdue assignment',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  inactive: {
    icon: Clock,
    label: 'Inactive student',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
};

async function fetchNeedsAttention(): Promise<AttentionItem[]> {
  const response = await fetch('/api/students/needs-attention');
  if (!response.ok) {
    throw new Error('Failed to fetch needs attention');
  }
  return response.json();
}

export function NeedsAttentionCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['needs-attention'],
    queryFn: fetchNeedsAttention,
    refetchInterval: 120000, // Refetch every 2 minutes
  });

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Error loading alerts</CardTitle>
          <CardDescription>Failed to fetch students needing attention</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const itemsToShow = data?.slice(0, 5) || [];
  const totalCount = data?.length || 0;
  const hasMore = totalCount > 5;

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="visible">
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                Needs Attention
                {totalCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Badge variant="destructive" className="ml-1 sm:ml-2 text-[10px] sm:text-xs">
                      {totalCount}
                    </Badge>
                  </motion.div>
                )}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Students requiring follow-up
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 sm:space-y-3">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                >
                  <Skeleton className="h-14 sm:h-16" />
                </motion.div>
              ))}
            </div>
          ) : itemsToShow.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 sm:py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-green-500/10 mx-auto mb-3 flex items-center justify-center"
              >
                <AlertCircle className="h-6 w-6 text-green-500" />
              </motion.div>
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">
                No students need immediate attention
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              <AnimatePresence mode="popLayout">
                {itemsToShow.map((item) => {
                  const config = reasonConfig[item.reason];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={item.id}
                      variants={listItem}
                      layout
                      whileHover={{ scale: 1.01, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={item.actionUrl}
                        className={`block p-3 sm:p-4 rounded-lg border ${config.borderColor} ${config.bgColor} hover:shadow-sm transition-shadow min-h-[56px]`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-md ${config.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.studentName}</p>
                              <p className={`text-xs mt-0.5 ${config.color}`}>
                                {config.label} • {item.daysAgo} days ago
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {hasMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link href="/dashboard/users?filter=needs-attention">
                    <Button variant="outline" className="w-full mt-2 min-h-[44px]" size="sm">
                      View All {totalCount} Items
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
