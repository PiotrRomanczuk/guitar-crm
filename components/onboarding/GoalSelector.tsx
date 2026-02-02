'use client';

import * as React from 'react';
import { SelectableCard } from '@/components/ui/selectable-card';

interface Goal {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

const GOALS: Goal[] = [
  {
    id: 'songs',
    emoji: '🎸',
    title: 'Learn favorite songs',
    description: 'Master the classics',
  },
  {
    id: 'theory',
    emoji: '🎼',
    title: 'Music theory',
    description: 'Understand the fretboard',
  },
  {
    id: 'performance',
    emoji: '🎤',
    title: 'Performance skills',
    description: 'Stage presence & confidence',
  },
  {
    id: 'songwriting',
    emoji: '📝',
    title: 'Songwriting',
    description: 'Compose your own music',
  },
  {
    id: 'technique',
    emoji: '⚡',
    title: 'Improve technique',
    description: 'Speed, precision, dexterity',
  },
];

interface GoalSelectorProps {
  selectedGoals: string[];
  onChange: (goals: string[]) => void;
  className?: string;
}

/**
 * Multi-select goal cards for onboarding
 * Shows 5 goal options with emoji icons
 */
function GoalSelector({ selectedGoals, onChange, className }: GoalSelectorProps) {
  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      onChange(selectedGoals.filter((id) => id !== goalId));
    } else {
      onChange([...selectedGoals, goalId]);
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-col gap-3">
        {GOALS.map((goal) => (
          <SelectableCard
            key={goal.id}
            selected={selectedGoals.includes(goal.id)}
            onSelect={() => toggleGoal(goal.id)}
            emoji={goal.emoji}
            title={goal.title}
            description={goal.description}
            type="checkbox"
          />
        ))}
      </div>
    </div>
  );
}

export { GoalSelector, GOALS };
