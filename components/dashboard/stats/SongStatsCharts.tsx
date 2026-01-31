'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SongStats {
  levelStats: Record<string, number>;
  keyStats: Record<string, number>;
  topAuthorsList: Array<{ author: string; count: number }>;
}

async function fetchSongStats() {
  const res = await fetch('/api/song/stats');
  if (!res.ok) throw new Error('Failed to fetch song stats');
  return res.json();
}

// Chart colors using CSS custom properties for theme compatibility
const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(260 60% 60%)', // purple accent
  'hsl(var(--primary) / 0.6)',
];

export function SongStatsCharts() {
  const { data: songStats, isLoading } = useQuery<SongStats>({
    queryKey: ['admin-song-stats'],
    queryFn: fetchSongStats,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const levelData = Object.entries(songStats?.levelStats || {}).map(([name, value]) => ({
    name: name || 'Unknown',
    value,
  }));

  const authorData =
    songStats?.topAuthorsList?.map((item) => ({
      name: item.author,
      songs: item.count,
    })) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Songs by Level */}
      <Card>
        <CardHeader>
          <CardTitle>Songs by Difficulty</CardTitle>
          <CardDescription>Distribution of songs by difficulty level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={levelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {levelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Authors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Authors</CardTitle>
          <CardDescription>Most popular artists in the library</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={authorData} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                />
                <Bar dataKey="songs" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Data Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Difficulty Breakdown</CardTitle>
          <CardDescription>Song counts by level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-right">Songs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levelData.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">{item.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Author Statistics</CardTitle>
          <CardDescription>Top authors by song count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-right">Songs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {authorData.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">{item.songs}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
