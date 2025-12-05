import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RecentUser {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export function RecentActivity({ recentUsers }: { recentUsers: RecentUser[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">📋 Recent Users</CardTitle>
      </CardHeader>
      <CardContent>
        {recentUsers && recentUsers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No recent users yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
