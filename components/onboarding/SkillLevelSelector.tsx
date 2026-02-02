'use client';

import * as React from 'react';
import { SelectableCard } from '@/components/ui/selectable-card';
import { Music, BarChart2, Sparkles } from 'lucide-react';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

interface SkillOption {
  id: SkillLevel;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SKILL_LEVELS: SkillOption[] = [
  {
    id: 'beginner',
    icon: <Music className="h-6 w-6" />,
    title: 'Beginner',
    description: 'I know a few chords or am just starting out.',
  },
  {
    id: 'intermediate',
    icon: <BarChart2 className="h-6 w-6" />,
    title: 'Intermediate',
    description: 'I can play songs and know some scales.',
  },
  {
    id: 'advanced',
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Advanced',
    description: 'I understand theory and can improvise freely.',
  },
];

interface SkillLevelSelectorProps {
  selectedLevel: SkillLevel | null;
  onChange: (level: SkillLevel) => void;
  className?: string;
}

/**
 * Radio card selector for skill level onboarding
 * Shows 3 options: Beginner, Intermediate, Advanced
 */
function SkillLevelSelector({
  selectedLevel,
  onChange,
  className,
}: SkillLevelSelectorProps) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-4">
        {SKILL_LEVELS.map((skill) => (
          <SelectableCard
            key={skill.id}
            selected={selectedLevel === skill.id}
            onSelect={() => onChange(skill.id)}
            icon={skill.icon}
            title={skill.title}
            description={skill.description}
            type="radio"
          />
        ))}
      </div>
    </div>
  );
}

export { SkillLevelSelector, SKILL_LEVELS, type SkillLevel };
