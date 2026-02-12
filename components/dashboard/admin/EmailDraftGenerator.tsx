'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Mail, Loader2, Copy, Check, Send } from 'lucide-react';
import { generateEmailDraftStream } from '@/app/actions/ai';

interface Student {
  id: string;
  full_name: string | null;
  email: string;
}

interface Props {
  students: Student[];
}

export function EmailDraftGenerator({ students }: Props) {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [templateType, setTemplateType] = useState<
    'lesson_reminder' | 'progress_report' | 'payment_reminder' | 'milestone_celebration'
  >('lesson_reminder');
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);

  // Context fields for different template types
  const [lessonDate, setLessonDate] = useState('');
  const [lessonTime, setLessonTime] = useState('');
  const [practiceSongs, setPracticeSongs] = useState('');
  const [amount, setAmount] = useState('');
  const [achievement, setAchievement] = useState('');

  const handleGenerate = async () => {
    if (!selectedStudent) return;

    const selectedStudentData = students.find((s) => s.id === selectedStudent);
    if (!selectedStudentData) return;

    setLoading(true);
    try {
      // Prepare context based on template type
      let context: Record<string, unknown> = {};

      switch (templateType) {
        case 'lesson_reminder':
          context = {
            lesson_date: lessonDate,
            lesson_time: lessonTime,
            practice_songs: practiceSongs,
            notes: 'Looking forward to your lesson!',
          };
          break;
        case 'progress_report':
          context = {
            lesson_count: 10, // Mock data
            mastered_songs: practiceSongs || 'Wonderwall, Hotel California',
            current_songs: 'Stairway to Heaven',
            strengths: 'Great chord transitions',
            improvements: 'Rhythm timing',
            next_goals: 'Learn fingerpicking',
          };
          break;
        case 'payment_reminder':
          context = {
            amount: amount || '$100',
            due_date: new Date().toLocaleDateString(),
            lessons_remaining: 3,
            payment_method: 'Online payment or cash',
          };
          break;
        case 'milestone_celebration':
          context = {
            achievement: achievement || 'Completed first song',
            date: new Date().toLocaleDateString(),
            next_challenge: 'Learning barre chords',
          };
          break;
      }

      const streamGenerator = generateEmailDraftStream({
        template_type: templateType,
        student_name: selectedStudentData.full_name || selectedStudentData.email,
        studentId: selectedStudent,
        context: JSON.stringify(context),
      });

      let fullContent = '';
      for await (const chunk of streamGenerator) {
        fullContent = String(chunk);
        // Try to parse if it looks like JSON with subject and body
        try {
          if (fullContent.includes('"subject"') && fullContent.includes('"body"')) {
            const parsed = JSON.parse(fullContent);
            setSubject(String(parsed.subject || ''));
            setBody(String(parsed.body || ''));
          } else {
            // If not structured, put everything in body
            setBody(fullContent);
          }
        } catch {
          // If not valid JSON, just use as body content
          setBody(fullContent);
        }
      }
    } catch (error) {
      console.error('Error generating email draft:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      const emailText = `Subject: ${subject}\n\n${body}`;
      await navigator.clipboard.writeText(emailText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy email:', error);
    }
  };

  const selectedStudentData = students.find((s) => s.id === selectedStudent);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          AI Email Draft Generator
        </CardTitle>
        <CardDescription>Generate personalized emails for students using AI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Student</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name || student.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Email Type</Label>
            <Select value={templateType} onValueChange={(value: 'lesson_reminder' | 'progress_report' | 'payment_reminder' | 'milestone_celebration') => setTemplateType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lesson_reminder">Lesson Reminder</SelectItem>
                <SelectItem value="progress_report">Progress Report</SelectItem>
                <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                <SelectItem value="milestone_celebration">Milestone Celebration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Context fields based on template type */}
        {templateType === 'lesson_reminder' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Lesson Date</Label>
              <Input
                type="date"
                value={lessonDate}
                onChange={(e) => setLessonDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Lesson Time</Label>
              <Input
                type="time"
                value={lessonTime}
                onChange={(e) => setLessonTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Songs to Practice</Label>
              <Input
                value={practiceSongs}
                onChange={(e) => setPracticeSongs(e.target.value)}
                placeholder="Wonderwall, Hotel California"
              />
            </div>
          </div>
        )}

        {templateType === 'payment_reminder' && (
          <div className="space-y-2">
            <Label>Amount Due</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="$100" />
          </div>
        )}

        {templateType === 'milestone_celebration' && (
          <div className="space-y-2">
            <Label>Achievement</Label>
            <Input
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              placeholder="Completed first song"
            />
          </div>
        )}

        <Button onClick={handleGenerate} disabled={loading || !selectedStudent} className="w-full">
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Mail className="w-4 h-4 mr-2" />
          )}
          Generate Email Draft
        </Button>

        {selectedStudentData && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedStudentData.full_name}</p>
                <p className="text-sm text-muted-foreground">{selectedStudentData.email}</p>
              </div>
              <Badge variant="secondary">{templateType.replace('_', ' ')}</Badge>
            </div>
          </div>
        )}

        {subject && body && (
          <div className="space-y-4 p-4 bg-muted rounded-lg border">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Generated Email:</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                {selectedStudentData?.email && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const mailtoLink = `mailto:${
                        selectedStudentData.email
                      }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      window.open(mailtoLink);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <Label className="text-xs text-muted-foreground">Subject:</Label>
                <p className="font-medium">{subject}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Body:</Label>
                <Textarea
                  value={body}
                  readOnly
                  rows={8}
                  className="resize-none bg-background"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
