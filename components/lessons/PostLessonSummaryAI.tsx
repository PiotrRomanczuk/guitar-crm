'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { generatePostLessonSummary } from '@/app/actions/ai';

interface Props {
  studentName: string;
  duration: number;
  songsPracticed: string[];
  newTechniques?: string[];
  struggles?: string[];
  successes?: string[];
  teacherNotes?: string;
  onSummaryGenerated?: (summary: string) => void;
}

export function PostLessonSummaryAI({
  studentName,
  duration,
  songsPracticed,
  newTechniques = [],
  struggles = [],
  successes = [],
  teacherNotes = '',
  onSummaryGenerated,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generatePostLessonSummary({
        studentName,
        duration,
        songsPracticed,
        newTechniques,
        struggles,
        successes,
        teacherNotes,
      });

      if (result.success && result.summary) {
        setSummary(result.summary);
        onSummaryGenerated?.(result.summary);
      } else {
        console.error('Failed to generate post-lesson summary:', result.error);
      }
    } catch (error) {
      console.error('Error generating post-lesson summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy summary:', error);
    }
  };

  const canGenerate = studentName && songsPracticed.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          AI Post-Lesson Summary
        </CardTitle>
        <CardDescription>Generate a comprehensive lesson summary for {studentName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Button
            onClick={handleGenerate}
            disabled={loading || !canGenerate}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate Summary
          </Button>
        </div>

        {summary && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Generated Summary:</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <Textarea
              value={summary}
              readOnly
              rows={8}
              className="resize-none bg-gray-50 dark:bg-gray-900"
            />
          </div>
        )}

        {!canGenerate && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please ensure student name and songs practiced are provided to generate a summary.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
