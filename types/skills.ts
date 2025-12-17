export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentSkill {
  id: string;
  student_id: string;
  skill_id: string;
  status: 'todo' | 'in_progress' | 'mastered';
  notes: string | null;
  last_assessed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkillWithStudentStatus extends Skill {
  status: 'todo' | 'in_progress' | 'mastered' | null; // null if not assigned/tracked yet
  student_skill_id: string | null;
  notes: string | null;
}
