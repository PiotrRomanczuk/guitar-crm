'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Loader2, Users, DollarSign, Calendar, Music } from 'lucide-react';
import { generateAdminInsightsStream } from '@/app/actions/ai';

interface AdminStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalSongs: number;
  totalLessons: number;
  recentUsers: Array<{
    id: string;
    full_name: string | null;
    email: string | null;
    created_at: string;
  }>;
}

interface Props {
  adminStats: AdminStats;
}

export function AdminDashboardInsights({ adminStats }: Props) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setInsights(''); // Clear previous insights

    try {
      // Calculate some derived metrics
      const avgLessonsPerStudent =
        adminStats.totalStudents > 0
          ? (adminStats.totalLessons / adminStats.totalStudents).toFixed(1)
          : '0';

      const newStudentsThisMonth = adminStats.recentUsers.filter((user) => {
        const userDate = new Date(user.created_at);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return userDate > monthAgo;
      }).length;

      // Mock retention rate (in real app, this would be calculated from actual data)
      const retentionRate = 85; // 85%

      // Popular songs (mock data - in real app, fetch from lessons)
      const popularSongs = ['Wonderwall', 'Hotel California', 'Stairway to Heaven', 'Blackbird'];

      const streamGenerator = generateAdminInsightsStream({
        dashboardData: {
          totalStudents: adminStats.totalStudents,
          newStudents: newStudentsThisMonth,
          retentionRate,
          avgLessons: parseFloat(avgLessonsPerStudent),
          popularSongs,
          revenueData: 'Revenue tracking in development',
          teacherStats: `${adminStats.totalTeachers} active teachers`,
        },
      });

      for await (const chunk of streamGenerator) {
        setInsights(String(chunk));
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error generating admin insights:', error);
      setInsights('An error occurred while generating insights.');
    } finally {
      setLoading(false);
    }
  };

  const getMetricIcon = (value: number, threshold: number = 10) => {
    return value >= threshold ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingUp className="w-4 h-4 text-gray-400" />
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-orange-500" />
          Business Intelligence Insights
        </CardTitle>
        <CardDescription>
          AI-powered analysis of your music school performance and trends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Students</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{adminStats.totalStudents}</span>
              {getMetricIcon(adminStats.totalStudents, 5)}
            </div>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{adminStats.totalLessons}</span>
              {getMetricIcon(adminStats.totalLessons, 20)}
            </div>
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Music className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Songs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{adminStats.totalSongs}</span>
              {getMetricIcon(adminStats.totalSongs, 10)}
            </div>
          </div>

          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Teachers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{adminStats.totalTeachers}</span>
              {getMetricIcon(adminStats.totalTeachers, 1)}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button onClick={handleGenerate} disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="w-4 h-4 mr-2" />
            )}
            Generate AI Insights
          </Button>

          {lastUpdated && (
            <Badge variant="secondary" className="hidden sm:flex">
              Updated {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
        </div>

        {insights && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Intelligence Report:</label>
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border">
              <div className="whitespace-pre-wrap text-sm">{insights}</div>
            </div>
          </div>
        )}

        {!insights && !loading && (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click "Generate AI Insights" to get detailed business analysis
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
