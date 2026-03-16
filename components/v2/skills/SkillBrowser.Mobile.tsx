'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, GraduationCap, RefreshCcw } from 'lucide-react';
import { MobilePageShell } from '@/components/v2/primitives';
import { CollapsibleFilterBar } from '@/components/v2/primitives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { staggerContainer, listItem } from '@/lib/animations/variants';
import type { Skill, SkillBrowserProps } from './SkillBrowser';

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 active:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            {skill.name}
          </p>
          {skill.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {skill.description}
            </p>
          )}
        </div>
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 shrink-0">
          {skill.category}
        </span>
      </div>
    </div>
  );
}

/**
 * Mobile skill browser with category chips and search.
 */
export function SkillBrowserMobile({
  skills,
  error,
  onRefresh,
}: SkillBrowserProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(
    null
  );

  const categories = useMemo(() => {
    const cats = [...new Set(skills.map((s) => s.category))].sort();
    return cats.map((c) => ({ label: c, value: c }));
  }, [skills]);

  const filteredSkills = useMemo(() => {
    let result = skills;
    if (categoryFilter) {
      result = result.filter((s) => s.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [skills, categoryFilter, search]);

  return (
    <MobilePageShell
      title="Skills"
      subtitle={`${skills.length} skills`}
      showBack
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          className="min-h-[44px] min-w-[44px]"
          onClick={onRefresh}
          aria-label="Refresh skills"
        >
          <RefreshCcw className="h-5 w-5" />
        </Button>
      }
    >
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 min-h-[44px] text-base"
        />
      </div>

      {/* Category filter chips */}
      {categories.length > 0 && (
        <CollapsibleFilterBar
          filters={categories}
          active={categoryFilter}
          onChange={setCategoryFilter}
          allLabel="All Categories"
        />
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {filteredSkills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <GraduationCap className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold mb-1">
            No skills found
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {search || categoryFilter
              ? 'Try adjusting your search or filter.'
              : 'Skills will appear here once configured.'}
          </p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {filteredSkills.map((skill) => (
            <motion.div key={skill.id} variants={listItem}>
              <SkillCard skill={skill} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </MobilePageShell>
  );
}
