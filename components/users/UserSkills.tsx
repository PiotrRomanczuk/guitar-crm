'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SkillWithStudentStatus } from '@/types/skills';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface UserSkillsProps {
  studentId: string;
  initialSkills: SkillWithStudentStatus[];
}

export default function UserSkills({ studentId, initialSkills }: UserSkillsProps) {
  const [skills, setSkills] = useState<SkillWithStudentStatus[]>(initialSkills);
  const supabase = createClient();

  const handleStatusChange = async (skillId: string, newStatus: string) => {
    const skill = skills.find((s) => s.id === skillId);
    if (!skill) return;

    const previousStatus = skill.status;
    
    // Optimistic update
    setSkills(
      skills.map((s) =>
        s.id === skillId ? { ...s, status: newStatus === 'none' ? null : newStatus as 'todo' | 'in_progress' | 'mastered' } : s
      )
    );

    try {
      if (newStatus === 'none') {
         const { error } = await supabase
            .from('student_skills')
            .delete()
            .match({ student_id: studentId, skill_id: skillId });
            
         if (error) throw error;
         
         setSkills(
            skills.map((s) =>
              s.id === skillId ? { ...s, status: null, student_skill_id: null } : s
            )
          );
      } else {
        const { data, error } = await supabase
          .from('student_skills')
          .upsert({
            student_id: studentId,
            skill_id: skillId,
            status: newStatus,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'student_id, skill_id' })
          .select()
          .single();

        if (error) throw error;
        
        setSkills(
            skills.map((s) =>
              s.id === skillId ? { ...s, status: newStatus as 'todo' | 'in_progress' | 'mastered', student_skill_id: data.id } : s
            )
          );
      }
      toast.success('Status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      // Revert optimistic update
      setSkills(
        skills.map((s) =>
          s.id === skillId ? { ...s, status: previousStatus } : s
        )
      );
    }
  };

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, SkillWithStudentStatus[]>);

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'mastered':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusColor = (status: string | null) => {
      switch (status) {
      case 'mastered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'todo':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  }

  return (
    <div className="grid gap-6">
      {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categorySkills.map((skill) => (
                <div
                  key={skill.id}
                  className={`p-4 border rounded-lg flex flex-col gap-3 transition-colors ${
                      skill.status === 'mastered' ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' : 
                      skill.status === 'in_progress' ? 'bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{skill.name}</h3>
                      {skill.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2" title={skill.description}>
                            {skill.description}
                        </p>
                      )}
                    </div>
                    {getStatusIcon(skill.status)}
                  </div>
                  
                  <div className="mt-auto pt-2">
                    <Select
                      value={skill.status || 'none'}
                      onValueChange={(value) => handleStatusChange(skill.id, value)}
                    >
                      <SelectTrigger className={`w-full h-8 text-xs ${getStatusColor(skill.status)} border-0`}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not Started</SelectItem>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="mastered">Mastered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
