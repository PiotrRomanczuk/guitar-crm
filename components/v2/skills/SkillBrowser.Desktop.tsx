'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { staggerContainer, listItem } from '@/lib/animations/variants';
import type { Skill, SkillBrowserProps } from './SkillBrowser';

function SkillCardDesktop({ skill }: { skill: Skill }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            {skill.name}
          </p>
          {skill.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {skill.description}
            </p>
          )}
        </div>
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 shrink-0">
          {skill.category}
        </span>
      </div>
    </div>
  );
}

/**
 * Desktop skill browser with sidebar categories and grid layout.
 */
export default function SkillBrowserDesktop({
  skills,
  error,
}: SkillBrowserProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    string | null
  >(null);

  const categories = useMemo(() => {
    return [...new Set(skills.map((s) => s.category))].sort();
  }, [skills]);

  const filteredSkills = useMemo(() => {
    let result = skills;
    if (selectedCategory) {
      result = result.filter(
        (s) => s.category === selectedCategory
      );
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
  }, [skills, selectedCategory, search]);

  return (
    <div className="container mx-auto px-8 py-8 max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Skills
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and manage skill categories
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex gap-6">
        {/* Category sidebar */}
        <div className="w-48 shrink-0 space-y-1">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
              !selectedCategory
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            All ({skills.length})
          </button>
          {categories.map((cat) => {
            const count = skills.filter(
              (s) => s.category === cat
            ).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredSkills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-1">
                No skills found
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {filteredSkills.map((skill) => (
                <motion.div key={skill.id} variants={listItem}>
                  <SkillCardDesktop skill={skill} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
