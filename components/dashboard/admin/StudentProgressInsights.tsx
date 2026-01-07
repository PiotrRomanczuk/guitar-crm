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
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Brain, Loader2, User, Calendar } from 'lucide-react';
import { analyzeStudentProgress } from '@/app/actions/ai';

interface Student {
  id: string;
  full_name: string | null;
  email: string;
}

interface Props {
  students: Student[];
}

export function StudentProgressInsights({ students }: Props) {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [timePeriod, setTimePeriod] = useState<string>('last_30_days');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string>('');

  const handleAnalyze = async () => {
    if (!selectedStudent) return;

    setLoading(true);
    try {
      const result = await analyzeStudentProgress({
        studentId: selectedStudent,
        timePeriod:
          timePeriod === 'last_30_days'
            ? 'Last 30 days'
            : timePeriod === 'last_90_days'
            ? 'Last 90 days'
            : 'All time',
      });

      if (result.success && result.insights) {
        setInsights(String(result.insights)); // Ensure it's a string
      } else {
        console.error('Failed to analyze student progress:', result.error);
        setInsights('Failed to generate insights. Please try again.');
      }
    } catch (error) {
      console.error('Error analyzing student progress:', error);
      setInsights('An error occurred while analyzing progress.');
    } finally {
      setLoading(false);
    }
  };

  const selectedStudentData = students.find((s) => s.id === selectedStudent);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          AI Progress Insights
        </CardTitle>
        <CardDescription>
          Get detailed AI analysis of student learning patterns and progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Student</label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {student.full_name || student.email}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Time Period</label>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_30_days">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Last 30 days
                  </div>
                </SelectItem>
                <SelectItem value="last_90_days">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Last 90 days
                  </div>
                </SelectItem>
                <SelectItem value="all_time">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    All time
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleAnalyze} disabled={loading || !selectedStudent} className="w-full">
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <TrendingUp className="w-4 h-4 mr-2" />
          )}
          Analyze Progress
        </Button>

        {selectedStudentData && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900 dark:text-blue-100">
                {selectedStudentData.full_name || selectedStudentData.email}
              </span>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{timePeriod.replace('_', ' ')}</Badge>
            </div>
          </div>
        )}

        {insights && (
          <div className="space-y-2">
            <label className="text-sm font-medium">AI Insights:</label>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
              <div className="whitespace-pre-wrap text-sm">{insights}</div>
            </div>
          </div>
        )}

        {!selectedStudent && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Select a student to analyze their learning progress with AI
          </p>
        )}
      </CardContent>
    </Card>
  );
}
