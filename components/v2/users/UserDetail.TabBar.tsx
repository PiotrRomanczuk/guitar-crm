'use client';

import {
  LayoutDashboard,
  BookOpen,
  Music,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const TABS = [
  { value: 'overview', label: 'Overview', icon: LayoutDashboard },
  { value: 'lessons', label: 'Lessons', icon: BookOpen },
  { value: 'repertoire', label: 'Songs', icon: Music },
  { value: 'assignments', label: 'Tasks', icon: ClipboardList },
] as const;

export type TabValue = (typeof TABS)[number]['value'];

interface TabBarProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}

export function UserDetailTabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange(tab.value)}
            className={cn(
              'flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-lg',
              'text-sm font-medium transition-colors min-h-[44px]',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
