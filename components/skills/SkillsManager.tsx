'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Skill } from '@/types/skills';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface Student {
  id: string;
  full_name: string | null;
  email: string;
}

interface SkillsManagerProps {
  initialSkills: Skill[];
  students: Student[];
}

export default function SkillsManager({ initialSkills, students }: SkillsManagerProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [assigningSkill, setAssigningSkill] = useState<Skill | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
  });

  // Get unique categories from existing skills
  const categories = Array.from(new Set(skills.map((s) => s.category))).sort();
  // Add some default categories if they don't exist
  const allCategories = Array.from(new Set([...categories, 'Technique', 'Theory', 'Repertoire', 'Improvisation'])).sort();

  const handleOpenDialog = (skill?: Skill) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData({
        name: skill.name,
        category: skill.category,
        description: skill.description || '',
      });
    } else {
      setEditingSkill(null);
      setFormData({
        name: '',
        category: '',
        description: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleOpenAssignDialog = (skill: Skill) => {
    setAssigningSkill(skill);
    setSelectedStudents([]);
    setIsAssignDialogOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningSkill || selectedStudents.length === 0) return;
    
    setIsLoading(true);
    try {
      const records = selectedStudents.map(studentId => ({
        student_id: studentId,
        skill_id: assigningSkill.id,
        status: 'todo',
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('student_skills')
        .upsert(records, { onConflict: 'student_id, skill_id', ignoreDuplicates: true });

      if (error) throw error;

      toast.success(`Skill assigned to ${selectedStudents.length} student(s)`);
      setIsAssignDialogOpen(false);
      setSelectedStudents([]);
      setAssigningSkill(null);
    } catch (error) {
      console.error('Error assigning skill:', error);
      toast.error('Failed to assign skill');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingSkill) {
        const { data, error } = await supabase
          .from('skills')
          .update({
            name: formData.name,
            category: formData.category,
            description: formData.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingSkill.id)
          .select()
          .single();

        if (error) throw error;

        setSkills(skills.map((s) => (s.id === editingSkill.id ? (data as Skill) : s)));
        toast.success('Skill updated successfully');
      } else {
        const { data, error } = await supabase
          .from('skills')
          .insert({
            name: formData.name,
            category: formData.category,
            description: formData.description,
          })
          .select()
          .single();

        if (error) throw error;

        setSkills([...skills, data as Skill]);
        toast.success('Skill added successfully');
      }
      setIsDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error saving skill:', error);
      toast.error('Failed to save skill');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      const { error } = await supabase.from('skills').delete().eq('id', id);
      if (error) throw error;
      setSkills(skills.filter((s) => s.id !== id));
      toast.success('Skill deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast.error('Failed to delete skill');
    }
  };

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Skills Library</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" /> Add Skill
        </Button>
      </div>

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
                    className="p-4 border rounded-lg flex justify-between items-start group hover:border-primary/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold">{skill.name}</h3>
                      {skill.description && (
                        <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Assign to students"
                        onClick={() => handleOpenAssignDialog(skill)}
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenDialog(skill)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(skill.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <div className="flex flex-col gap-2">
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                 placeholder="Or type new category..."
                 value={formData.category}
                 onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign "{assigningSkill?.name}"</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b">
                <Checkbox 
                  id="select-all" 
                  checked={selectedStudents.length === students.length && students.length > 0}
                  onCheckedChange={handleSelectAllStudents}
                />
                <Label htmlFor="select-all" className="font-bold">Select All Students</Label>
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`student-${student.id}`} 
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudentSelection(student.id)}
                    />
                    <Label htmlFor={`student-${student.id}`} className="cursor-pointer">
                      {student.full_name || student.email}
                    </Label>
                  </div>
                ))}
                {students.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No students found.</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || selectedStudents.length === 0}>
                {isLoading ? 'Assigning...' : `Assign to ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
