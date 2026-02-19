'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, User, Clock, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getAuditLogs } from '@/app/dashboard/actions';

export function AuditLogSection() {
    const { data: logs, isLoading, error } = useQuery({
        queryKey: ['admin', 'audit-logs'],
        queryFn: () => getAuditLogs(10),
        refetchInterval: 60000, // Refresh every minute
    });

    if (error) {
        return (
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5" />
                        Audit Logs Error
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Failed to load system audit logs.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    System Audit Logs
                </CardTitle>
                <CardDescription>Recent administrative and system actions</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                ) : !logs || logs.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                        <p className="text-sm text-muted-foreground">No recent activity recorded.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Actor</TableHead>
                                    <TableHead className="text-right">Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log: any) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {log.action.replace(/_/g, ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium capitalize">{log.entity_type}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px]">
                                                    {log.entity_id}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {log.profiles?.full_name || 'System'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
