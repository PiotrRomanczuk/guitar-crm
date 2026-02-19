'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Assignment {
  id: string;
  title: string | null;
  description: string | null;
  due_date: string | null;
  status: string | null;
}

interface UserAssignmentsProps {
  assignments: Assignment[] | null;
}

export default function UserAssignments({ assignments }: UserAssignmentsProps) {
  const total = assignments?.length || 0;
  const completed = assignments?.filter((a) => a.status === 'completed').length || 0;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <Card className="shadow-sm border-border overflow-hidden">
      <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              Assignments
              <span className="text-xs font-normal text-muted-foreground bg-white dark:bg-gray-800 px-2 py-1 rounded-full border shadow-sm">
                {completed}/{total} Completed
              </span>
            </CardTitle>
          </div>
          {total > 0 && (
            <div className="w-full sm:w-1/3 flex items-center gap-3">
              <Progress value={progress} className="h-2" />
              <span className="text-xs font-medium text-muted-foreground min-w-[3ch]">{Math.round(progress)}%</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {assignments && assignments.length > 0 ? (
          <div className="divide-y divide-border">
            {assignments.map((assignment) => {
              const isCompleted = assignment.status === 'completed';
              const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date() && !isCompleted;
              const statusColor = isCompleted ? 'border-l-green-500' : isOverdue ? 'border-l-red-500' : 'border-l-blue-500';

              return (
                <div
                  key={assignment.id}
                  className={`relative p-4 pl-4 hover:bg-muted/30 transition-colors border-l-4 ${statusColor} bg-card`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : isOverdue ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-blue-500" />
                        )}
                        <h4 className={`font-semibold text-sm ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {assignment.title || 'Untitled Assignment'}
                        </h4>
                      </div>

                      {assignment.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
                          {assignment.description}
                        </p>
                      )}

                      {assignment.due_date && (
                        <div className="pl-6 pt-1">
                          <p className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                            Due: {new Date(assignment.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            {isOverdue && <span className="ml-1 font-bold">(Overdue)</span>}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">✏️</span>
            </div>
            <p className="text-foreground font-medium">No assignments yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Assignments will appear here once assigned.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
