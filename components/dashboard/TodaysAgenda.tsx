'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface AgendaItem {
  id: string;
  type: 'lesson' | 'assignment' | 'task';
  title: string;
  time?: string;
  studentName?: string;
  status: 'upcoming' | 'completed' | 'overdue';
  description?: string;
}

interface TodaysAgendaProps {
  items?: AgendaItem[];
}

const statusConfig = {
  upcoming: {
    icon: Clock,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    label: 'Upcoming',
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500/10',
    label: 'Done',
  },
  overdue: {
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500/10',
    label: 'Overdue',
  },
};

export function TodaysAgenda({ items = [] }: TodaysAgendaProps) {
  const todayItems = items.filter(() => true);

  const upcomingCount = todayItems.filter((item) => item.status === 'upcoming').length;
  const completedCount = todayItems.filter((item) => item.status === 'completed').length;
  const overdueCount = todayItems.filter((item) => item.status === 'overdue').length;

  return (
    <Card className="h-full relative">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 sm:space-y-1">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Today&apos;s Agenda
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">
              {format(new Date(), 'EEEE, MMM d')}
            </CardDescription>
          </div>
          <Link href="/dashboard/lessons">
            <Button size="sm" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
        {/* Compact Summary */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <div className="text-center p-1.5 sm:p-2 rounded-md bg-blue-500/10">
            <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
              {upcomingCount}
            </div>
            <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">
              Upcoming
            </div>
          </div>
          <div className="text-center p-1.5 sm:p-2 rounded-md bg-green-500/10">
            <div className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
              {completedCount}
            </div>
            <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">
              Done
            </div>
          </div>
          <div className="text-center p-1.5 sm:p-2 rounded-md bg-red-500/10">
            <div className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
              {overdueCount}
            </div>
            <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">
              Overdue
            </div>
          </div>
        </div>

        {/* Compact Items List */}
        <div className="space-y-2 max-h-100 overflow-y-auto">
          {todayItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">No items for today</p>
            </div>
          ) : (
            todayItems.map((item) => {
              const StatusIcon = statusConfig[item.status].icon;

              return (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`w-8 h-8 rounded-md ${
                        statusConfig[item.status].bgColor
                      } flex items-center justify-center shrink-0`}
                    >
                      <StatusIcon className={`h-4 w-4 ${statusConfig[item.status].color}`} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {item.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.time}
                          </span>
                        )}
                        {item.studentName && (
                          <span className="flex items-center gap-1 truncate">
                            <User className="h-3 w-3" />
                            <span className="truncate">{item.studentName}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
