'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

interface Template {
  id: string;
  title: string;
  description: string | null;
}

interface AddAssignmentDialogProps {
  lessonId: string;
  studentId: string;
  teacherId: string;
}

export function AddAssignmentDialog({ lessonId, studentId, teacherId }: AddAssignmentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
  });

  // Load templates when dialog opens
  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('assignment_templates')
        .select('id, title, description')
        .eq('teacher_id', teacherId)
        .order('title');

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFormData({
        title: template.title,
        description: template.description || '',
        due_date: formData.due_date, // Keep the due date
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      // If "Save as Template" is checked and no template was selected, create a new template
      if (saveAsTemplate && !selectedTemplate) {
        const { error: templateError } = await supabase.from('assignment_templates').insert({
          title: formData.title,
          description: formData.description,
          teacher_id: teacherId,
        });

        if (templateError) {
          console.error('Error creating template:', templateError);
          // Continue anyway - we'll still create the assignment
        }
      }

      // Create the assignment
      const { error } = await supabase.from('assignments').insert({
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date || null,
        lesson_id: lessonId,
        student_id: studentId,
        teacher_id: teacherId,
        status: 'not_started',
      });

      if (error) throw error;

      // Reset form and close dialog
      setFormData({ title: '', description: '', due_date: '' });
      setSelectedTemplate('');
      setSaveAsTemplate(false);
      setOpen(false);
      router.refresh(); // Refresh to show the new assignment
    } catch (err) {
      console.error('Error creating assignment:', err);
      alert('Failed to create assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Assignment</DialogTitle>
            <DialogDescription>
              Create a new assignment for this lesson. You can use a template or create from
              scratch.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="scratch" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scratch">From Scratch</TabsTrigger>
              <TabsTrigger value="template">From Template</TabsTrigger>
            </TabsList>

            <TabsContent value="scratch" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Practice C major scale"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Assignment details..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="save-template"
                  checked={saveAsTemplate}
                  onCheckedChange={(checked) => setSaveAsTemplate(checked as boolean)}
                />
                <Label htmlFor="save-template" className="text-sm font-normal cursor-pointer">
                  Save as template for future use
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="template" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="template">Select Template</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No templates available
                      </div>
                    ) : (
                      templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="template-title">Title *</Label>
                    <Input
                      id="template-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-description">Description</Label>
                    <Textarea
                      id="template-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-due-date">Due Date</Label>
                    <Input
                      id="template-due-date"
                      type="datetime-local"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Assignment'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
