'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export function QuickStartChecklist() {
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('quick-start-dismissed');
    }
    return true;
  });
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: 'account', label: 'Account created', completed: true },
    { id: 'profile', label: 'Profile set up', completed: true },
  ]);

  useEffect(() => {
    // TODO: Re-enable when activity tracking is implemented
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('quick-start-dismissed', 'true');
    setIsDismissed(true);
  };

  const handleToggle = (id: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updatedItems);
    localStorage.setItem('quick-start-checklist', JSON.stringify(updatedItems));
  };

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  if (isDismissed) return null;

  return (
    <div className="bg-linear-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Getting Started
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Complete these steps to get the most out of Strummy
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss checklist"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold text-primary">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>

      {/* Checklist Items */}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <div
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                item.completed
                  ? 'bg-success/10 border border-success/20'
                  : 'border border-transparent'
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleToggle(item.id);
                }}
                className="shrink-0"
                disabled={item.id === 'account' || item.id === 'profile'}
              >
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <span
                className={`text-sm ${
                  item.completed
                    ? 'text-success line-through'
                    : 'text-foreground'
                }`}
              >
                {item.label}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Completion Message */}
      {percentage === 100 && (
        <div className="bg-background rounded-lg p-4 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">
            You&apos;re all set!
          </p>
          <p className="text-xs text-muted-foreground">
            You&apos;ve completed all the getting started tasks. Keep rocking!
          </p>
        </div>
      )}

      {/* Tip */}
      <div className="bg-primary/10 rounded-lg p-3">
        <p className="text-xs text-primary">
          <strong>Tip:</strong> Consistent practice 3-4 times per week yields the best results!
        </p>
      </div>
    </div>
  );
}
